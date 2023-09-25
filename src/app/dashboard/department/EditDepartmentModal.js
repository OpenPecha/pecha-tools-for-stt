"use client";
import React, { useRef } from "react";
import { editDepartment } from "@/model/department";

const EditDepartmentModal = ({ selectedRow }) => {
  const ref = useRef(null);

  return (
    <>
      <dialog id="edit_modal" className="modal ">
        <form ref={ref} method="dialog" className="modal-box w-4/5 max-w-2xl  ">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Edit Department</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                ref.current?.reset();
                window.edit_modal.close();
              }}
            >
              ✕
            </button>
          </div>
          <div className="form-control grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="id">
                <span className="label-text text-base font-semibold ">Id</span>
              </label>
              <input
                id="id"
                type="text"
                name="id"
                disabled
                required
                className="input input-bordered w-full"
                defaultValue={selectedRow?.id}
              />
            </div>
            <div>
              <label className="label" htmlFor="name">
                <span className="label-text text-base font-semibold ">
                  Name
                </span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="name"
                required
                defaultValue={selectedRow?.name}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label" htmlFor="users">
                <span className="label-text text-base font-semibold ">
                  No. Groups
                </span>
              </label>
              <input
                id="users"
                type="text"
                name="users"
                disabled
                required
                className="input input-bordered w-full"
                defaultValue={selectedRow?._count.groups}
              />
            </div>
          </div>
          <button
            type="submit"
            formAction={async (formData) => {
              ref.current?.reset();
              const editedDepartment = await editDepartment(
                selectedRow?.id,
                formData
              );
              window.edit_modal.close();
            }}
            className="btn btn-accent w-full sm:w-1/5 my-4 py-1 px-6 capitalize"
          >
            update
          </button>
        </form>
      </dialog>
    </>
  );
};

export default EditDepartmentModal;
