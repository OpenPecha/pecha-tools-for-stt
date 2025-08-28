"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";
import { splitIntoSyllables } from "./user";
import { utcToIst } from "@/lib/istCurrentTime";

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
    throw new Error("Failed to fetch all tasks.");
  }
};

//get the total count of tasks
export const getTotalTaskCount = async () => {
  try {
    const totalTask = await prisma.task.count({});
    return totalTask;
  } catch (error) {
    console.error("Error fetching the count of lists:", error);
    throw new Error("Failed to fetch the count of all tasks.");
  }
};

export async function createTasksFromCSV(formData) {
  let tasksToCreate = [];
  try {
    const groupId = formData.get("group_id");
    const tasksFile = formData.get("tasks");
    const parsedTasksFile = JSON.parse(tasksFile);
    // Create an array to hold task data
    tasksToCreate = await Promise.all(
      parsedTasksFile.map((row) => {
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
  } catch (error) {
    console.error("Error parsing tasks file:", error);
    return { count: 0 };
  }

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
    where: { id: parseInt(id) },
    select: { role: true },
  });

  if (!user) throw new Error(`User with ID ${id} not found.`);

  // Define the state based on user role
  let stateFilter;
  if (user.role === "TRANSCRIBER") {
    stateFilter = { in: ["submitted", "accepted", "finalised"] };
  } else if (user.role === "REVIEWER") {
    stateFilter = { in: ["accepted", "finalised"] };
  } else {
    stateFilter = { in: ["finalised"] }; // FINAL_REVIEWER case
  }

  // Define the base condition for task counting based on the user's role
  let baseWhereCondition = {
    [`${user.role.toLowerCase()}_id`]: parseInt(id),
    state: stateFilter,
  };

  let dateFieldName;
  if (user.role === "TRANSCRIBER") {
    dateFieldName = "submitted_at";
  } else if (user.role === "REVIEWER") {
    dateFieldName = "reviewed_at";
  } else {
    dateFieldName = "finalised_reviewed_at";
  }
  // Extend the base condition with date filters if both fromDate and toDate are provided
  if (fromDate && toDate) {
    // Applies to REVIEWER and FINAL_REVIEWER
    baseWhereCondition[dateFieldName] = {
      gte: utcToIst(new Date(fromDate)),
      lte: utcToIst(new Date(toDate)),
    };
  }

  try {
    const userTaskCount = await prisma.task.count({
      where: baseWhereCondition,
    });
    return userTaskCount;
  } catch (error) {
    console.error(`Error fetching tasks count for user with ID ${id}:`, error);
    throw new Error("Failed to fetch user-specific tasks count.");
  }
};

export const getUserSpecificTasks = async (id, limit, skip, dates) => {
  const { from: fromDate, to: toDate } = dates;

  // Attempt to retrieve the user and their role
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: { role: true },
  });

  if (!user) throw new Error(`User with ID ${id} not found.`);

  let whereCondition = {
    [`${user.role.toLowerCase()}_id`]: parseInt(id),
    // Generic state filter applied to all roles. Adjust as necessary.
    state:
      user.role === "TRANSCRIBER"
        ? { in: ["submitted", "accepted", "finalised"] }
        : user.role === "REVIEWER"
        ? { in: ["accepted", "finalised"] }
        : { in: ["finalised"] },
  };

  // Adjust the `whereCondition` based on dates if provided
  if (fromDate && toDate) {
    const dateField =
      user.role === "TRANSCRIBER"
        ? "submitted_at"
        : user.role === "REVIEWER"
        ? "reviewed_at"
        : "finalised_reviewed_at";
    whereCondition[dateField] = {
      gte: new Date(fromDate),
      lte: new Date(toDate),
    };
  }

  try {
    // Fetch tasks based on the constructed whereCondition
    const userTaskList = await prisma.task.findMany({
      skip: skip,
      take: limit,
      where: whereCondition,
      include: {
        transcriber: { select: { name: true } },
        reviewer: { select: { name: true } },
        final_reviewer: { select: { name: true } },
      },
      orderBy: [
        {
          finalised_reviewed_at: "desc",
        },
        {
          reviewed_at: "desc",
        },
        {
          submitted_at: "desc",
        },
      ],
    });

    // Compute syllable counts without mutating original task objects
    const tasksWithSyllableCounts = userTaskList.map((task) => ({
      ...task,
      transcriptSyllableCount: task.transcript
        ? splitIntoSyllables(task.transcript).length
        : 0,
      reviewedSyllableCount: task.reviewed_transcript
        ? splitIntoSyllables(task.reviewed_transcript).length
        : 0,
    }));
    return tasksWithSyllableCounts;
  } catch (error) {
    console.error(`Error fetching tasks for user with ID ${id}:`, error);
    throw new Error(`Failed to fetch tasks for user with role ${user.role}.`);
  }
};

