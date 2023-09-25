"use client";

import React, { useRef, useState } from "react";
import { createGroup } from "@/model/group";
import Select from "@/components/Select";

const AddGroupModal = ({ departments }) => {
  const [departmentId, setDepartmentId] = useState("");

  const handleDepartmentChange = async (event) => {
    setDepartmentId(event.target.value);
  };
  const ref = useRef(null);
  return (
    <>
      <dialog id="add_modal" className="modal">
        <form ref={ref} method="dialog" className="modal-box">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Create Group</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                ref.current?.reset();
                window.add_modal.close();
              }}
            >
              ✕
            </button>
          </div>
          <div className="form-control grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                <span className="label-text text-base font-semibold ">
                  Group Name
                </span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter group name"
                required
                className="input input-bordered w-full"
              />
            </div>
            <Select
              title="department_id"
              label="Department"
              options={departments}
              selectedOption={departmentId}
              handleOptionChange={handleDepartmentChange}
            />
          </div>
          <button
            type="submit"
            formAction={async (formData) => {
              ref.current?.reset();
              const newGroup = await createGroup(formData);
              window.add_modal.close();
            }}
            className="btn btn-accent w-full sm:w-1/5 my-4 py-1 px-6 capitalize"
          >
            create
          </button>
        </form>
      </dialog>
    </>
  );
};

export default AddGroupModal;
