"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

export const getAllGroup = async () => {
  try {
    const allGroup = await prisma.group.findMany({
      include: {
        users: true,
        tasks: true,
      },
    });
    return allGroup;
  } catch (error) {
    console.error("Error getting all group:", error);
  }
};

export const createGroup = async (formData) => {
  console.log("creategroup called", formData);
  const groupName = formData.get("name");
  try {
    const newGroup = await prisma.group.create({
      data: {
        name: groupName,
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
  console.log("editGroup called");
  const groupName = formData.get("name");
  try {
    const group = await prisma.group.update({
      where: {
        id,
      },
      data: {
        name: groupName,
      },
    });
    revalidatePath("/dashboard/group");
    return group;
  } catch (error) {
    console.log("Error updating a group", error);
    throw new Error(error);
  }
};
