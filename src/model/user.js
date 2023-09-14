"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

export const getAllUser = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        group: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error getting all the user:", error);
  }
};

export const createUser = async (formData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const groupId = formData.get("group_id");
  const role = formData.get("role");
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        group_id: parseInt(groupId),
        role,
      },
    });
    revalidatePath("/dashboard/user");
    return newUser;
  } catch (error) {
    console.log("Error adding a user", error);
    throw new Error(error);
  }
};

export const deleteUser = async (id) => {
  try {
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/user");
    return user;
  } catch (error) {
    console.log("Error deleting a user", error);
    throw new Error(error);
  }
};

export const editUser = async (id, formData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const groupId = formData.get("group_id");
  const role = formData.get("role");
  try {
    const group = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        group_id: parseInt(groupId),
        role,
      },
    });
    revalidatePath("/dashboard/user");
    return group;
  } catch (error) {
    console.log("Error updating a user details", error);
    throw new Error(error);
  }
};

export const getUsersByGroup = async (groupId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        group_id: parseInt(groupId),
        role: "TRANSCRIBER",
      },
      include: {
        transcriber_task: true,
        reviewer_task: true,
        final_reviewer_task: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateUserReportByGroup = async (groupId, dates) => {
  console.log(
    "when a group is selected and getUsersByGroup called",
    groupId,
    dates
  );
  const { from: fromDate, to: toDate } = dates;
  try {
    const users = await getUsersByGroup(groupId);
    const usersReport = generateUserTaskReport(users, fromDate, toDate);
    return usersReport;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

/**
 * Generates a report of user task statistics.
 * @param {Array} users - An array of user objects.
 * @returns {Array} - An array of user objects with task statistics.
 */
export const generateUserTaskReport = async (users, fromDate, toDate) => {
  const userList = [];
  let filteredTasks = [];

  for (const user of users) {
    const { id, name, transcriber_task } = user;
    filteredTasks = transcriber_task;

    const userObj = {
      id,
      name,
      noSubmitted: 0,
      noReviewed: 0,
      reviewedMins: 0,
      syllableCount: 0,
    };

    if (fromDate && toDate) {
      filteredTasks = filterTasksByDateRange(
        user.transcriber_task,
        fromDate,
        toDate
      );
    }

    const userStatistics = generateUserStatistics(userObj, filteredTasks);
    userList.push(userStatistics);
  }

  console.log("Generated User Task Statistics Report:", userList);
  return userList;
};

// Generate user task statistics
const generateUserStatistics = (userObj, filteredTasks) => {
  for (const task of filteredTasks) {
    if (
      task.state === "submitted" ||
      task.state === "accepted" ||
      task.state === "finalised"
    ) {
      userObj.noSubmitted++;
    }
    if (task.state === "accepted" || task.state === "finalised") {
      userObj.noReviewed++;

      const mins = calculateAudioMinutes(task);
      userObj.reviewedMins = userObj.reviewedMins + parseFloat(mins);

      //go through each task and find the reviewed transcript and calculate the syllable count
      const { reviewed_transcript } = task;
      const syllableCount = splitIntoSyllables(reviewed_transcript).length;
      console.log("syllableCount", syllableCount);
      userObj.syllableCount = userObj.syllableCount + syllableCount;
    }
  }
  return userObj;
};

export const splitIntoSyllables = (transcript) => {
  // Split the text into syllables using regular expressions
  const syllables = transcript.split(/[\\s་།]+/);
  // Filter out empty syllables
  const filteredSplit = syllables.filter((s) => s !== "");
  return filteredSplit;
};

// Filter tasks within a date range
const filterTasksByDateRange = (tasks, fromDate, toDate) => {
  console.log("filterTasksByDateRange called", fromDate, toDate);
  const isoFromDate = new Date(fromDate);
  const isoToDate = new Date(toDate);

  const filteredTasks = tasks.filter((task) => {
    const submittedAt = task.submitted_at;
    // Convert the dates to timestamps for comparison
    const submittedAtTimestamp = submittedAt?.getTime();
    const fromDateTimestamp = isoFromDate?.getTime();
    const toDateTimestamp = isoToDate?.getTime();
    return (
      fromDateTimestamp <= submittedAtTimestamp &&
      submittedAtTimestamp <= toDateTimestamp
    );
  });
  // console.log("filteredTasks", filteredTasks);
  return filteredTasks;
};

export const calculateAudioMinutes = (task) => {
  const { file_name } = task;

  if (typeof file_name !== "string") {
    console.log("Invalid file_name. Expected a string.");
    return null; // or handle the error as needed
  }

  // Regular expression pattern to match "start_to_end"
  const regexPattern = /(\d+)_to_(\d+)/;

  const match = file_name.match(regexPattern);

  if (match) {
    const [, startTimeStr, endTimeStr] = match; // Use named variables
    const startTime = parseInt(startTimeStr);
    const endTime = parseInt(endTimeStr);

    if (!isNaN(startTime) && !isNaN(endTime)) {
      const timeInSeconds = (endTime - startTime) / 1000;
      const formattedTime = timeInSeconds.toFixed(2) + "s";
      return formattedTime;
    } else {
      console.log("Invalid time values.");
    }
  } else {
    console.log("Input string does not match the expected format.");
  }

  return null; // Return null for cases with errors
};
