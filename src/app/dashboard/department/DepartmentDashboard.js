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
      <div className="my-10 flex justify-center">
        <DashboardBtn
          label="Create"
          icon={<AiOutlinePlus />}
          onClick={() => window.add_modal.showModal()}
        />
      </div>
      <div className="flex justify-center items-center my-10">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="table">
            <thead className="text-sm md:text-base uppercase">
              <tr>
                <th className="px-6 py-3">Id</th>
                <th className="px-6 py-3">Dept. name</th>
                <th className="px-6 py-3">No. Group</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {departmentList?.map((row) => (
                <tr className="text-sm md:text-base" key={row.id}>
                  <th className="px-6 py-4">{row.id}</th>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row._count.groups || 0}</td>
                  <td className="flex items-center px-6 py-4 space-x-3">
                    <a
                      href="#"
                      className="font-medium text-info hover:underline"
                      onClick={() => handleEditDepartment(row)}
                    >
                      Edit
                    </a>
                    <a
                      href="#"
                      className="font-medium text-error hover:underline"
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
