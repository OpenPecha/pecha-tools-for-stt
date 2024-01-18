"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

export const getAllGroup = async () => {
  try {
    const allGroup = await prisma.group.findMany({
      include: {
        _count: {
          select: { tasks: true, users: true },
        },
        Department: true,
      },
      orderBy: {
        department_id: "asc",
      },
    });
    return allGroup;
  } catch (error) {
    console.error("Error getting all group:", error);
    throw new Error(error);
  }
};

export const createGroup = async (formData) => {
  const groupName = formData.get("name");
  const departmentId = formData.get("department_id");
  try {
    const newGroup = await prisma.group.create({
      data: {
        name: groupName,
        department_id: parseInt(departmentId),
      },
    });
    revalidatePath("/dashboard/group");
    return newGroup;
  } catch (error) {
    //console.log("Error creating a group", error);
    throw new Error(error);
  }
};

export const deleteGroup = async (id) => {
  try {
    const group = await prisma.group.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/group");
    return group;
  } catch (error) {
    //console.log("Error deleting a group", error);
    throw new Error(error);
  }
};

export const editGroup = async (id, formData) => {
  const groupName = formData.get("name");
  const departmentId = formData.get("department_id");
  try {
    const group = await prisma.group.update({
      where: {
        id,
      },
      data: {
        name: groupName,
        department_id: parseInt(departmentId),
      },
    });
    revalidatePath("/dashboard/group");
    return group;
  } catch (error) {
    //console.log("Error updating a group", error);
    throw new Error(error);
  }
};

export const getAllGroupTaskStats = async (groupList) => {
  // make a array of diff list of group  with diff department_id
  const groupStatsList = [];
  const taskStatsMain = await prisma.task.groupBy({
    by: ["state", "group_id"],
    _count: {
      _all: true,
    },
  });
  console.log("taskStatsMain:", taskStatsMain);
  for (let group of groupList) {
    const { id, name, department_id } = group;
    const departmentName = group.Department?.name;
    const taskStatsCount = taskStatsMain.filter((task) => task.group_id === id);
    console.log("importedTaskCount:", taskStatsCount);
    try {
      // get the count of tasks imported for each group
      const groupStats = {
        id,
        name,
        department_id,
        departmentName,
        taskImportedCount:
          taskStatsCount.find((stats) => stats.state === "imported")?._count
            ?._all ?? 0,
        taskTranscribingCount:
          taskStatsCount.find((stats) => stats.state === "transcribing")?._count
            ?._all ?? 0,
        taskSubmittedCount:
          taskStatsCount.find((stats) => stats.state === "submitted")?._count
            ?._all ?? 0,
        taskAcceptedCount:
          taskStatsCount.find((stats) => stats.state === "accepted")?._count
            ?._all ?? 0,
        taskFinishedCount:
          taskStatsCount.find((stats) => stats.state === "finished")?._count
            ?._all ?? 0,
        taskTrashedCount:
          taskStatsCount.find((stats) => stats.state === "trashed")?._count
            ?._all ?? 0,
      };
      groupStatsList.push(groupStats);
    } catch (error) {
      console.error("Error getting all groups task stats:", error);
      throw new Error(error);
    }
  }
  const groupedByDepartment = groupByDepartmentId(groupStatsList);
  return groupedByDepartment;
};

function groupByDepartmentId(arr) {
  const grouped = {};

  arr.forEach((obj) => {
    const { department_id } = obj;

    if (!grouped[department_id]) {
      grouped[department_id] = [];
    }

    grouped[department_id].push(obj);
  });

  return Object.values(grouped);
}
