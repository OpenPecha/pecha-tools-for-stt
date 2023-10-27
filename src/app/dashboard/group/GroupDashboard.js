"use client";

import DashboardBtn from "@/components/DashboardBtn";
import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import AddGroupModal from "./AddGroupModal";
import EditGroupModal from "./EditGroupModal";
import { deleteGroup } from "@/model/group";

const GroupDashboard = ({ groupList, departments }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRemoveGroup = async (row) => {
    const noUser = row._count.users;
    const noTask = row._count.tasks;
    if (noUser !== 0 || noTask !== 0) {
      window.alert(
        `Group ${row.name} has ${noUser} users and ${noTask} tasks!`
      );
    } else {
      const deletedGroup = await deleteGroup(row.id);
    }
  };

  const handleEditGroup = async (row) => {
    setSelectedRow(row);
    window.edit_modal.showModal();
  };

  return (
    <div>
      <div className="sticky top-0 z-20 py-8 bg-white flex flex-col sm:flex-row justify-center items-center space-y-5 space-x-0 sm:space-y-0 sm:space-x-10">
        <DashboardBtn
          label="Create"
          icon={<AiOutlinePlus />}
          onClick={() => window.add_modal.showModal()}
        />
      </div>
      <div className="flex justify-center items-center my-10">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Id
                </th>
                <th scope="col" className="px-6 py-3">
                  Group name
                </th>
                <th scope="col" className="px-6 py-3">
                  Department name
                </th>
                <th scope="col" className="px-6 py-3">
                  No. Users
                </th>
                <th scope="col" className="px-6 py-3">
                  No. Tasks
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {groupList?.map((row) => (
                <tr className="bg-white border-b" key={row.id}>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {row.id}
                  </th>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row.Department?.name}</td>
                  <td className="px-6 py-4">{row._count.users || 0}</td>
                  <td className="px-6 py-4">{row._count.tasks || 0}</td>
                  <td className="flex items-center px-6 py-4 space-x-3">
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => handleEditGroup(row)}
                    >
                      Edit
                    </a>
                    <a
                      href="#"
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                      onClick={() => handleRemoveGroup(row)}
                    >
                      Remove
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddGroupModal departments={departments} />
      <EditGroupModal selectedRow={selectedRow} departments={departments} />
    </div>
  );
};

export default GroupDashboard;
