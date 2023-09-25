import React from "react";

const GroupImportStats = ({ groupStat, importedThreshold }) => {
  return (
    <>
      {groupStat.map((group) => (
        <div
          key={group.id}
          className={`bg-white shadow-md rounded-md p-4 
        ${
          group.taskImportCount < importedThreshold
            ? "border-4 border-red-500"
            : ""
        }
         `}
        >
          <div className="flex flex-col justify-center items-center">
            <div className="text-2xl font-bold">{group.name}</div>
            <div className="text-xl font-bold">{group.taskImportCount}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default GroupImportStats;
