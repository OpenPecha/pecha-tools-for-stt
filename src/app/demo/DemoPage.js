"use client";

import React, { useEffect, useRef, useState } from "react";
import AppContext from "@/components/AppContext";
import DemoSidebar from "./DemoSidebar";
import ActionButtons from "@/components/ActionButtons";
import { AudioPlayer } from "@/components/AudioPlayer";
import { changeTaskState } from "@/model/action";

const DemoPage = ({ userDetail, language, tasks, userHistory }) => {
  const [languageSelected, setLanguageSelected] = useState("bo");
  const lang = language[languageSelected];
  const [taskList, setTaskList] = useState(tasks);
  const [historyList, setHistoryList] = useState(userHistory); // {completedTaskCount, totalTaskCount, totalTaskPassed}
  const [transcript, setTranscript] = useState("");
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id: userId, group_id: groupId, role } = userDetail;

  useEffect(() => {
    if (taskList?.length) {
      setIsLoading(false);
      taskList[0]?.transcript != null && taskList[0]?.transcript != ""
        ? setTranscript(taskList[0]?.transcript)
        : setTranscript(taskList[0]?.inference_transcript);
    } else {
      setIsLoading(false);
    }
  }, [taskList]);

  const updateTaskAndIndex = async (action, transcript, task) => {
    try {
      const { id } = task;
      const changeState = await changeTaskState(task, role, action);
      // remove the task from the tasklist and add to history
      setTaskList((prev) => prev.filter((task) => task.id !== id));
      setHistoryList((prev) => [
        {
          ...task,
          state: changeState.state,
          transcript: changeState.state === "trashed" ? null : transcript,
          reviewed_transcript: null,
          final_transcript: null,
          submitted_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <>
      <AppContext.Provider
        value={{ languageSelected, setLanguageSelected, lang }}
      >
        <DemoSidebar
          userDetail={userDetail}
          taskList={taskList}
          role={role}
          setTaskList={setTaskList}
          userHistory={historyList}
          setHistoryList={setHistoryList}
        >
          {/* Page content here */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center mt-10 p-5">
              <h1 className="font-bold text-md md:text-3xl">loading...</h1>
            </div>
          ) : taskList?.length ? (
            <>
              {(role === "REVIEWER" || role === "FINAL_REVIEWER") && (
                <div>
                  <p className="mt-5">
                    <strong>{lang.transcriber} : </strong>
                    <span>{taskList[0].transcriber?.name}</span>
                  </p>
                  {role === "FINAL_REVIEWER" && (
                    <p className="mt-2">
                      <strong>{lang.reviewer} : </strong>
                      <span>{taskList[0].reviewer?.name}</span>
                    </p>
                  )}
                </div>
              )}
              <div className="border rounded-md shadow-sm shadow-gray-400 w-11/12 md:w-3/4 p-8 mt-20 mb-40">
                <div className="flex flex-col gap-5 justify-center items-center">
                  <AudioPlayer tasks={taskList} audioRef={audioRef} />
                  <textarea
                    value={transcript || ""}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="rounded-md p-4 border border-slate-400 w-full text-xl"
                    placeholder="Type here..."
                    rows={7}
                    id="transcript"
                  ></textarea>
                  <div className="ml-auto text-xs">
                    <span>
                      <strong className="uppercase">{lang.file} : </strong>
                      {(taskList[0]?.url).split("/").pop()}
                    </span>
                  </div>
                </div>
              </div>
              <ActionButtons
                updateTaskAndIndex={updateTaskAndIndex}
                tasks={taskList}
                transcript={transcript}
                role={role}
              />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center mt-10 p-5">
              <h1 className="font-bold text-lg md:text-3xl">
                No task found, will allocate soon
              </h1>
            </div>
          )}
        </DemoSidebar>
      </AppContext.Provider>
    </>
  );
};

export default DemoPage;
