import { getAllGroup, getAllGroupTaskStats } from "@/model/group";
import React from "react";
import GroupImportStats from "./GroupImportStats";
import TaskStats from "./TaskStats";
export const dynamic = "force-dynamic";

const Stats = async () => {
  const allGroup = await getAllGroup();
  const groupStatByDept = await getAllGroupTaskStats(allGroup);

  return (
    <>
      {groupStatByDept && groupStatByDept.length > 0 && (
        <div className="m-5 md:m-10">
          <div className="text-xl md:text-2xl text-center font-bold">
            Group stats on imported task
          </div>
          {groupStatByDept.map((groupStat, index) => (
            <div
              key={index}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5"
            >
              <GroupImportStats groupStat={groupStat} />
            </div>
          ))}
          <TaskStats groupStatByDept={groupStatByDept} />
        </div>
      )}
    </>
  );
};

export default Stats;
