"use server";

import { formatTime } from "@/lib/formatTime";
import prisma from "@/service/db";

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
    console.log("userData ---", userData);
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
  const { id: userId, group_id: groupId, role } = userData;
  userTasks = await getAssignedTasks(groupId, userId, role);
  if (userTasks.length == 0) {
    // assign some tasks for user when got no task to work on
    userTasks = await assignTasks(groupId, userId, role);
  }
  console.log("userTasks", userTasks.length);
  return { userTasks, userData };
};

//geting user's asigned tasks
export const getAssignedTasks = async (groupId, userId, role) => {
  console.log("inside getAssignedTask with role as:", role);
  // return tasks based on  user role
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
          console.log("error", error);
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
          console.log("error", error);
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
          console.log("error", error);
          throw new Error(
            "Error while getting assigned task for FINAL_REVIEWER! Please try another"
          );
        }
      default:
        break;
    }
  } catch (error) {
    console.log("Error occurred while getting user task:", error);
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
          // console.log("unassignedTasks are", unassignedTasks);

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
            console.log("assignedTaskCount", assignedTaskCount);

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            // console.log("assignedTasks", assignedTasks);
            return assignedTasks;
          }
        } catch (error) {
          console.log("error", error);
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
          // console.log("unassignedTasks are", unassignedTasks);

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
            console.log("assignedTaskCount", assignedTaskCount);

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            console.log("assignedTasks", assignedTasks);
            return assignedTasks;
          }
        } catch (error) {
          console.log("error", error);
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
          console.log("unassignedTasks are", unassignedTasks);

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
            console.log("assignedTaskCount", assignedTaskCount);

            //updatedManyTask { count: 3 }
            if (assignedTaskCount?.count === 0) {
              throw new Error("No task found for TRANSCRIBER!.");
            }
            assignedTasks = await getAssignedTasks(groupId, userId, role);
            console.log("assignedTasks", assignedTasks);
            return assignedTasks;
          }
        } catch (error) {
          console.log("error", error);
          throw new Error(
            "Error while getting assigned task for REVIEWER! Please try another"
          );
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.log("Error occurred while getting user task:", error);
    throw new Error(error);
  }
};

// to change the state of task based on user action (state machine)
export const changeTaskState = (task, role, action) => {
  console.log("changeTaskState", role, action);
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

// update the files
export const updateTask = async (
  action,
  id,
  transcript,
  task,
  role,
  currentTime
) => {
  console.log("update task", action, id, transcript, task, role, currentTime);
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
    console.log("duration", duration, typeof duration);
  }
  console.log("changeState", changeState);
  switch (role) {
    case "TRANSCRIBER":
      try {
        const updatedFile = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            transcript: changeState.state === "trashed" ? null : transcript,
            submitted_at: new Date().toISOString(),
            duration: duration,
          },
        });
        if (updatedFile) {
          const msg = await taskToastMsg(action);
          console.log("msg", msg);
          return msg;
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.log("Error updating files", error);
      }
      break;
    case "REVIEWER":
      try {
        const updatedFile = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            reviewed_transcript:
              changeState.state === "trashed" ||
              changeState.state === "transcribing"
                ? null
                : transcript,
            reviewed_at: new Date().toISOString(),
          },
        });
        if (updatedFile) {
          const msg = await taskToastMsg(action);
          console.log("msg", msg);
          return msg;
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.log("Error updating files", error);
      }
      break;
    case "FINAL_REVIEWER":
      try {
        const updatedFile = await prisma.Task.update({
          where: {
            id,
          },
          data: {
            state: changeState.state,
            final_transcript:
              changeState.state === "trashed" ||
              changeState.state === "submitted"
                ? null
                : transcript,
            finalised_reviewed_at: new Date().toISOString(),
          },
        });
        if (updatedFile) {
          const msg = await taskToastMsg(action);
          console.log("msg", msg);
          return msg;
        } else {
          return {
            error: "Error updating task",
          };
        }
      } catch (error) {
        console.log("Error updating files", error);
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
