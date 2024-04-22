"use server";

import { formatTime } from "@/lib/formatTime";
import { istCurrentTime } from "@/lib/istCurrentTime";
import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

const ASSIGN_TASKS = 20;
const MAX_HISTORY = 10;
//get user detail if exist
export const getUserDetails = async (username) => {
  try {
    const userData = await prisma.User.findUnique({
      where: {
        name: username,
      },
      include: {
        group: true,
      },
    });
    if (userData === null) {
      return null;
    }
    return userData;
  } catch (error) {
    console.error("Failed to retrieve user details:", error);
    throw new Error("Error fetching user details.");
  }
};

// get task based on username
export const getUserTask = async (username) => {
  let userTasks;
  const userData = await getUserDetails(username);
  if (userData === null) {
    return {
      error:
        "No user found. Please try again with the correct username or email..",
    };
  }
  // if user is found, get the task based on user role
  const { id: userId, group_id: groupId, role } = userData;
  userTasks = await getTasks(groupId, userId, role);
  const userHistory = await getUserHistory(userId, groupId, role);
  return { userTasks, userData, userHistory };
};

export const getNumberOfAssignedTask = async (userId, role, groupId) => {
  const roleParams = {
    TRANSCRIBER: {
      state: "transcribing",
      taskField: "transcript",
    },
    REVIEWER: {
      state: "submitted",
      taskField: "reviewed_transcript",
    },
    FINAL_REVIEWER: {
      state: "accepted",
      taskField: "final_transcript",
    },
  };

  const { state, taskField } = roleParams[role];
  const count = await prisma.task.count({
    where: {
      group_id: groupId,
      state,
      [`${role.toLowerCase()}_id`]: parseInt(userId),
      [taskField]: null,
    },
  });
  return count;
};

export const getTasks = async (groupId, userId, role) => {
  const assignCount = await getNumberOfAssignedTask(userId, role, groupId);
  if (assignCount === 0) {
    await assignMoreTasks(groupId, userId, role);
  }

  const roleParams = {
    TRANSCRIBER: { state: "transcribing", taskField: "transcriber_id" },
    REVIEWER: {
      state: "submitted",
      taskField: "reviewer_id",
    },
    FINAL_REVIEWER: {
      state: "accepted",
      taskField: "final_reviewer_id",
    },
  };

  const { state, taskField } = roleParams[role];

  if (!state || !taskField) {
    throw new Error(`Invalid role provided: ${role}`);
  }

  try {
    let tasks = await prisma.task.findMany({
      where: { group_id: groupId, state, [taskField]: userId },
      select: {
        id: true,
        group_id: true,
        state: true,
        inference_transcript: true,
        transcript: true,
        reviewed_transcript: true,
        final_transcript: true,
        file_name: true,
        url: true,
        transcriber: { select: { name: true } },
        reviewer: { select: { name: true } },
      },
      orderBy: {
        id: "asc",
      },
      take: ASSIGN_TASKS,
    });

    return tasks;
  } catch (error) {
    console.error(
      `Failed to retrieve or assign tasks for role ${role}: ${error.message}`
    );
    throw new Error(
      `Failed to retrieve or assign tasks for role ${role}: ${error.message}`
    );
  }
};

export const assignMoreTasks = async (groupId, userId, role) => {
  const roleParams = {
    TRANSCRIBER: { state: "transcribing", taskField: "transcriber_id" },
    REVIEWER: {
      state: "submitted",
      taskField: "reviewer_id",
    },
    FINAL_REVIEWER: {
      state: "accepted",
      taskField: "final_reviewer_id",
    },
  };

  const { state, taskField } = roleParams[role];

  if (!state || !taskField) {
    throw new Error(`Invalid role provided: ${role}`);
  }
  try {
    let unassignedTasks = await prisma.task.findMany({
      where: {
        group_id: groupId,
        state,
        [taskField]: null,
      },
      orderBy: {
        id: "asc",
        // file_name: "asc", order  by file_name when segment order is important otherwise, sort by id is faster. When uploading new task I am sorting by file_name so it should be fine.
      },
      select: {
        id: true,
        group_id: true,
        state: true,
        inference_transcript: true,
        transcript: true,
        reviewed_transcript: true,
        final_transcript: true,
        file_name: true,
        url: true,
        transcriber: { select: { name: true } },
        reviewer: { select: { name: true } },
      },
      take: ASSIGN_TASKS,
    });

    if (unassignedTasks.length > 0) {
      await prisma.task.updateMany({
        where: {
          id: { in: unassignedTasks.map((task) => task.id) },
        },
        data: { [taskField]: userId },
      });
    }
    return unassignedTasks;
  } catch (error) {
    console.error(
      `Failed to retrieve or assign tasks for role ${role}: ${error.message}`
    );
    throw new Error(
      `Failed to retrieve or assign tasks for role ${role}: ${error.message}`
    );
  }
};

