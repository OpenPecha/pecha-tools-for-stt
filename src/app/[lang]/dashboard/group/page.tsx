import { getAllGroup } from "@/model/group";
import React from "react";
import GroupDashboard from "./GroupDashboard";

const Group = async () => {
  const groupList = await getAllGroup();

  return (
    <>
      <div className="h-screen my-10">
        <GroupDashboard groupList={groupList} />
      </div>
    </>
  );
};

export default Group;
