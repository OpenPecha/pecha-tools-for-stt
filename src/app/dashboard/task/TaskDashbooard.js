import React from "react";
import TaskForm from "./TaskForm";
import PaginationControls from "../../../components/PaginationControls";
import { getAllTask, getTotalTaskCount } from "@/model/task";

const TaskDashbooard = async ({ searchParams, groups }) => {
  const page = searchParams["page"] ?? "1";
  const per_page = searchParams["per_page"] ?? "10";

  // Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 10;
  // Number of items to skip
  const skip =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0;

  const end = skip + limit;
  const allTasks = await getAllTask(limit, skip);
  const totalTasksCount = await getTotalTaskCount();
  const pageCount = Math.ceil(totalTasksCount / limit);

  return (
    <>
      <TaskForm groups={groups} />
      <div className="flex flex-col justify-center items-center my-10">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="table">
            <thead className="text-xs md:text-base uppercase ">
              <tr>
                <th className="px-6 py-3">Task Id</th>
                <th className="px-6 py-3">Group Id</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Inference</th>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Url</th>
              </tr>
            </thead>
            <tbody className="">
              {allTasks?.map((task) => (
                <tr key={task.id} className="text-xs md:text-base">
                  <th className="px-6 py-4">{task.id}</th>
                  <td className="px-4 py-4">{task.group_id}</td>
                  <td className="px-6 py-4">{task.state}</td>
                  <td className="px-4 py-4">{task.inference_transcript}</td>
                  <td className="px-6 py-4 truncate">
                    {task?.file_name?.slice(0, 15) + "..."}
                  </td>
                  <td className="px-6 py-4 truncate">
                    {task?.url?.slice(0, 15) + "..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={page}
          per_page={per_page}
          hasNextPage={end < totalTasksCount}
          hasPrevPage={skip > 0}
          pageCount={pageCount}
        />
      </div>
    </>
  );
};

export default TaskDashbooard;
