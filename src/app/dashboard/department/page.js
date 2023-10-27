import React from "react";
import DepartmentDashboard from "./DepartmentDashboard";
import { getAllDepartment } from "@/model/department";

const Department = async () => {
  const departmentList = await getAllDepartment();

  return (
    <>
      <DepartmentDashboard departmentList={departmentList} />
    </>
  );
};

export default Department;
