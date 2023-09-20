"use client";

import { assignTasks, updateTask } from "@/model/action";
import React, { useState, useRef, useEffect } from "react";
import { AudioPlayer } from "./AudioPlayer";
import ActionButtons from "./ActionButtons";
import { getCompletedTaskCount } from "@/model/task";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";

const AudioTranscript = ({ tasks, userDetail }) => {
  const [taskList, setTaskList] = useState(tasks);
  const [index, setIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [completedTask, setCompletedTask] = useState(0);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const [anyTask, setAnyTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id: userId, group_id: groupId, role } = userDetail;
  const currentTimeRef = useRef(null);

  function getLastTaskIndex() {
    return taskList.length != 0 ? taskList?.length - 1 : 0;
  }
  useEffect(() => {
    let isMounted = true;
    completedTaskCount();
    // Assign a value to currentTimeRef.current
    currentTimeRef.current = new Date().toISOString();
    console.log("Current Time:", currentTimeRef.current);
    console.log("user details", userDetail, "array of task", taskList);
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
      console.log("No task", taskList);
    }
    return () => {
      isMounted = false;
    };
  }, [taskList]);

  async function completedTaskCount() {
    const taskCount = await getCompletedTaskCount(userId, role);
    setCompletedTask(taskCount);
  }

  const updateTaskAndIndex = async (action, transcript, task) => {
    try {
      const { id } = task;

      const updatedTask = await updateTask(
        action,
        id,
        transcript,
        task,
        role,
        currentTimeRef.current
      );
      if (updatedTask?.error) {
        toast.error(updatedTask.error);
      } else {
        toast.success(updatedTask.success);
      }
      if (action === "submit") {
        const count = completedTaskCount();
        setCompletedTask(count);
      }

      if (getLastTaskIndex() != index) {
        console.log(" this is not  last task in task list ", index);
        role === "TRANSCRIBER"
          ? setTranscript(taskList[index + 1].inference_transcript)
          : role === "REVIEWER"
          ? setTranscript(taskList[index + 1].transcript)
          : setTranscript(taskList[index + 1].reviewed_transcript);
        setIndex(index + 1);
        if (action === "submit") {
          currentTimeRef.current = new Date().toISOString();
        }
      } else {
        console.log(
          " this is the last task in task list, assigning more task ",
          index
        );
        const moreTask = await assignTasks(groupId, userId, role);
        console.log("more tasks", moreTask);
        setIsLoading(true);
        setIndex(0);
        setTaskList(moreTask);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <>
      <Sidebar
        userDetail={userDetail}
        completedTask={completedTask}
        index={index}
        taskList={taskList}
        role={role}
      >
        {/* Page content here */}
        {isLoading ? (
          <div className="flex min-h-screen flex-col justify-center items-center">
            <h1 className="font-bold text-3xl">loading...</h1>
          </div>
        ) : anyTask ? (
          <>
            {(role === "REVIEWER" || role === "FINAL_REVIEWER") && (
              <div>
                <p className="mt-5">
                  <strong>Transcriber : </strong>
                  <span>{taskList[index].transcriber?.name}</span>
                </p>
                {role === "FINAL_REVIEWER" && (
                  <p className="mt-2">
                    <strong>Reviewer : </strong>
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
                  className="rounded-md p-4 border border-slate-400 w-full"
                  placeholder="Type here..."
                  rows={7}
                  id="transcript"
                ></textarea>
                <div className="ml-auto text-xs">
                  <span>
                    <strong className="uppercase">File:</strong>
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
          <div className="flex min-h-screen flex-col justify-center items-center">
            <h1 className="font-bold text-3xl">
              No task found, will allocate soon
            </h1>
          </div>
        )}
      </Sidebar>
    </>
  );
};

export default AudioTranscript;
