"use client";

import DashboardBtn from "@/components/DashboardBtn";
import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { deleteDepartment } from "../../../model/department";
import AddDepartmentModal from "./AddDepartmentModal";
import EditDepartmentModal from "./EditDepartmentModal";

const DepartmentDashboard = ({ departmentList }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRemoveDepartment = async (row) => {
    const noGroup = row._count.groups;
    if (noGroup !== 0) {
      window.alert(`Department ${row.name} has ${noGroup} group!`);
    } else {
      const deletedDepartment = await deleteDepartment(row.id);
    }
  };

  const handleEditDepartment = async (row) => {
    setSelectedRow(row);
    window.edit_modal.showModal();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 space-x-0 sm:space-y-0 sm:space-x-10">
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
                  Dept. name
                </th>
                <th scope="col" className="px-6 py-3">
                  No. Group
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentList?.map((row) => (
                <tr className="bg-white border-b" key={row.id}>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {row.id}
                  </th>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row._count.groups || 0}</td>
                  <td className="flex items-center px-6 py-4 space-x-3">
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => handleEditDepartment(row)}
                    >
                      Edit
                    </a>
                    <a
                      href="#"
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                      onClick={() => handleRemoveDepartment(row)}
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
      <AddDepartmentModal />
      <EditDepartmentModal selectedRow={selectedRow} />
    </div>
  );
};

export default DepartmentDashboard;
