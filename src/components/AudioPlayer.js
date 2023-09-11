import React, { useEffect, useRef, useState } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { ImLoop } from "react-icons/im";

export const AudioPlayer = ({ tasks, index, audioRef }) => {
  const [playbackRate, setPlaybackRate] = useState(1); // 1, 1.25, 1.5, 2, 0.5 (default 1)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);

  console.log("audioRef", isAutoplayEnabled);

  const toggleAutoplay = () => {
    setIsAutoplayEnabled(!isAutoplayEnabled);
    if (isAutoplayEnabled) {
      audioRef.current.pause();
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const changePlaybackRate = () => {
    const newRate =
      playbackRate === 1
        ? 1.25
        : playbackRate === 1.25
        ? 1.5
        : playbackRate === 1.5
        ? 2
        : playbackRate === 2
        ? 0.5
        : playbackRate === 0.5
        ? 1
        : 1.25;
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
    console.log(audioRef.current.playbackRate);
  };

  return (
    <>
      <audio
        ref={audioRef}
        controls
        loop={isAutoplayEnabled}
        className="w-full"
        key={tasks[index]?.id}
      >
        <source src={tasks[index]?.url} type="audio/mp3" />
      </audio>
      <div className="flex gap-10 my-2">
        <button
          className="btn btn-outline px-5 py-2.5"
          onClick={() => handlePlayPause()}
        >
          {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
        </button>
        <button
          className={
            isAutoplayEnabled
              ? "btn px-5 py-2.5 bg-yellow-400 hover:bg-yellow-400"
              : "btn btn-outline px-5 py-2.5"
          }
          onClick={() => toggleAutoplay()}
        >
          <ImLoop />
        </button>
        <button
          className="flex item-center btn btn-ghost text-lg p-2 font-semibold"
          onClick={changePlaybackRate}
        >
          <span className="text-xs">SPEED</span>
          <span>{playbackRate}X</span>
        </button>
      </div>
    </>
  );
};
