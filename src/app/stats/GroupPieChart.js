"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const GroupPieChart = ({ group }) => {
  console.log("GroupPieChart:::", group);
  const { taskImportCount, taskSubmittedCount, taskAcceptedCount } = group;
  const data = {
    labels: ["Imported", "Submitted", "Accepted"],
    datasets: [
      {
        label: "Task State",
        data: [taskImportCount, taskSubmittedCount, taskAcceptedCount],
        backgroundColor: ["red", "blue", "yellow"],
        borderColor: ["red", "blue", "yellow"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className=" ">{group.name ? group.name : ""}</div>
          <div className="p-5">
            <Pie
              className="w-full h-full"
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Group Task State Stats",
                    color: "black",
                    font: {
                      size: 20,
                    },
                  },
                },
              }}
            ></Pie>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupPieChart;
