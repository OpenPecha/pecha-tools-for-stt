"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const GroupPieChart = ({ group }) => {
  console.log("GroupPieChart:::", group);
  const { taskImportCount, taskSubmittedCount, taskAcceptedCount } = group;
  const data = {
    labels: ["Imported", "Submitted", "Accepted"],
    datasets: [
      {
        label: "Task Count",
        data: [taskImportCount, taskSubmittedCount, taskAcceptedCount],
        backgroundColor: ["red", "blue", "yellow"],
        borderColor: ["red", "blue", "yellow"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
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
                text: `${group.name ? group.name : ""}`,
                color: "black",
                font: {
                  size: 20,
                },
              },
            },
          }}
        ></Pie>
      </div>
    </>
  );
};

export default GroupPieChart;
