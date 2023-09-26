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
    console.log("Error creating a group", error);
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
    console.log("Error deleting a group", error);
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
    console.log("Error updating a group", error);
    throw new Error(error);
  }
};

export const getAllGroupTaskImportCount = async (groupList) => {
  // make a array of diff list of group  with diff department_id
  const groupStatsList = [];
  for (let group of groupList) {
    const { id, name, department_id } = group;
    console.log(id, name);
    try {
      // get the count of tasks imported for each group
      const groupStats = {
        id,
        name,
        department_id,
        taskImportCount: await prisma.task.count({
          where: {
            group_id: id,
            state: "imported",
          },
        }),
        taskSubmittedCount: await prisma.task.count({
          where: {
            group_id: id,
            state: "submitted",
          },
        }),
        taskAcceptedCount: await prisma.task.count({
          where: {
            group_id: id,
            state: "accepted",
          },
        }),
      };
      groupStatsList.push(groupStats);
    } catch (error) {
      console.error("Error getting all group:", error);
      throw new Error(error);
    }
  }
  const groupedByDepartment = groupByDepartmentId(groupStatsList);
  console.log("groupedByDepartment:::", groupedByDepartment);
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
