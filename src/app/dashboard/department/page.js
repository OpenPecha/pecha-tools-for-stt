import React from "react";
import DepartmentDashboard from "./DepartmentDashboard";
import { getAllDepartment } from "@/model/department";

const Department = async () => {
  const departmentList = await getAllDepartment();

  return (
    <>
      <div className="h-screen my-10">
        <DepartmentDashboard departmentList={departmentList} />
      </div>
    </>
  );
};

export default Department;
