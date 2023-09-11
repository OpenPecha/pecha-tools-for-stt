"use client";
import React from "react";
import { BsCheckLg, BsXLg, BsArrowReturnLeft, BsTrash } from "react-icons/bs";

const ActionButtons = ({
  updateTaskAndIndex,
  index,
  tasks,
  transcript,
  role,
}) => {
  return (
    <>
      <div className="fixed bottom-0 flex gap-1 border shadow-sm p-2">
        <button
          type="button"
          className="focus:outline-none text-white bg-[#4fd364] font-medium text-md p-6 sm:p-9"
          onClick={() => updateTaskAndIndex("submit", transcript, tasks[index])}
        >
          <div className="flex flex-col items-center">
            <BsCheckLg width="5rem" />
            <p>Submit</p>
          </div>
        </button>
        {role !== "TRANSCRIBER" && (
          <button
            type="button"
            className="focus:outline-none text-white bg-[#f74c4a] font-medium text-md p-6 sm:p-9"
            onClick={() =>
              updateTaskAndIndex("reject", transcript, tasks[index])
            }
          >
            <div className="flex flex-col items-center">
              <BsXLg />
              <p>Reject</p>
            </div>
          </button>
        )}
        <button
          type="button"
          className="focus:outline-none text-white bg-[#b9b9b9] font-medium text-md p-6 sm:p-9"
          onClick={() => updateTaskAndIndex("trash", transcript, tasks[index])}
        >
          <div className="flex flex-col items-center">
            <BsTrash />
            <p>Trash</p>
          </div>
        </button>
        <button
          type="button"
          className="focus:outline-none text-white bg-[#b9b9b9] font-medium text-md p-6 sm:p-9"
          onClick={() => updateTaskAndIndex("save", transcript, tasks[index])}
        >
          <div className="flex flex-col items-center">
            <BsArrowReturnLeft />
            <p>Save</p>
          </div>
        </button>
      </div>
    </>
  );
};

export default ActionButtons;
