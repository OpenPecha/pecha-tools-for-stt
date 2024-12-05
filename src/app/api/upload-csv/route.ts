import { NextRequest } from "next/server";
import { parse } from "papaparse";
import prisma from "@/service/db";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const groupIdString = formData.get("groupId") as string;
    const file = formData.get("file") as File;
    if (!groupIdString || !file) {
      return new Response(
        JSON.stringify({ message: "Group ID and file are required." }),
        { status: 400 }
      );
    }

    const groupId = Number(groupIdString);
    if (isNaN(groupId)) {
      return new Response(JSON.stringify({ message: "Invalid Group ID." }), {
        status: 400,
      });
    }

    const fileContent = await file.text();

    const parsedResult = parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      transform: (value, header) => {
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        if (header === "audio_duration" || header === "id") {
          const numValue = parseFloat(trimmedValue);
          return isNaN(numValue) ? 0 : numValue;
        }

        return trimmedValue || null;
      },
    });
    console.log("parsedResult", parsedResult);
    if (parsedResult.errors.length > 0) {
      console.error("CSV Parsing Errors:", parsedResult.errors);
      return new Response(
        JSON.stringify({
          message: "Error parsing CSV",
          errors: parsedResult.errors,
        }),
        { status: 400 }
      );
    }

    const tasks: Prisma.TaskCreateManyInput[] = parsedResult.data
      .map((row) => 
        ({
          id: row.id,
          group_id: groupId,
          state: row.state,
          inference_transcript: row.inference_transcript
            ? row.inference_transcript.slice(0, 500)
            : null,
          transcript: row.transcript ? row.transcript.slice(0, 500) : null,
          reviewed_transcript: row.reviewed_transcript
            ? row.reviewed_transcript.slice(0, 500)
            : null,
          final_transcript: row.final_transcript
            ? row.final_transcript.slice(0, 500)
            : null,
          file_name: row.file_name?.slice(0, 255) || "", 
          url: row.url || "",
          duration: row.duration || null,
          audio_duration: row.audio_duration || 0,
          created_at: new Date(), 
        }))
      .filter((task) => task.file_name && task.url);

    if (tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No valid tasks found in the CSV." }),
        { status: 400 }
      );
    }

    try {
      const result = await prisma.task.createMany({
        data: tasks,
        skipDuplicates: true, 
      });

      return new Response(
        JSON.stringify({
          message: "Tasks imported successfully!",
          importedCount: result.count,
        }),
        { status: 200 }
      );
    } catch (dbError) {
      // Handle potential unique constraint violations
      console.error("Database insertion error:", dbError);

      const errorMessage =
        dbError instanceof Error
          ? dbError.message
          : "Unique constraint violation or database error.";

      return new Response(
        JSON.stringify({
          message: "Error inserting tasks",
          error: errorMessage,
        }),
        { status: 409 } // Conflict status for unique constraint issues
      );
    }
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