// to change the state of task based on user action (state machine)
export const changeTaskState = (task, role, action) => {
  switch (role) {
    case "TRANSCRIBER":
      return action === "assign" || action === "save"
        ? { ...task, state: "transcribing" }
        : action === "submit"
        ? { ...task, state: "submitted" }
        : action === "trash"
        ? { ...task, state: "trashed" }
        : { ...task, state: "imported" };
      break;
    case "REVIEWER":
      return action === "submit"
        ? { ...task, state: "accepted" }
        : action === "reject"
        ? { ...task, state: "transcribing" }
        : action === "trash"
        ? { ...task, state: "trashed" }
        : { ...task, state: "submitted" };
      break;
    case "FINAL_REVIEWER":
      return action === "submit"
        ? { ...task, state: "finalised" }
        : action === "reject"
        ? { ...task, state: "submitted" }
        : action === "trash"
        ? { ...task, state: "trashed" }
        : { ...task, state: "accepted" };
      break;
    default:
      break;
  }
};

// update the takes based on user action
export const updateTask = async (
  action,
  id,
  transcript,
  task,
  role,
  currentTime
) => {
  const changeState = await changeTaskState(task, role, action);
  let duration = null;
  if (
    changeState.state === "submitted" ||
    changeState.state === "accepted" ||
    changeState.state === "finalised"
  ) {
    // convert iso date to timestamp
    let startTime = Date.parse(currentTime);
    let endTime = Date.now();
    let timeDiff = endTime - startTime;
    duration = formatTime(timeDiff);
  }
  switch (role) {
    case "TRANSCRIBER":
      try {
        const updatedTask = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            transcript: changeState.state === "trashed" ? null : transcript,
            reviewed_transcript: null,
            final_transcript: null,
            submitted_at: istCurrentTime(),
            duration: duration,
          },
        });
        if (updatedTask) {
          const msg = await taskToastMsg(action);
          revalidatePath("/");
          return { msg, updatedTask };
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.error("Error updating TRANSCRIBER task", error);
        throw new Error("Error updating TRANSCRIBER task");
      }
      break;
    case "REVIEWER":
      try {
        const updatedTask = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            // when reviewer reject the task, set transcript as incoming transcript and other action keep it same
            transcript:
              changeState.state === "transcribing"
                ? transcript
                : task.transcript,
            reviewed_transcript:
              changeState.state === "trashed" ||
              changeState.state === "transcribing"
                ? null
                : transcript,
            reviewed_at: istCurrentTime(),
          },
        });
        if (updatedTask) {
          const msg = await taskToastMsg(action);
          revalidatePath("/");
          return { msg, updatedTask };
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.error("Error updating REVIEWER task", error);
        throw new Error("Error updating REVIEWER task");
      }
      break;
    case "FINAL_REVIEWER":
      try {
        const updatedTask = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            // when final reviewer reject the task, set reviewed transcript as incoming transcript and other action keep it same
            reviewed_transcript:
              changeState.state === "submitted"
                ? transcript
                : task.reviewed_transcript,
            final_transcript:
              changeState.state === "trashed" ||
              changeState.state === "submitted"
                ? null
                : transcript,
            finalised_reviewed_at: istCurrentTime(),
          },
        });
        if (updatedTask) {
          const msg = await taskToastMsg(action);
          revalidatePath("/");
          return { msg, updatedTask };
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.error("Error updating FINAL_REVIEWER task", error);
        throw new Error("Error updating FINAL_REVIEWER task");
      }
      break;
    default:
      break;
  }
};

export const taskToastMsg = async (action) => {
  switch (action) {
    case "submit":
      return {
        success: "Task is submitted successfully",
      };
      break;
    case "save":
      return {
        success: "Task is saved successfully",
      };
      break;
    case "trash":
      return {
        success: "Task is trashed successfully",
      };
      break;
    case "reject":
      return {
        success: "Task is rejected successfully",
      };
      break;
    default:
      break;
  }
};

// admin level to revert the state of a task based on state send from frontend
export const revertTaskState = async (id, state) => {
  const newState =
    state === "submitted"
      ? "transcribing"
      : state === "accepted"
      ? "submitted"
      : "accepted";

  try {
    const updatedTask = await prisma.Task.update({
      where: {
        id,
      },
      data: {
        state: newState,
      },
    });
    if (updatedTask) {
      return {
        success: "Task state reverted successfully",
      };
    } else {
      return {
        error: "Error reverting task state",
      };
    }
  } catch (error) {
    console.error("Error reverting task state", error);
    throw new Error("Error reverting task state");
  }
};

// get all the history of a user based on userId
export const getUserHistory = async (userId, groupId, role) => {
  try {
    let whereCondition = {
      [`${role.toLowerCase()}_id`]: parseInt(userId),
      state:
        role === "TRANSCRIBER"
          ? { in: ["submitted", "trashed"] }
          : role === "REVIEWER"
          ? { in: ["accepted", "trashed"] }
          : "finalised",
      group_id: parseInt(groupId),
    };

    const userHistory = await prisma.Task.findMany({
      where: whereCondition,
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
      select: {
        id: true,
        group_id: true,
        state: true,
        inference_transcript: true,
        transcript: true,
        reviewed_transcript: true,
        final_transcript: true,
      },
      take: MAX_HISTORY,
    });
    return userHistory;
  } catch (error) {
    console.error("Failed to retrieve user history:", error);
    throw new Error("Failed fetching user history.");
  }
};
