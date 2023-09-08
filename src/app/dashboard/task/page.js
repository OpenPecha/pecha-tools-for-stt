import React from "react";
import TaskDashbooard from "./TaskDashbooard";
import { getAllGroup } from "@/model/group";
import { getAllTask } from "@/model/task";

const Task = async () => {
  const groups = await getAllGroup();
  const tasks = await getAllTask();

  return (
    <>
      <div className="h-screen my-10">
        <TaskDashbooard tasks={tasks} groups={groups} />
      </div>
    </>
  );
};

export default Task;
