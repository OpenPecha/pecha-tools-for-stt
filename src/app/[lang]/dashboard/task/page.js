import React from "react";
import TaskDashbooard from "./TaskDashbooard";
import { getAllGroup } from "@/model/group";
import { getAllTask } from "@/model/task";

const Task = async ({ searchParams }) => {
  const groups = await getAllGroup();
  const tasks = await getAllTask();

  return (
    <>
      <div className="overflow-y-hidden min-h-screen">
        <TaskDashbooard
          tasks={tasks}
          groups={groups}
          searchParams={searchParams}
        />
      </div>
    </>
  );
};

export default Task;
