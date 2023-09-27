import React from "react";

const GroupImportStats = ({ groupStat }) => {
  console.log("GroupImportStats:::", groupStat);
  const importedThreshold = 500;

  // Function to generate a random color based on a seed (unique ID)
  const generateRandomColor = (seed) => {
    // List of available background colors in Tailwind CSS
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "orange",
      "amber",
      "lime",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      // Add more colors as needed
    ];

    // Use the seed to select a random color from the list
    const randomColor = colors[Math.floor(Math.abs(seed) % colors.length)];

    // Return the Tailwind CSS class for the selected color
    return `bg-${randomColor}-500`;
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
          <div className="flex justify-center items-center gap-5">
            <div className="text-2xl font-bold">{group.name}</div>
            <div className="text-xl font-bold">{group.taskImportCount}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default GroupImportStats;
