import React from "react";
import { getAllDepartment } from "@/model/department";
import DepartmentReport from "./DepartmentReport";

const Department = async () => {
  const departments = await getAllDepartment();
  return (
    <>
      <DepartmentReport departments={departments} />
    </>
  );
};

export default Department;
