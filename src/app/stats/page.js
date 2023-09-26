import { getAllGroup, getAllGroupTaskImportCount } from "@/model/group";
import React from "react";
import GroupImportStats from "./GroupImportStats";
import TaskStats from "./TaskStats";

const Stats = async () => {
  const allGroup = await getAllGroup();
  const groupStatByDept = await getAllGroupTaskImportCount(allGroup);
  const importedThreshold = 500;

  // make a grid of groupStat of 4 columns
  // if taskimportcount is less than importedThreshold, make border red
  return (
    <>
      {groupStatByDept && groupStatByDept.length > 0 && (
        <div className="m-5 md:m-10">
          {groupStatByDept.map((groupStat, index) => (
            <div key={index} className="">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 py-5">
                <GroupImportStats
                  groupStat={groupStat}
                  importedThreshold={importedThreshold}
                />
              </div>
            </div>
          ))}
          <TaskStats groupStatByDept={groupStatByDept} />
        </div>
      )}
    </>
  );
};

export default Stats;
