"use client";

import { assignTasks, updateTask } from "@/model/action";
import React, { useState, useRef, useEffect } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { AudioPlayer } from "./AudioPlayer";
import ActionButtons from "./ActionButtons";
import { Task, User } from "@prisma/client";

const AudioTranscript = ({ tasks, userDetail }) => {
  const [taskList, setTaskList] = useState(tasks);
  const [index, setIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [anyTask, setAnyTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id: userId, group_id: groupId, role } = userDetail;
  const currentTimeRef = useRef(String || null);

  function getLastTaskIndex() {
    return taskList.length != 0 ? taskList?.length - 1 : 0;
  }
  useEffect(() => {
    let isMounted = true;
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

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePlayRate = (speed) => {
    audioRef.current.playbackRate = speed;
    console.log("Pitched preserved", audioRef.current.preservesPitch);
  };

  const speedRate = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const updateTaskAndIndex = async (action, transcript, task) => {
    try {
      const { id } = task;

      const response = await updateTask(
        action,
        id,
        transcript,
        task,
        role,
        currentTimeRef.current
      );
      console.log("response", response);
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

          <div className="border rounded-md shadow-sm shadow-gray-400 w-11/12 md:w-3/4 p-5 mt-20 mb-40">
            <div className="flex flex-col gap-5 justify-center items-center">
              <AudioPlayer tasks={taskList} index={index} audioRef={audioRef} />
              <textarea
                value={transcript || ""}
                onChange={(e) => setTranscript(e.target.value)}
                className="rounded-md p-4 border border-slate-400 w-11/12"
                placeholder="Type here..."
                rows={7}
                id="transcript"
              ></textarea>
              <div className="flex flex-wrap gap-6 justify-center">
                <button
                  className="bg-white text-gray-800 py-2.5 px-5 border border-gray-400 rounded-lg shadow"
                  onClick={() => handlePlayPause()}
                >
                  {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
                </button>
                {speedRate.map((speed) => {
                  return (
                    <button
                      key={speed}
                      onClick={() => handlePlayRate(speed)}
                      className="text-white bg-[#583fcf] hover:bg-purple-600 font-semibold rounded-lg text-sm px-5 py-2.5 outline-none"
                    >
                      {speed === 1 ? "Normal" : speed + " speed"}
                    </button>
                  );
                })}
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
    </>
  );
};

export default AudioTranscript;
