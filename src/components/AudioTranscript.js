"use client";

import { assignTasks, updateTask } from "@/model/action";
import React, { useState, useRef, useEffect } from "react";
import { AudioPlayer } from "./AudioPlayer";
import ActionButtons from "./ActionButtons";
import { UserProgressStats } from "@/model/task";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import AppContext from "../components/AppContext";

const AudioTranscript = ({ tasks, userDetail, language }) => {
  const [languageSelected, setLanguageSelected] = useState("bo");
  const lang = language[languageSelected];
  const [taskList, setTaskList] = useState(tasks);
  const [index, setIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [userTaskStats, setUserTaskStats] = useState({
    completedTaskCount: 0,
    totalTaskCount: 0,
    totalTaskPassed: 0,
  }); // {completedTaskCount, totalTaskCount, totalTaskPassed}
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const [anyTask, setAnyTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const { id: userId, group_id: groupId, role } = userDetail;
  const currentTimeRef = useRef(null);

  function getLastTaskIndex() {
    return taskList.length != 0 ? taskList?.length - 1 : 0;
  }
  useEffect(() => {
    let isMounted = true;
    getUserProgress();
    // Assign a value to currentTimeRef.current
    currentTimeRef.current = new Date().toISOString();
    if (taskList?.length) {
      setAnyTask(true);
      setIsLoading(false);
      switch (role) {
        case "TRANSCRIBER":
          taskList[index]?.transcript != null
            ? setTranscript(taskList[index]?.transcript)
            : setTranscript(taskList[index]?.inference_transcript);
          break;
        case "REVIEWER":
          taskList[index].reviewed_transcript != null
            ? setTranscript(taskList[index]?.reviewed_transcript)
            : setTranscript(taskList[index]?.transcript);
          break;
        case "FINAL_REVIEWER":
          setTranscript(taskList[index]?.reviewed_transcript);
          break;
        default:
          break;
      }
    } else {
      setAnyTask(false);
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [taskList]);

  const getUserProgress = async () => {
    const { completedTaskCount, totalTaskCount, totalTaskPassed } =
      await UserProgressStats(userId, role, groupId);
    setUserTaskStats({
      completedTaskCount,
      totalTaskCount,
      totalTaskPassed,
    });
  };

  const updateHistoryList = (updatedTask) => {
    //console.log("updateHistoryList", updatedTask);
    // add the updated task to the top of the history
    setHistory((prev) => [updatedTask, ...prev]);
  };

  const updateTaskAndIndex = async (action, transcript, task) => {
    try {
      const { id } = task;
      // update the task in the database
      const { msg, updatedTask } = await updateTask(
        action,
        id,
        transcript,
        task,
        role,
        currentTimeRef.current
      );
      if (msg?.error) {
        toast.error(msg.error);
      } else {
        toast.success(msg.success);
      }
      if (action === "submit") {
        getUserProgress();
      }
      if (action === "submit" || action === "trash") {
        updateHistoryList(updatedTask);
      }

      if (getLastTaskIndex() != index) {
        //console.log(" this is not  last task in task list ", index, getLastTaskIndex());
        // remove the task updated from the task list
        setTaskList((prev) => prev.filter((task) => task.id !== id));
        if (action === "submit") {
          currentTimeRef.current = new Date().toISOString();
        }
      } else {
        //console.log(" this is the last task in task list, assigning more task ", index, getLastTaskIndex());
        const moreTask = await assignTasks(groupId, userId, role);
        setIsLoading(true);
        setIndex(0);
        setTaskList(moreTask);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <AppContext.Provider
      value={{ languageSelected, setLanguageSelected, lang }}
    >
      <Sidebar
        userDetail={userDetail}
        userTaskStats={userTaskStats}
        index={index}
        taskList={taskList}
        role={role}
        history={history}
        setTaskList={setTaskList}
        setIndex={setIndex}
        setHistory={setHistory}
      >
        {/* Page content here */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center mt-10 p-5">
            <h1 className="font-bold text-md md:text-3xl">loading...</h1>
          </div>
        ) : anyTask ? (
          <>
            {(role === "REVIEWER" || role === "FINAL_REVIEWER") && (
              <div>
                <p className="mt-5">
                  <strong>{lang.transcriber} : </strong>
                  <span>{taskList[index].transcriber?.name}</span>
                </p>
                {role === "FINAL_REVIEWER" && (
                  <p className="mt-2">
                    <strong>{lang.reviewer} : </strong>
                    <span>{taskList[index].reviewer?.name}</span>
                  </p>
                )}
              </div>
            )}
            <div className="border rounded-md shadow-sm shadow-gray-400 w-11/12 md:w-3/4 p-8 mt-20 mb-40">
              <div className="flex flex-col gap-5 justify-center items-center">
                <AudioPlayer
                  tasks={taskList}
                  index={index}
                  audioRef={audioRef}
                  inputRef={inputRef}
                  transcript={transcript}
                  updateTaskAndIndex={updateTaskAndIndex}
                />
                <textarea
                  ref={inputRef}
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
                    {(taskList[index]?.url).split("/").pop()}
                  </span>
                </div>
              </div>
            </div>
            <ActionButtons
              updateTaskAndIndex={updateTaskAndIndex}
              tasks={taskList}
              index={index}
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
      </Sidebar>
    </AppContext.Provider>
  );
};

export default AudioTranscript;
