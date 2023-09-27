"use client";
import Select from "@/components/Select";
import React, { useState, useEffect } from "react";
import GroupPieChart from "./GroupPieChart";

const TaskStats = ({ groupStatByDept }) => {
  const [selectedScope, setSelectedScope] = useState("all_departments");
  const [statsList, setStatsList] = useState([]);

  useEffect(() => {
    if (groupStatByDept) {
      calculateStatsAllDepartments();
    }
  }, [groupStatByDept]);

  const scopes = [
    {
      id: "per_group",
      name: "per group",
    },
    {
      id: "per_department",
      name: "per department",
    },
    {
      id: "all_departments",
      name: "all departments",
    },
  ];

  const handleScopeChange = async (event) => {
    setSelectedScope(event.target.value);
    if (event.target.value === "per_group") {
      calculateStatsPerGroup();
    } else if (event.target.value === "per_department") {
      calculateStatsPerDepartment();
    } else if (event.target.value === "all_departments") {
      calculateStatsAllDepartments();
    }
  };

  const calculateStatsPerGroup = () => {
    const groupStat = [].concat(...groupStatByDept);
    setStatsList(groupStat);
  };

  const calculateStatsPerDepartment = () => {
    // Create an object to store the sums for each department_id
    const departmentSums = {};

    // Iterate through the groupStatByDept array
    groupStatByDept.forEach((group) => {
      group.forEach((item) => {
        const {
          department_id,
          departmentName,
          taskImportedCount,
          taskTranscribingCount,
          taskSubmittedCount,
          taskAcceptedCount,
          taskFinalisedCount,
          taskTrashedCount,
        } = item;

        // Initialize the sums for the department if it doesn't exist
        if (!departmentSums[department_id]) {
          departmentSums[department_id] = {
            name: departmentName,
            taskImportedCount: 0,
            taskTranscribingCount: 0,
            taskSubmittedCount: 0,
            taskAcceptedCount: 0,
            taskFinalisedCount: 0,
            taskTrashedCount: 0,
          };
        }

        // Add the counts to the sums for the department
        departmentSums[department_id].taskImportedCount += taskImportedCount;
        departmentSums[department_id].taskTranscribingCount +=
          taskTranscribingCount;
        departmentSums[department_id].taskSubmittedCount += taskSubmittedCount;
        departmentSums[department_id].taskAcceptedCount += taskAcceptedCount;
        departmentSums[department_id].taskFinalisedCount += taskFinalisedCount;
        departmentSums[department_id].taskTrashedCount += taskTrashedCount;
      });
    });

    // Convert the object into an array of sums
    const sumsArray = Object.keys(departmentSums).map((department_id) => ({
      id: parseInt(department_id, 10),
      ...departmentSums[department_id],
    }));
    setStatsList(sumsArray);
  };

  const calculateStatsAllDepartments = () => {
    const groupStat = [].concat(...groupStatByDept);
    const allDepartmentStats = groupStat.reduce(
      (accumulator, currentItem) => {
        accumulator.taskImportedCount += currentItem.taskImportedCount;
        accumulator.taskTranscribingCount += currentItem.taskTranscribingCount;
        accumulator.taskSubmittedCount += currentItem.taskSubmittedCount;
        accumulator.taskAcceptedCount += currentItem.taskAcceptedCount;
        accumulator.taskFinalisedCount += currentItem.taskFinalisedCount;
        accumulator.taskTrashedCount += currentItem.taskTrashedCount;
        return accumulator;
      },
      {
        taskImportedCount: 0,
        taskTranscribingCount: 0,
        taskSubmittedCount: 0,
        taskAcceptedCount: 0,
        taskFinalisedCount: 0,
        taskTrashedCount: 0,
      }
    );
    setStatsList([allDepartmentStats]);
  };

  return (
    <>
      <div className="w-4/5 sm:w-1/2 md:w-1/4 my-5">
        <Select
          title="scope"
          label="Scope"
          options={scopes}
          selectedOption={selectedScope}
          handleOptionChange={handleScopeChange}
        />
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {statsList.map((group, index) => (
            <GroupPieChart key={group.id ? group.id : index} group={group} />
          ))}
        </div>
      </div>
    </>
  );
};

export default TaskStats;
