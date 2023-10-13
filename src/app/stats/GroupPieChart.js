"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const GroupPieChart = ({ group }) => {
  //console.log("GroupPieChart:::", group);
  const {
    taskImportedCount,
    taskTranscribingCount,
    taskSubmittedCount,
    taskAcceptedCount,
    taskFinishedCount,
    taskTrashedCount,
  } = group;
  const data = {
    labels: [
      "Imported",
      "Transcribing",
      "Submitted",
      "Accepted",
      "Finalised",
      "Trashed",
    ],
    datasets: [
      {
        label: "Task Count",
        data: [
          taskImportedCount,
          taskTranscribingCount,
          taskSubmittedCount,
          taskAcceptedCount,
          taskFinishedCount,
          taskTrashedCount,
        ],
        backgroundColor: ["grey", "blue", "yellow", "green", "purple", "red"],
        borderColor: ["grey", "blue", "yellow", "green", "purple", "red"],
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