export const getCompletedTaskCount = async (id, role, groupId) => {
  let completedTaskCount = 0;
  let whereCondition = {
    [`${role.toLowerCase()}_id`]: parseInt(id),
    state:
      role === "TRANSCRIBER"
        ? { in: ["submitted", "accepted", "finalised"] }
        : role === "REVIEWER"
        ? { in: ["accepted", "finalised"] }
        : "finalised",
    group_id: parseInt(groupId),
  };

  try {
    completedTaskCount = await prisma.task.count({
      where: whereCondition,
    });
    return completedTaskCount;
  } catch (error) {
    console.error(
      `Error fetching completed tasks for user with ID ${id}:`,
      error
    );
    throw new Error(
      `Failed to fetch completed tasks for user with role ${role}.`
    );
  }
};

export const getReviewerTaskCount = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  const reviewerId = parseInt(id);

  // Construct the base query condition
  const baseWhere = {
    reviewer_id: reviewerId,
    reviewed_at:
      fromDate && toDate
        ? {
            gte: utcToIst(new Date(fromDate)),
            lte: utcToIst(new Date(toDate)),
          }
        : undefined,
  };

  try {
    // Count all reviewed tasks (either accepted or finalised)
    const reviewedStats = await prisma.task.aggregate({
      where: {
        ...baseWhere,
        state: { in: ["accepted", "finalised"] },
      },
      _count: true,
      _sum: {
        audio_duration: true,
      },
    });
    const noReviewed = reviewedStats._count || 0;
    const reviewedSecs = reviewedStats._sum.audio_duration || 0;
    // Count tasks in accepted state
    const noAccepted = await prisma.task.count({
      where: {
        ...baseWhere,
        state: "accepted",
      },
    });

    // Count tasks in finalised state
    const noFinalised = await prisma.task.count({
      where: {
        ...baseWhere,
        state: "finalised",
      },
    });

    return {
      noReviewed,
      noAccepted,
      noFinalised,
      reviewedSecs,
    };
  } catch (error) {
    console.error(`Error fetching reviewer task counts:`, error);
    throw new Error(`Failed to fetch reviewer task counts. ${error.message}`);
  }
};

export const getFinalReviewerTaskCount = async (
  id,
  dates,
  finalReviewerObj,
  groupId
) => {
  const { from: fromDate, to: toDate } = dates;
  const finalReviewerId = parseInt(id);

  const baseWhereCondition = {
    final_reviewer_id: finalReviewerId,
    group_id: parseInt(groupId),
    finalised_reviewed_at:
      fromDate && toDate
        ? {
            gte: utcToIst(new Date(fromDate)),
            lte: utcToIst(new Date(toDate)),
          }
        : undefined,
  };

  try {
    const finalReviedStats = await prisma.task.aggregate({
      where: {
        ...baseWhereCondition,
        state: "finalised",
      },
      _count: true,
      _sum: {
        audio_duration: true,
      },
    });
    const noFinalised = finalReviedStats._count || 0;
    const finalisedSecs = finalReviedStats._sum.audio_duration || 0;
    finalReviewerObj.noFinalised = noFinalised;
    finalReviewerObj.finalisedInMin = (finalisedSecs / 60).toFixed(2);
    return finalReviewerObj;
  } catch (error) {
    console.error(`Error fetching final reviewer stats:`, error);
    throw new Error("Failed to fetch final reviewer stats.");
  }
};

export const getTranscriberTaskList = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  try {
    if (fromDate && toDate) {
      const filteredTasks = await prisma.task.findMany({
        where: {
          transcriber_id: id,
          reviewed_at: {
            gte: utcToIst(new Date(fromDate)),
            lte: utcToIst(new Date(toDate)),
          },
        },
        select: {
          inference_transcript: true,
          transcript: true,
          reviewed_transcript: true,
          state: true,
          transcriber_is_correct: true,
        },
      });
      return filteredTasks;
    } else {
      const filteredTasks = await prisma.task.findMany({
        where: {
          transcriber_id: id,
        },
        select: {
          inference_transcript: true,
          transcript: true,
          reviewed_transcript: true,
          state: true,
          transcriber_is_correct: true,
        },
      });
      return filteredTasks;
    }
  } catch (error) {
    console.error("Error fetching transcriber task list:", error);
    throw new Error("Failed to fetch transcriber task list.");
  }
};

