"use client";

import React, { useRef, useState } from "react";
import { createUser } from "@/model/user";
import Select from "@/components/Select";

const AddUserModal = ({ groups }) => {
  const ref = useRef(null);
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionChange = async (event) => {
    setSelectedOption({ [event.target.name]: event.target.value });
  };
  const roles = [
    {
      id: "TRANSCRIBER",
      name: "Transcriber",
    },
    {
      name: "Reviewer",
      id: "REVIEWER",
    },
    {
      name: "Final Reviewer",
      id: "FINAL_REVIEWER",
    },
  ];

  return (
    <>
      <dialog id="add_modal" className="modal">
        <form ref={ref} method="dialog" className="modal-box w-4/5 max-w-2xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Create User</h3>
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
                  Name
                </span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="name"
                required
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                <span className="label-text text-base font-semibold ">
                  Email
                </span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="email"
                required
                className="input input-bordered w-full"
              />
            </div>
            <Select
              title="group_id"
              label="Groups"
              options={groups}
              selectedOption={selectedOption}
              handleOptionChange={handleOptionChange}
            />
            <Select
              title="role"
              label="Roles"
              options={roles}
              selectedOption={selectedOption}
              handleOptionChange={handleOptionChange}
            />
          </div>
          <button
            type="submit"
            formAction={async (formData) => {
              ref.current?.reset();
              console.log(
                "formData",
                formData.get("email"),
                formData.get("name"),
                formData.get("group_id"),
                formData.get("role")
              );
              const newUsesr = await createUser(formData);
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

export default AddUserModal;
