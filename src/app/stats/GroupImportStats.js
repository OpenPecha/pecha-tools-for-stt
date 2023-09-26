import React from "react";

const GroupImportStats = ({ groupStat, importedThreshold }) => {
  console.log("GroupImportStats:::", groupStat);
  // Function to generate a random color based on a seed (unique ID)
  const generateRandomColor = (seed) => {
    // get differnt lighter hex color based on unique seed
    const seedColor = Math.floor(
      Math.abs(Math.sin(seed) * 16777215) % 16777215
    ).toString(16);
    const className = `bg-[#${seedColor}]`;
    return className;
  };

  return (
    <>
      {groupStat.map((group) => (
        <div
          key={group.id}
          className={`
          ${generateRandomColor(
            group.department_id
          )} shadow-md rounded-md p-4 ${
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
