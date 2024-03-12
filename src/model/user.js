"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";
import {
  getFinalReviewerTaskCount,
  getFinalReviewerTaskList,
  getReviewerTaskCount,
  getReviewerTaskList,
  getTranscriberTaskList,
  getUserSpecificTasksCount,
  getUserSubmittedSecs,
} from "./task";

var levenshtein = require("fast-levenshtein");

export const getAllUser = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            transcriber_task: true,
            reviewer_task: true,
            final_reviewer_task: true,
          },
        },
        group: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error getting all the user:", error);
    throw new Error(error);
  }
};

export const createUser = async (formData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const groupId = formData.get("group_id");
  const role = formData.get("role");
  try {
    // check if username  and email already exists
    const userByName = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    const userByEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userByName && userByEmail) {
      return {
        error: "User already exists with the same username and email",
      };
    } else if (userByName) {
      return {
        error: "User already exists with the same username",
      };
    } else if (userByEmail) {
      return {
        error: "User already exists with the same email",
      };
    }
    // If no matching user was found, you can proceed with user creating new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        group_id: parseInt(groupId),
        role,
      },
    });
    revalidatePath("/dashboard/user");
    // if new user is created, send msg to client side that user is created
    if (newUser) {
      return {
        success: "User created successfully",
      };
    } else {
      return {
        error: "Error creating user",
      };
    }
  } catch (error) {
    //console.log("Error adding a user", error);
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
    //console.log("Error deleting a user", error);
    throw new Error(error);
  }
};

