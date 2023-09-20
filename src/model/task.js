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
    throw new Error(error);
  }
};

//get the total count of tasks
export const getTotalTaskCount = async () => {
  try {
    const totalTask = await prisma.task.count({});
    return totalTask;
  } catch (error) {
    console.error("Error fetching the count of lists:", error);
    throw new Error(error);
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
        audio_duration: parseFloat(audio_duration),
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
    return tasksCreated;
  } catch (error) {
    console.error("Error creating tasks:", error);
    return { count: 0 };
  }
}

export const getUserSpecificTasksCount = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  try {
    if (fromDate && toDate) {
      console.log(
        "getUserSpecificTasksCount when both date are present",
        fromDate,
        toDate
      );
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
      console.log(
        "getUserSpecificTasksCount when only one date is present",
        fromDate,
        toDate
      );
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
  const { from: fromDate, to: toDate } = dates;
  let userTaskList;
  try {
    if (fromDate && toDate) {
      console.log(
        "getUserSpecificTasks when both date are present",
        fromDate,
        toDate
      );
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
      console.log(
        "getUserSpecificTasks when only one date is present",
        fromDate,
        toDate
      );
      userTaskList = await prisma.task.findMany({
        skip: skip,
        take: limit,
        where: {
          transcriber_id: parseInt(id),
          state: { in: ["submitted", "accepted", "finalised"] },
        },
      });
    }
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
  try {
    if (fromDate && toDate) {
      console.log(
        "getReviewerTaskCount when both date are present",
        fromDate,
        toDate
      );
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
      console.log(
        "getReviewerTaskCount when only one date is present",
        fromDate,
        toDate
      );
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
