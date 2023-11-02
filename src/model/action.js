"use server";

import { formatTime } from "@/lib/formatTime";
import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

const ASSIGN_TASKS = 5;
//get user detail if exist
export const getUserDetails = async (username) => {
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
};

// get task based on username
export const getUserTask = async (username) => {
  let userTasks;
  const userData = await getUserDetails(username);
  if (userData === null) {
    return {
      error: "No user found! Please try another with correct username.",
    };
  }
  // if user is found, get the task based on user role
  const { id: userId, group_id: groupId, role } = userData;
  userTasks = await getAssignedTasks(groupId, userId, role);
  if (userTasks.length == 0) {
    console.log("no task already assigned", userTasks.length);
    // assign some tasks for user when got no task to work on
    userTasks = await assignTasks(groupId, userId, role);
  }
  const userHistory = await getUserHistory(userId);
  return { userTasks, userData, userHistory };
};

//getting user's asigned tasks
export const getAssignedTasks = async (groupId, userId, role) => {
  try {
    switch (role) {
      case "TRANSCRIBER":
        // get transcriber assigned tasks
        try {
          const assingedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "transcribing",
              transcriber_id: userId,
            },
            orderBy: {
              id: "asc",
            },
          });
          if (assingedTasks === null) {
            throw new Error("No task found for TRANSCRIBER!.");
          }
          return assingedTasks;
        } catch (error) {
          // console.log("error", error);
          throw new Error(
            "Error while getting assigned task for TRANSCRIBER! Please try another"
          );
        }
        break;
      case "REVIEWER":
        // get reviwer assigned tasks
        try {
          const assingedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "submitted",
              reviewer_id: userId,
            },
            include: {
              transcriber: true,
            },
            orderBy: {
              id: "asc",
            },
          });
          if (assingedTasks === null) {
            throw new Error("No task found for REVIEWER!.");
          }
          return assingedTasks;
        } catch (error) {
          //console.log("error", error);
          throw new Error(
            "Error while getting assigned task for REVIEWER! Please try another"
          );
        }
        break;
      case "FINAL_REVIEWER":
        // get final reviwer assigned tasks
        try {
          const assingedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "accepted",
              final_reviewer_id: userId,
            },
            include: {
              transcriber: true,
              reviewer: true,
            },
            orderBy: {
              id: "asc",
            },
          });
          if (assingedTasks === null) {
            throw new Error("No task found for FINAL_REVIEWER!.");
          }
          return assingedTasks;
        } catch (error) {
          //console.log("error", error);
          throw new Error(
            "Error while getting assigned task for FINAL_REVIEWER! Please try another"
          );
        }
      default:
        break;
    }
  } catch (error) {
    //console.log("Error occurred while getting user task:", error);
    throw new Error(error);
  }
};

// assign tasks to user when got no task to work on
export const assignTasks = async (groupId, userId, role) => {
  let assignedTasks;
  // assign tasks based on  user role
  try {
    switch (role) {
      case "TRANSCRIBER":
        //get first ASSIGN_TASKS of the unassigned tasks and assign some to TRANSCRIBER and give back to TRANSCRIBER
        try {
          const unassignedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "imported",
            },
            orderBy: {
              id: "asc",
            },
            take: ASSIGN_TASKS,
          });

          if (unassignedTasks.length === 0) {
            return (assignedTasks = unassignedTasks);
          } else {
            const assignedTaskCount = await prisma.Task.updateMany({
              where: {
                id: { in: unassignedTasks?.map((task) => task.id) },
              },
              data: {
                transcriber_id: userId,
                state: "transcribing",
              },
            });

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            return assignedTasks;
          }
        } catch (error) {
          //console.log("error", error);
          throw new Error(
            "Error while getting assigned task for REVIEWER! Please try another"
          );
        }
        break;
      case "REVIEWER":
        //get first ASSIGN_TASKS of the unassigned tasks and assign some to REVIEWER and give back to REVIEWER
        try {
          const unassignedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "submitted",
              reviewer_id: null,
            },
            include: {
              transcriber: true,
            },
            orderBy: {
              id: "asc",
            },
            take: ASSIGN_TASKS,
          });

          if (unassignedTasks.length === 0) {
            return (assignedTasks = unassignedTasks);
          } else {
            const assignedTaskCount = await prisma.Task.updateMany({
              where: {
                id: { in: unassignedTasks?.map((task) => task.id) },
              },
              data: {
                reviewer_id: userId,
              },
            });

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            return assignedTasks;
          }
        } catch (error) {
          //console.log("error", error);
          throw new Error(
            "Error while getting assigned task for REVIEWER! Please try another"
          );
        }
        break;
      case "FINAL_REVIEWER":
        //get first ASSIGN_TASKS of the unassigned tasks and assign some to FINAL_REVIEWER and give back to FINAL_REVIEWER
        try {
          const unassignedTasks = await prisma.Task.findMany({
            where: {
              group_id: groupId,
              state: "accepted",
              final_reviewer_id: null,
            },
            include: {
              transcriber: true,
              reviewer: true,
            },
            orderBy: {
              id: "asc",
            },
            take: ASSIGN_TASKS,
          });

          if (unassignedTasks.length === 0) {
            return (assignedTasks = unassignedTasks);
          } else {
            const assignedTaskCount = await prisma.Task.updateMany({
              where: {
                id: { in: unassignedTasks?.map((task) => task.id) },
              },
              data: {
                final_reviewer_id: userId,
              },
            });

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            return assignedTasks;
          }
        } catch (error) {
          //console.log("error", error);
          throw new Error(
            "Error while getting assigned task for REVIEWER! Please try another"
          );
        }
        break;
      default:
        break;
    }
  } catch (error) {
    //console.log("Error occurred while getting user task:", error);
    throw new Error(error);
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
  //console.log("update task", action, id, transcript, task, role, currentTime);
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
    //console.log("duration", duration);
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
            submitted_at: new Date().toISOString(),
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
        //console.log("Error updating TRANSCRIBER task", error);
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
            reviewed_at: new Date().toISOString(),
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
        //console.log("Error updating REVIEWER task", error);
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
            finalised_reviewed_at: new Date().toISOString(),
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
        //console.log("Error updating FINAL_REVIEWER task", error);
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
  //console.log("revertTaskState", id, state);
  const newState =
    state === "submitted"
      ? "transcribing"
      : state === "accepted"
      ? "submitted"
      : "accepted";

  //console.log("newState", newState);
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
    //console.log("Error updating task", error);
  }
};

// get all the history of a user based on userId
export const getUserHistory = async (userId) => {
  try {
    const userHistory = await prisma.Task.findMany({
      where: {
        OR: [
          {
            transcriber_id: userId,
            state: { in: ["submitted", "trashed"] },
          },
          {
            reviewer_id: userId,
            state: { in: ["accepted", "trashed"] },
          },
          {
            final_reviewer_id: userId,
            state: "finalised",
          },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });
    revalidatePath("/");
    return userHistory;
  } catch (error) {
    //console.log("Error getting user history", error);
    throw new Error(error);
  }
};