export const editUser = async (id, formData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const groupId = formData.get("group_id");
  const role = formData.get("role");
  try {
    // check if username  and email already exists
    const userId = parseInt(id); // Ensure id is converted to an integer
    const userByName = await prisma.user.findUnique({
      where: {
        name: name,
        NOT: {
          id: userId,
        },
      },
    });

    const userByEmail = await prisma.user.findUnique({
      where: {
        email: email,
        NOT: {
          id: userId,
        },
      },
    });

    if (userByName && userByEmail) {
      return {
        error: "User already exists with the same username and email",
      };
    } else if (userByName) {
      return {
        error: "User already exists with the same username",
      };
    } else if (userByEmail) {
      return {
        error: "User already exists with the same email",
      };
    }
    const updatedUser = await prisma.user.update({
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
    // if user data is edited , send msg to client side that user is created
    if (updatedUser) {
      return {
        success: "User edited successfully",
      };
    } else {
      return {
        error: "Error editing user",
      };
    }
  } catch (error) {
    //console.log("Error updating a user details", error);
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
    });
    return users;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateUserReportByGroup = async (groupId, dates) => {
  try {
    const users = await getUsersByGroup(groupId);
    // if user is not found, return empty array
    if (!users) {
      return [];
    }
    const usersStatistic = await Promise.all(
      users.map((user) => generateUsersTaskReport(user, dates))
    );
    return usersStatistic;
  } catch (error) {
    console.error("Error generating transcriber report by group:", error);
    throw new Error("Failed to generate transcriber report.");
  }
};

export const generateUsersTaskReport = async (user, dates) => {
  const { id: userId, name } = user;
  const [submittedTaskCount, submittedSecs, userTasks, reviewedTaskCount] =
    await Promise.all([
      getUserSpecificTasksCount(userId, dates),
      getUserSubmittedSecs(userId, dates),
      getTranscriberTaskList(userId, dates),
      getTaskReviewedBasedOnSubmitted(userId, dates),
    ]);

  const transcriberObj = {
    id: userId,
    name,
    noSubmitted: submittedTaskCount,
    noReviewedBasedOnSubmitted: reviewedTaskCount?.length || 0,
    noReviewed: 0,
    reviewedSecs: 0,
    submittedInMin: parseFloat((submittedSecs / 60).toFixed(2)),
    reviewedInMin: 0,
    syllableCount: 0,
    noReviewedCorrected: 0,
    characterCount: 0,
    cer: 0,
    totalCer: 0,
  };

  const updatedTranscriberObj = await UserTaskReport(transcriberObj, userTasks);
  updatedTranscriberObj.reviewedInMin = parseFloat(
    (updatedTranscriberObj.reviewedSecs / 60).toFixed(2)
  );
  return updatedTranscriberObj;
};

export const getTaskReviewedBasedOnSubmitted = async (id, dates) => {
  const { from: fromDate, to: toDate } = dates;
  let taskReviewedBasedOnSubmitted;
  if (fromDate && toDate) {
    taskReviewedBasedOnSubmitted = await prisma.task.findMany({
      where: {
        transcriber_id: parseInt(id),
        state: { in: ["accepted", "finalised"] },
        submitted_at: {
          gte: new Date(fromDate).toISOString(),
          lte: new Date(toDate).toISOString(),
        },
      },
    });
  } else {
    taskReviewedBasedOnSubmitted = await prisma.task.findMany({
      where: {
        transcriber_id: parseInt(id),
        state: { in: ["accepted", "finalised"] },
      },
    });
  }
  return taskReviewedBasedOnSubmitted;
};

// get the task statistics - task reviewed, reviewed secs, syllable count
export const UserTaskReport = (transcriberObj, userTasks) => {
  const userTaskSummary = userTasks.reduce((acc, task) => {
    if (["accepted", "finalised"].includes(task.state)) {
      acc.noReviewed++;
      acc.reviewedSecs += task.audio_duration || 0;
      const syllableCount = task.reviewed_transcript
        ? splitIntoSyllables(task.reviewed_transcript).length
        : 0;
      acc.syllableCount += syllableCount;
      acc.characterCount += task.transcript ? task.transcript.length : 0;
      // Ensure both transcripts are available before calculating CER
      if (task.transcript && task.reviewed_transcript) {
        const cer = levenshtein.get(task.transcript, task.reviewed_transcript);
        acc.totalCer += cer; // Add CER for each task to total
      }
    }
    if (task.transcriber_is_correct === false) {
      acc.noReviewedCorrected++;
    }
    return acc;
  }, transcriberObj);
  return userTaskSummary;
};

export const splitIntoSyllables = (transcript) => {
  // Split the text into syllables using regular expressions
  const syllables = transcript.split(/[\\s་།]+/);
  // Filter out empty syllables
  const filteredSplit = syllables.filter((s) => s !== "");
  return filteredSplit;
};

export const reviewerOfGroup = async (groupId) => {
  try {
    const reviewers = await prisma.user.findMany({
      where: {
        group_id: parseInt(groupId),
        role: "REVIEWER",
      },
    });
    return reviewers;
  } catch (error) {
    console.error("Error getting reviewers of group:", error);
    throw new Error(error);
  }
};

// for all the reviewers of a group retun the task statistics - task reviewed, task accepted, task finalised
export const generateReviewerReportbyGroup = async (groupId, dates) => {
  try {
    const reviewers = await reviewerOfGroup(groupId);
    // const usersStatistic = await Promise.all(
    //   users.map((user) => generateUsersTaskReport(user, dates))
    // );
    const reviewersReport = await Promise.all(
      reviewers.map((reviewer) => generateReviewerTaskReport(reviewer, dates))
    );
    return reviewersReport;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateReviewerTaskReport = async (reviewer, dates) => {
  const { id, name } = reviewer;

  const reviewerObj = {
    id,
    name,
    noReviewed: 0,
    noAccepted: 0,
    noFinalised: 0,
    reviewedSecs: 0,
  };

  const updatedReviwerObj = await getReviewerTaskCount(id, dates, reviewerObj);

  return updatedReviwerObj;
};

// for all the final reviewers of a group retun the task statistics - task finalised, finalised mintues
export const generateFinalReviewerReportbyGroup = async (groupId, dates) => {
  //console.log("generateFinalReviewerReportbyGroup called with group id and dates", groupId, dates);
  try {
    const finalReviewers = await finalReviewerOfGroup(groupId);
    const usersReport = generateFinalReviewerTaskReport(finalReviewers, dates);
    return usersReport;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const finalReviewerOfGroup = async (groupId) => {
  try {
    const finalReviewers = await prisma.user.findMany({
      where: {
        group_id: parseInt(groupId),
        role: "FINAL_REVIEWER",
      },
    });
    return finalReviewers;
  } catch (error) {
    console.error("Error getting final reviewers of group:", error);
    throw new Error(error);
  }
};

export const generateFinalReviewerTaskReport = async (
  finalReviewers,
  dates
) => {
  const finalReviewerList = [];

  for (const finalReviewer of finalReviewers) {
    const { id, name } = finalReviewer;

    const finalReviewerObj = {
      id,
      name,
      noFinalised: 0,
      finalisedSecs: 0,
    };

    // get the list of tasks by the user with selected fields
    const finalReviewerTasks = await getFinalReviewerTaskList(id, dates);
    const finalisedInSec = getFinalisedInSec(finalReviewerTasks);
    //console.log("finalisedInSec", finalisedInSec);
    finalReviewerObj.finalisedSecs = finalisedInSec;

    const updatedFinalReviwerObj = await getFinalReviewerTaskCount(
      id,
      dates,
      finalReviewerObj
    );
    finalReviewerList.push(updatedFinalReviwerObj);
  }
  //console.log("Generated Final Reviewer Task Statistics Report:", finalReviewerList);
  return finalReviewerList;
};

const getFinalisedInSec = (finalReviewerTasks) => {
  const finalisedInSec = finalReviewerTasks.reduce((acc, task) => {
    if (task.state === "finalised") {
      acc = acc + task.audio_duration;
    }
    return acc;
  }, 0);
  return finalisedInSec;
};
