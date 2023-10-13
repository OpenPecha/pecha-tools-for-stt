import { getAllGroup } from "@/model/group";
import React from "react";
import GroupDashboard from "./GroupDashboard";
import { getAllDepartment } from "@/model/department";

const Group = async () => {
  const groupList = await getAllGroup();
  const departments = await getAllDepartment();
  //console.log("departments", departments, groupList);

  return (
    <>
      <div className="h-screen my-10">
        <GroupDashboard groupList={groupList} departments={departments} />
      </div>
    </>
  );
};

export default Group;
