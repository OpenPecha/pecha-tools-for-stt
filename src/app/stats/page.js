import { getAllGroup, getAllGroupTaskImportCount } from "@/model/group";
import React from "react";
import GroupImportStats from "./GroupImportStats";
import GroupPieChart from "./GroupPieChart";

const Stats = async () => {
  const allGroup = await getAllGroup();
  const groupStat = await getAllGroupTaskImportCount(allGroup);
  console.log("groupStat:::", groupStat);
  const importedThreshold = 500;

  // make a grid of groupStat of 4 columns
  // if taskimportcount is less than importedThreshold, make border red
  return (
    <>
      {groupStat && groupStat.length > 0 && (
        <div className="my-10">
          <div className="grid grid-cols-4 gap-4 my-10 mx-10">
            <GroupImportStats
              groupStat={groupStat}
              importedThreshold={importedThreshold}
            />
          </div>
          {groupStat.map((group) => (
            <div key={group.id} className="">
              <div className="text-center">
                <h2 className="text-xl font-bold">{group.name}</h2>
              </div>
              <GroupPieChart group={group} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Stats;
