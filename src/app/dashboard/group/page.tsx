import { getAllGroup } from "@/model/group";
import React from "react";
import GroupDashboard from "./GroupDashboard";
import { getAllDepartment } from "@/model/department";
export const dynamic = "force-dynamic";

const Group = async () => {
  const groupList = await getAllGroup();
  const departments = await getAllDepartment();
  //console.log("departments", departments, groupList);

  return (
    <>
      <GroupDashboard groupList={groupList} departments={departments} />
    </>
  );
};

export default Group;
