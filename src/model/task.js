"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";
import { calculateAudioMinutes, splitIntoSyllables } from "./user";

export const getAllTask = async () => {
  try {
    const tasks = await prisma.task.findMany({});
    return tasks;
  } catch (error) {
    console.error("Error getting all the tasks:", error);
  }
};

export async function createTasksFromCSV(fileData, formData) {
  const groupId = formData.get("group_id");
  console.log("createTasksFromCSV called", "ID", groupId);

  // Create an array to hold task data
  const tasksToCreate = await Promise.all(
    fileData.map((row) => {
      // Extract data from the CSV row
      const inference_transcript = row.inference_transcript;
      const fileName = row.file_name;
      const url = row.url;

      // Return task data as an object
      return {
        group_id: parseInt(groupId),
        inference_transcript: inference_transcript,
        file_name: fileName,
        url: url,
      };
    })
  );

  try {
    // Use createMany to insert all tasks at once
    const tasksCreated = await prisma.task.createMany({
      data: tasksToCreate,
      skipDuplicates: true,
    });
    revalidatePath("/dashboard/task");
    console.log("Tasks created", tasksCreated);
    return tasksCreated;
  } catch (error) {
    console.error("Error creating tasks:", error);
    return { count: 0 };
  }
}

// export async function createTasksFromCSV(formData) {
//   const groupId = formData.get("group_id");
//   const csvFile = formData.get("file_name");
//   const csvFilePath = "/Users/tenzintamdin/Desktop/test_csv.csv";

//   console.log(
//     "createTasksFromCSV called",
//     "ID",
//     groupId,
//     "file name:",
//     csvFilePath
//   );
//   const tasks = [];

//   fs.createReadStream(csvFilePath)
//     .pipe(csvParser())
//     .on("data", async (row) => {
//       console.log("rows", row);
//       // Extract data from the CSV row
//       const inference_transcript = row.inference_transcript;
//       const fileName = row.file_name;
//       const url = row.url;

//       // Create a new task in the database
//       const task = await prisma.task.create({
//         data: {
//           group_id: parseInt(groupId),
//           inference_transcript: inference_transcript,
//           file_name: fileName,
//           url: url,
//         },
//       });
//       tasks.push(task);
//     })
//     .on("end", async () => {
//       // Insert all tasks into the database
//       await prisma.$transaction(tasks);
//       console.log("Tasks created successfully");
//     });
// }

export const getUserSpecificTasks = async (id, dates) => {
  console.log("id", id, dates);
  const { from: fromDate, to: toDate } = dates;
  let userTaskList;
  try {
    if (fromDate && toDate) {
      console.log("when both are present", fromDate, toDate);
      userTaskList = await prisma.task.findMany({
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
          submitted_at: {
            gte: new Date(fromDate).toISOString(),
            lte: new Date(toDate).toISOString(),
          },
        },
      });
    } else {
      console.log("when only one is present", fromDate, toDate);
      userTaskList = await prisma.task.findMany({
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
        },
      });
    }
    console.log("userTaskList", userTaskList);
    for (const task of userTaskList) {
      const mins = calculateAudioMinutes(task);
      task.audio_duration = mins;

      if (
        task.state === "submitted" ||
        task.state === "accepted" ||
        task.state === "finalised"
      ) {
        const { transcript } = task;
        task.transcriptSyllableCount = splitIntoSyllables(transcript).length;
      }
      if (task.state === "accepted" || task.state === "finalised") {
        const { reviewed_transcript } = task;
        task.reviewedSyllableCount =
          splitIntoSyllables(reviewed_transcript).length;
      }
    }
    return userTaskList;
  } catch (error) {
    throw new Error(error);
  }
};
