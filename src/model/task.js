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
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      role: true,
    },
  });
  const userRole = user.role;
  let userTaskCount;
  try {
    if (fromDate && toDate) {
      console.log(
        "getUserSpecificTasksCount when both date are present",
        fromDate,
        toDate,
        userRole
      );
      switch (userRole) {
        case "TRANSCRIBER":
          userTaskCount = await prisma.task.count({
            where: {
              transcriber_id: parseInt(id),
              state: { in: ["submitted", "accepted", "finalised"] },
              submitted_at: {
                gte: new Date(fromDate).toISOString(),
                lte: new Date(toDate).toISOString(),
              },
            },
          });
          break;
        case "REVIEWER":
          userTaskCount = await prisma.task.count({
            where: {
              reviewer_id: parseInt(id),
              state: { in: ["accepted", "finalised"] },
              reviewed_at: {
                gte: new Date(fromDate).toISOString(),
                lte: new Date(toDate).toISOString(),
              },
            },
          });
          break;
        case "FINAL_REVIEWER":
          userTaskCount = await prisma.task.count({
            where: {
              final_reviewer_id: parseInt(id),
              state: { in: ["finalised"] },
              reviewed_at: {
                gte: new Date(fromDate).toISOString(),
                lte: new Date(toDate).toISOString(),
              },
            },
          });
          break;
        default:
          break;
      }
      return userTaskCount;
    } else {
      console.log(
        "getUserSpecificTasksCount when only one or no date is present",
        fromDate,
        toDate
      );
      switch (userRole) {
        case "TRANSCRIBER":
          userTaskCount = await prisma.task.count({
            where: {
              transcriber_id: parseInt(id),
              state: { in: ["submitted", "accepted", "finalised"] },
            },
          });
          break;
        case "REVIEWER":
          userTaskCount = await prisma.task.count({
            where: {
              reviewer_id: parseInt(id),
              state: { in: ["accepted", "finalised"] },
            },
          });
          break;
        case "FINAL_REVIEWER":
          userTaskCount = await prisma.task.count({
            where: {
              final_reviewer_id: parseInt(id),
              state: { in: ["finalised"] },
            },
          });
          break;
        default:
          break;
      }
      console.log("userTaskCount", userTaskCount);
      return userTaskCount;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserSpecificTasks = async (id, limit, skip, dates) => {
  const { from: fromDate, to: toDate } = dates;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      role: true,
    },
  });
  const userRole = user.role;
  let userTaskList;
  try {
    if (fromDate && toDate) {
      console.log(
        "getUserSpecificTasks when both date are present",
        fromDate,
        toDate,
        userRole
      );
      switch (userRole) {
        case "TRANSCRIBER":
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
          break;
        case "REVIEWER":
          userTaskList = await prisma.task.findMany({
            skip: skip,
            take: limit,
            where: {
              reviewer_id: parseInt(id),
              state: { in: ["accepted", "finalised"] },
              reviewed_at: {
                gte: new Date(fromDate).toISOString(),
                lte: new Date(toDate).toISOString(),
              },
            },
          });
          break;
        case "FINAL_REVIEWER":
          userTaskList = await prisma.task.findMany({
            skip: skip,
            take: limit,
            where: {
              final_reviewer_id: parseInt(id),
              state: { in: ["finalised"] },
              reviewed_at: {
                gte: new Date(fromDate).toISOString(),
                lte: new Date(toDate).toISOString(),
              },
            },
          });
          break;
        default:
          break;
      }
    } else {
      console.log(
        "getUserSpecificTasks when only one or no date is present",
        fromDate,
        toDate
      );
      switch (userRole) {
        case "TRANSCRIBER":
          userTaskList = await prisma.task.findMany({
            skip: skip,
            take: limit,
            where: {
              transcriber_id: parseInt(id),
              state: { in: ["submitted", "accepted", "finalised"] },
            },
          });
          break;
        case "REVIEWER":
          userTaskList = await prisma.task.findMany({
            skip: skip,
            take: limit,
            where: {
              reviewer_id: parseInt(id),
              state: { in: ["accepted", "finalised"] },
            },
          });
          break;
        case "FINAL_REVIEWER":
          userTaskList = await prisma.task.findMany({
            skip: skip,
            take: limit,
            where: {
              final_reviewer_id: parseInt(id),
              state: { in: ["finalised"] },
            },
          });
          break;
        default:
          break;
      }
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
        "getReviewerTaskCount when one or no date is present",
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

export const getTranscriberTaskList = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  try {
    if (fromDate && toDate) {
      console.log(
        "getTranscriberTaskList with both date are present",
        fromDate,
        toDate
      );
      const filteredTasks = await prisma.task.findMany({
        where: {
          transcriber_id: id,
          reviewed_at: {
            gte: new Date(fromDate),
            lte: new Date(toDate),
          },
        },
        select: {
          audio_duration: true,
          reviewed_transcript: true,
          state: true,
        },
      });
      return filteredTasks;
    } else {
      console.log(
        "getTranscriberTaskList when one or no date is present",
        fromDate,
        toDate
      );
      const filteredTasks = await prisma.task.findMany({
        where: {
          transcriber_id: id,
        },
        select: {
          audio_duration: true,
          reviewed_transcript: true,
          state: true,
        },
      });
      return filteredTasks;
    }
  } catch (error) {
    throw new Error(error);
  }
};

// get total count of tasks assigned to a group based on group id
const getGroupTaskCount = async (id) => {
  try {
    const groupTaskCount = await prisma.task.count({
      where: {
        group_id: parseInt(id),
      },
    });
    return groupTaskCount;
  } catch (error) {
    throw new Error(error);
  }
};

// get user progress based on the role, user id and group id
export const UserProgressStats = async (id, role, groupId) => {
  let completedTaskCount;
  let totalTaskCount;
  try {
    completedTaskCount = await getCompletedTaskCount(id, role);
    switch (role) {
      case "TRANSCRIBER":
        totalTaskCount = await getGroupTaskCount(groupId);
        break;
      case "REVIEWER":
        totalTaskCount = await prisma.task.count({
          where: {
            group_id: parseInt(groupId),
            state: { in: ["submitted", "accepted", "finalised"] },
          },
        });
        break;
      case "FINAL_REVIEWER":
        totalTaskCount = await prisma.task.count({
          where: {
            group_id: parseInt(groupId),
            state: { in: ["accepted", "finalised"] },
          },
        });
        break;
      default:
        break;
    }
    console.log(
      "completedTaskCount",
      completedTaskCount,
      "totalTaskCount",
      totalTaskCount
    );
    return { completedTaskCount, totalTaskCount };
  } catch (error) {
    throw new Error(error);
  }
};
