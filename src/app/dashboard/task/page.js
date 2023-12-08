import React from "react";
import TaskDashbooard from "./TaskDashbooard";
import { getAllGroup } from "@/model/group";
import { getAllTask } from "@/model/task";

const Task = async ({ searchParams }) => {
  const groups = await getAllGroup();

  return (
    <>
      <TaskDashbooard groups={groups} searchParams={searchParams} />
    </>
  );
};

export default Task;
