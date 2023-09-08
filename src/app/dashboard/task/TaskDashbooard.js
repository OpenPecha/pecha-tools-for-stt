import React from "react";
import TaskForm from "./TaskForm";

const TaskDashbooard = ({ tasks, groups }) => {
  return (
    <>
      <TaskForm groups={groups} />
      <div className="flex justify-center items-center mt-10">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Id
                </th>
                <th scope="col" className="px-6 py-3">
                  Group Id
                </th>
                <th scope="col" className="px-6 py-3">
                  State
                </th>
                <th scope="col" className="px-6 py-3">
                  Inference
                </th>
                <th scope="col" className="px-6 py-3">
                  File Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Url
                </th>
              </tr>
            </thead>
            <tbody className="">
              {tasks?.map((task) => (
                <tr key={task.id} className="bg-white border-b">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {task.id}
                  </th>
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
      </div>
    </>
  );
};

export default TaskDashbooard;
