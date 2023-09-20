"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";
import { calculateAudioMinutes, splitIntoSyllables } from "./user";

// get all tasks basd on the search params
export const getAllTask = async (limit, skip) => {
  try {
    const tasks = await prisma.task.findMany({
      skip: skip,
      take: limit,
    });
    return tasks;
  } catch (error) {
    console.error("Error getting all the tasks:", error);
  }
};

//get the total count of tasks
export const getTotalTaskCount = async () => {
  try {
    const totalTask = await prisma.task.count({});
    return totalTask;
  } catch (error) {
    console.error("Error fetching the count of lists:", error);
    throw error;
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
      const audio_duration = row.audio_duration;

      // Return task data as an object
      return {
        group_id: parseInt(groupId),
        inference_transcript: inference_transcript,
        file_name: fileName,
        url: url,
        audio_duration: audio_duration
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

export const getUserSpecificTasksCount = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  console.log("fromDate", fromDate, "toDate", toDate);
  try {
    if (fromDate && toDate) {
      console.log("when both are present", fromDate, toDate);
      const userTaskCount = await prisma.task.count({
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
          submitted_at: {
            gte: new Date(fromDate).toISOString(),
            lte: new Date(toDate).toISOString(),
          },
        },
      });
      return userTaskCount;
    } else {
      console.log("when only one is present", fromDate, toDate);
      const userTaskCount = await prisma.task.count({
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
        },
      });
      return userTaskCount;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserSpecificTasks = async (id, limit, skip, dates) => {
  console.log("id", id, "limit", limit, "skip", skip, "dates", dates);
  const { from: fromDate, to: toDate } = dates;
  console.log("fromDate", fromDate, "toDate", toDate);
  let userTaskList;
  try {
    if (fromDate && toDate) {
      console.log("when both are present", fromDate, toDate);
      userTaskList = await prisma.task.findMany({
        skip: skip,
        take: limit,
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
        skip: skip,
        take: limit,
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
        },
      });
    }
    console.log("userTaskList", userTaskList, userTaskList.length);
    for (const task of userTaskList) {
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

export const getCompletedTaskCount = async (id, role) => {
  try {
    switch (role) {
      case "TRANSCRIBER":
        try {
          const completedTaskCount = await prisma.task.count({
            where: {
              transcriber_id: parseInt(id),
              state: { in: ["submitted", "accepted", "finalised"] },
            },
          });
          return completedTaskCount;
          break;
        } catch (error) {
          throw new Error(error);
        }
      case "REVIEWER":
        try {
          const completedTaskCount = await prisma.task.count({
            where: {
              reviewer_id: parseInt(id),
              state: { in: ["accepted", "finalised"] },
            },
          });
          return completedTaskCount;
          break;
        } catch (error) {
          throw new Error(error);
        }
      case "FINAL_REVIEWER":
        try {
          const completedTaskCount = await prisma.task.count({
            where: {
              final_reviewer_id: parseInt(id),
              state: { in: ["finalised"] },
            },
          });
          return completedTaskCount;
          break;
        } catch (error) {
          throw new Error(error);
        }
      default:
        break;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getReviewerTaskCount = async (id, dates, reviewerObj) => {
  const { from: fromDate, to: toDate } = dates;
  console.log("getReviewerTaskCount fromDate", fromDate, "toDate", toDate, reviewerObj);
  try {
    if (fromDate && toDate) {
      console.log("when both are present", fromDate, toDate);
      reviewerObj.noReviewed = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: { in: ["accepted", "finalised"] },
          reviewed_at: {
            gte: new Date(fromDate).toISOString(),
            lte: new Date(toDate).toISOString(),
          },
        },
      });
      reviewerObj.noAccepted = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: "accepted",
          reviewed_at: {
            gte: new Date(fromDate).toISOString(),
            lte: new Date(toDate).toISOString(),
          },
        },
      });
      reviewerObj.noFinalised = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: "finalised",
          reviewed_at: {
            gte: new Date(fromDate).toISOString(),
            lte: new Date(toDate).toISOString(),
          },
        },
      });
    } else {
      console.log("when only one is present", fromDate, toDate);
      reviewerObj.noReviewed = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: { in: ["accepted", "finalised"] },
        },
      });
      reviewerObj.noAccepted = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: "accepted",
        },
      });
      reviewerObj.noFinalised = await prisma.task.count({
        where: {
          reviewer_id: parseInt(id),
          state: "finalised",
        },
      });
    }
    return reviewerObj;
  } catch (error) {
    throw new Error(error);
  }
};