export const getReviewerTaskList = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  try {
    if (fromDate && toDate) {
      const filteredTasks = await prisma.task.findMany({
        where: {
          reviewer_id: id,
          reviewed_at: {
            gte: utcToIst(new Date(fromDate)),
            lte: utcToIst(new Date(toDate)),
          },
        },
        select: {
          state: true,
          reviewed_transcript: true,
          final_transcript: true,
          reviewer_is_correct: true,
        },
      });
      return filteredTasks;
    } else {
      const filteredTasks = await prisma.task.findMany({
        where: {
          reviewer_id: id,
        },
        select: {
          state: true,
          reviewed_transcript: true,
          final_transcript: true,
          reviewer_is_correct: true,
        },
      });
      return filteredTasks;
    }
  } catch (error) {
    throw new Error(error);
  }
};

// get user progress based on the role, user id and group id
export const UserProgressStats = async (id, role, groupId) => {
  let completedTaskCount = 0;
  let totalTaskCount = 0;
  let totalTaskPassed = 0;
  try {
    completedTaskCount = await getCompletedTaskCount(id, role, groupId);
    totalTaskCount = await prisma.task.count({
      where: {
        group_id: parseInt(groupId),
        [`${role.toLowerCase()}_id`]: parseInt(id),
      },
    });
    totalTaskPassed = await prisma.task.count({
      where: {
        [`${role.toLowerCase()}_id`]: parseInt(id),
        group_id: parseInt(groupId),
        state:
          role === "TRANSCRIBER"
            ? { in: ["accepted", "finalised"] }
            : "finalised",
      },
    });
    return { completedTaskCount, totalTaskCount, totalTaskPassed };
  } catch (error) {
    throw new Error(error);
  }
};

export const getTaskWithRevertedState = async (task, role) => {
  try {
    let newState;

    if (
      task.state === "submitted" ||
      (role === "TRANSCRIBER" && task.state === "trashed")
    ) {
      newState = "transcribing";
    }
    if (
      task.state === "accepted" ||
      (role === "REVIEWER" && task.state === "trashed")
    ) {
      newState = "submitted";
    }
    if (
      task.state === "finalised" ||
      (role === "FINAL_REVIEWER" && task.state === "trashed")
    ) {
      newState = "accepted";
    }
    const updatedTask = await prisma.task.update({
      where: {
        id: parseInt(task.id),
      },
      data: {
        state: newState,
      },
      include: {
        transcriber: {
          select: { name: true },
        },
        reviewer: {
          select: { name: true },
        },
      },
    });
    revalidatePath("/");
    return updatedTask;
  } catch (error) {
    console.error("Error getting reverted state task:", error);
    throw new Error(error);
  }
};

export const getUserSubmittedAndReviewedSecs = async (id, dates, groupId) => {
  const { from: fromDate, to: toDate } = dates;

  const transcriberId = parseInt(id); // Ensuring ID is treated as an integer
  const group_id = parseInt(groupId);

  try {
    // Execute the aggregate function once with the constructed conditions
    const totalSubmittedSecs = await prisma.task.aggregate({
      where: {
        transcriber_id: transcriberId,
        // Conditionally add date filters if both dates are provided
        ...(fromDate &&
          toDate && {
            submitted_at: {
              gte: utcToIst(new Date(fromDate)),
              lte: utcToIst(new Date(toDate)),
            },
          }),
        state: { in: ["submitted", "accepted", "finalised"] },
      },
      _sum: {
        audio_duration: true,
      },
    });

    const totolReviewedSecs = await prisma.task.aggregate({
      where: {
        transcriber_id: transcriberId,
        // Conditionally add date filters if both dates are provided
        ...(fromDate &&
          toDate && {
            reviewed_at: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        state: { in: ["accepted", "finalised"] },
      },
      _sum: {
        audio_duration: true,
      },
    });

    const totalTrashedSecs = await prisma.task.aggregate({
      where: {
        transcriber_id: transcriberId,
        // Conditionally add date filters if both dates are provided
        ...(fromDate &&
          toDate && {
            submitted_at: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        state: "trashed",
      },
      _sum: {
        audio_duration: true,
      },
    });

    // Extract and return the sum of audio_duration
    const submittedSecs = totalSubmittedSecs._sum.audio_duration || 0; // Default to 0 if null
    const reviewedSecs = totolReviewedSecs._sum.audio_duration || 0; // Default to 0 if null
    const trashedSecs = totalTrashedSecs._sum.audio_duration || 0; // Default to 0 if null
    return { submittedSecs, reviewedSecs, trashedSecs };
  } catch (error) {
    console.error(`Error aggregating user submitted seconds:`, error);
    throw new Error(
      `Failed to aggregate user submitted seconds. ${error.message}`
    );
  }
};
