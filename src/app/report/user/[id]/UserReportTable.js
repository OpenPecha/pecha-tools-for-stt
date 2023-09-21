import { revertTaskState } from "@/model/action";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const UserReportTable = ({ userTaskRecord, secretAccess }) => {
  function formattedDate(date) {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const [disabledButtons, setDisabledButtons] = useState({});

  const handleRevertState = async (id, state) => {
    console.log(id, state);
    if (disabledButtons[id]) return; // If the button is already disabled, do nothing

    try {
      const updatedTask = await revertTaskState(id, state);

      if (updatedTask?.error) {
        toast.error(updatedTask.error);
      } else {
        toast.success(updatedTask.success);

        // Disable the button after success
        setDisabledButtons({ ...disabledButtons, [id]: true });
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <>
      <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
        <table className="table table-auto table-pin-rows">
          {/* head */}
          <thead className="text-gray-700 bg-gray-50">
            <tr>
              <th className="pr-80">Transcript</th>
              <th>Audio</th>
              <th>State</th>
              {secretAccess && <th>Revert State</th>}
              <th>Submitted at</th>
              <th>Reviewed at</th>
              <th>File name</th>
              <th>Audio duration</th>
              <th>Transcript syllable count</th>
              <th>Reviewed syllable count</th>
            </tr>
          </thead>
          <tbody>
            {userTaskRecord.map((task) => (
              <tr key={task.id}>
                <td
                  className={`border-l-4 ${
                    task.transcript === task.reviewed_transcript
                      ? "border-green-500"
                      : "border-red-500"
                  }`}
                >
                  <div className="grid gap-2 mb-2">
                    <strong>Submitted:</strong>
                    {task.transcript}
                  </div>
                  {task.reviewed_transcript !== null && (
                    <div className="grid gap-2 mb-2">
                      <strong>Reviewed:</strong>
                      {task.reviewed_transcript}
                    </div>
                  )}
                  {task.final_transcript !== null && (
                    <div className="grid gap-2 mb-2">
                      <strong>Final:</strong>
                      {task.final_transcript}
                    </div>
                  )}
                </td>
                <td>
                  <audio controls controlsList="nodownload">
                    <source src={task.url} type="audio/mpeg" />
                  </audio>
                </td>
                <td>{task.state}</td>
                {secretAccess && (
                  <td>
                    <button
                      className="btn"
                      disabled={disabledButtons[task.id]}
                      onClick={() => handleRevertState(task.id, task.state)}
                    >
                      ❌
                    </button>
                  </td>
                )}
                <td>
                  {task.submitted_at !== null
                    ? formattedDate(task?.submitted_at)
                    : ""}
                </td>
                <td>
                  {task.reviewed_at !== null
                    ? formattedDate(task?.reviewed_at)
                    : ""}
                </td>
                <td>{task.file_name}</td>
                <td>{task.audio_duration}</td>
                <td>{task.transcriptSyllableCount}</td>
                <td>{task.reviewedSyllableCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserReportTable;
