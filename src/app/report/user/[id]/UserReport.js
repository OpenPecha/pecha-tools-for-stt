"use client";
import React, { useState } from "react";
import ReportForm from "../../ReportForm";
import { getUserSpecificTasks } from "@/model/task";

const UserReport = ({ id, users }) => {
  const [userTaskRecord, setUserTaskRecord] = useState([]);
  console.log("in UserReport ui", userTaskRecord);

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

  return (
    <>
      <ReportForm
        id={id}
        options={users}
        setList={setUserTaskRecord}
        title="user_id"
        label="Users"
        generateReport={getUserSpecificTasks}
      />
      <div className="flex justify-center items-center mt-10">
        <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="table  ">
            {/* head */}
            <thead className="text-gray-700 bg-gray-50">
              <tr>
                <th>Submitted transcipt</th>
                <th>Reviewed transcipt</th>
                <th>Is correct?</th>
                <th>Audio</th>
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
                  <td>{task.transcript}</td>
                  <td>{task.reviewed_transcript}</td>
                  <td>
                    {task.transcript === task.reviewed_transcrip
                      ? "true"
                      : "false"}
                  </td>
                  <td>
                    <audio controls controlsList="nodownload">
                      <source src={task.url} type="audio/mpeg" />
                    </audio>
                  </td>
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
      </div>
    </>
  );
};

export default UserReport;
