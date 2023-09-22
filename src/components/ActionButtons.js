"use client";
import React from "react";
import { BsCheckLg, BsXLg, BsArrowReturnLeft, BsTrash } from "react-icons/bs";

const ActionButtons = ({
  updateTaskAndIndex,
  index,
  tasks,
  transcript,
  role,
  home
}) => {
  // a = 65 submit, x = 88 reject , s = 83 save, t = 84 trash

  return (
    <>
      <div className="fixed bottom-0 flex gap-1 border shadow-sm p-2">
        <div className="tooltip tooltip-top" data-tip="Submit(Alt + a)">
          <button
            type="button"
            className="focus:outline-none text-white bg-[#4fd364] font-medium text-md p-6 sm:p-9"
            onClick={() =>
              updateTaskAndIndex("submit", transcript, tasks[index])
            }
          >
            <div className="flex flex-col items-center">
              <BsCheckLg width="5rem" />
              <p>{home.submit}</p>
            </div>
          </button>
        </div>
        {role !== "TRANSCRIBER" && (
          <div className="tooltip tooltip-top" data-tip="Reject(Alt + x)">
            <button
              type="button"
              className="focus:outline-none text-white bg-[#f74c4a] font-medium text-md p-6 sm:p-9"
              onClick={() =>
                updateTaskAndIndex("reject", transcript, tasks[index])
              }
            >
              <div className="flex flex-col items-center">
                <BsXLg />
                <p>{home.reject}</p>
              </div>
            </button>
          </div>
        )}
        <div className="tooltip tooltip-top" data-tip="Save(Alt + s)">
          <button
            type="button"
            className="focus:outline-none text-white bg-yellow-500 font-medium text-md p-6 sm:p-9"
            onClick={() => updateTaskAndIndex("save", transcript, tasks[index])}
          >
            <div className="flex flex-col items-center">
              <BsArrowReturnLeft />
              <p>{home.save}</p>
            </div>
          </button>
        </div>
        <div className="tooltip tooltip-top" data-tip="Trash(Alt + t)">
          <button
            type="button"
            className="focus:outline-none text-white bg-[#b9b9b9] font-medium text-md p-6 sm:p-9"
            onClick={() =>
              updateTaskAndIndex("trash", transcript, tasks[index])
            }
          >
            <div className="flex flex-col items-center">
              <BsTrash />
              <p>{home.trash}</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionButtons;
