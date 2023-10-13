import prisma from "@/service/db";
import { NextResponse } from "next/server";

export async function GET() {
  //console.log("when unannotated api is call");
  try {
    const tasks = await prisma.task.findMany({});
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error creating post:", error);
  }
}
