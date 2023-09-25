"use client";

import React, { useRef } from "react";
import { createDepartment } from "@/model/department";

const AddDepartmentModal = () => {
  const ref = useRef(null);
  return (
    <>
      <dialog id="add_modal" className="modal">
        <form ref={ref} method="dialog" className="modal-box">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Create Department</h3>
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
          <div className="form-control w-full sm:w-3/4">
            <label className="label" htmlFor="name">
              <span className="label-text text-base font-semibold ">
                Dept Name
              </span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter department name"
              required
              className="input input-bordered"
            />
          </div>
          <button
            type="submit"
            formAction={async (formData) => {
              ref.current?.reset();
              const newDepartment = await createDepartment(formData);
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

export default AddDepartmentModal;
