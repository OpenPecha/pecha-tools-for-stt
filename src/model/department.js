"use server";

import prisma from "@/service/db";
import { revalidatePath } from "next/cache";

export const getAllDepartment = async () => {
  try {
    const allDepartment = await prisma.department.findMany({
      include: {
        _count: {
          select: { groups: true },
        },
      },
    });
    return allDepartment;
  } catch (error) {
    console.error("Error getting all Department:", error);
    throw new Error(error);
  }
};

export const createDepartment = async (formData) => {
  const departmentName = formData.get("name");
  try {
    const newDepartment = await prisma.department.create({
      data: {
        name: departmentName,
      },
    });
    revalidatePath("/dashboard/department");
    return newDepartment;
  } catch (error) {
    console.log("Error creating a department", error);
    throw new Error(error);
  }
};

export const deleteDepartment = async (id) => {
  try {
    const department = await prisma.department.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/department");
    return department;
  } catch (error) {
    console.log("Error deleting a department", error);
    throw new Error(error);
  }
};

export const editDepartment = async (id, formData) => {
  const departmentName = formData.get("name");
  try {
    const group = await prisma.department.update({
      where: {
        id,
      },
      data: {
        name: departmentName,
      },
    });
    revalidatePath("/dashboard/department");
    return group;
  } catch (error) {
    console.log("Error updating a department", error);
    throw new Error(error);
  }
};
