"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";
import {
  getReviewerTaskCount,
  getReviewerTaskList,
  getTranscriberTaskList,
  getUserSpecificTasksCount,
  getUserSubmittedSecs,
} from "./task";

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
    });
    return users;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateUserReportByGroup = async (groupId, dates) => {
  console.log(
    "generateUserReportByGroup called with group id and dates",
    groupId,
    dates
  );
  try {
    const users = await getUsersByGroup(groupId);
    const usersStatistic = await generateUsersTaskReport(users, dates);
    console.log("usersStatistic :::", usersStatistic);
    return usersStatistic;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateUsersTaskReport = async (users, dates) => {
  const transcriberList = [];

  for (const user of users) {
    const { id, name } = user;
    const transcriberObj = {
      id,
      name,
      noSubmitted: 0,
      noReviewed: 0,
      reviewedSecs: 0,
      submittedInMin: 0,
      reviewedInMin: 0,
      syllableCount: 0,
    };

    // get the number of tasks submitted by the user
    const taskSubmittedCount = await getUserSpecificTasksCount(id, dates);
    transcriberObj.noSubmitted = taskSubmittedCount;

    const submittedSecs = await getUserSubmittedSecs(id, dates);
    transcriberObj.submittedInMin = parseFloat((submittedSecs / 60).toFixed(2));

    // get the list of tasks by the user with selected fields
    const userTasks = await getTranscriberTaskList(id, dates);

    const updatedTranscriberObj = await UserTaskReport(
      transcriberObj,
      userTasks
    );
    updatedTranscriberObj.reviewedInMin = parseFloat(
      (updatedTranscriberObj.reviewedSecs / 60).toFixed(2)
    );

    transcriberList.push(updatedTranscriberObj);
  }
  return transcriberList;
};

// get the task statistics - task reviewed, reviewed secs, syllable count
export const UserTaskReport = (transcriberObj, userTasks) => {
  const userTaskSummary = userTasks.reduce(
    (acc, task) => {
      if (task.state === "accepted" || task.state === "finalised") {
        acc.noReviewed++;
        acc.reviewedSecs = acc.reviewedSecs + task.audio_duration;
        const syllableCount = splitIntoSyllables(
          task.reviewed_transcript
        ).length;
        acc.syllableCount = acc.syllableCount + syllableCount;
      }
      return acc;
    },
    {
      ...transcriberObj,
      noReviewed: 0,
      reviewedSecs: 0,
      syllableCount: 0,
    }
  );
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
  console.log(
    "generateReviewerReportbyGroup called with group id and dates",
    groupId,
    dates
  );
  try {
    const reviewers = await reviewerOfGroup(groupId);
    const usersReport = generateReviewerTaskReport(reviewers, dates);
    return usersReport;
  } catch (error) {
    console.error("Error getting users by group:", error);
    throw new Error(error);
  }
};

export const generateReviewerTaskReport = async (reviewers, dates) => {
  const reviewerList = [];

  for (const reviewer of reviewers) {
    const { id, name } = reviewer;

    const reviewerObj = {
      id,
      name,
      noReviewed: 0,
      noAccepted: 0,
      noFinalised: 0,
      reviewedSecs: 0,
    };

    // get the list of tasks by the user with selected fields
    const reviewerTasks = await getReviewerTaskList(id, dates);
    const reviewedInSec = getReviewedInSec(reviewerTasks);
    console.log("reviewedInSec", reviewedInSec);
    reviewerObj.reviewedSecs = reviewedInSec;

    const updatedReviwerObj = await getReviewerTaskCount(
      id,
      dates,
      reviewerObj
    );
    reviewerList.push(updatedReviwerObj);
  }
  console.log("Generated Reviewer Task Statistics Report:", reviewerList);
  return reviewerList;
};

const getReviewedInSec = (reviewerTasks) => {
  const reviewedInSec = reviewerTasks.reduce((acc, task) => {
    if (task.state === "accepted" || task.state === "finalised") {
      acc = acc + task.audio_duration;
    }
    return acc;
  }, 0);
  return reviewedInSec;
};
