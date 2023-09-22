import React from "react";
import { getAllGroup } from "@/model/group";
import GroupReport from "./GroupReport";

const Group = async () => {
  const groups = await getAllGroup();

  return (
    <>
      <div className="h-screen my-10">
        <GroupReport groups={groups} />
      </div>
    </>
  );
};

export default Group;
