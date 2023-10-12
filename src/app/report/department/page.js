import React from "react";
import { getAllDepartment } from "@/model/department";
import DepartmentReport from "./DepartmentReport";

const Department = async () => {
  const departments = await getAllDepartment();
  return (
    <>
      <div className="h-screen my-10">
        <DepartmentReport departments={departments} />
      </div>
    </>
  );
};

export default Department;
