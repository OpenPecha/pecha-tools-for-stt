import React, { useEffect, useRef, useState } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { ImLoop } from "react-icons/im";
import AppContext from "./AppContext";
import { useContext } from "react";

export const AudioPlayer = ({ tasks, audioRef }) => {
  const { lang } = useContext(AppContext);
  const [playbackRate, setPlaybackRate] = useState(1); // 1, 1.25, 1.5, 2, 0.5 (default 1)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false); // [false, true

  useEffect(() => {
    // Set the playback rate on the audio element when tasks change
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [tasks, playbackRate]);

  const toggleLoop = () => {
    const newLoopState = !isLoopEnabled;
    setIsLoopEnabled(newLoopState);
    if (newLoopState) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
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
    const rates = [1, 1.25, 1.5, 2, 0.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  useEffect(() => {
    // Add event listener for keyboard shortcuts
    window.addEventListener("keydown", handleKeyPress);
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleKeyPress = (e) => {
    // Play/Pause: command + enter , option + enter, ctrl + enter
    if (e.keyCode === 13 && (e.metaKey || e.ctrlKey || e.altKey)) {
      handlePlayPause();
    }
    // Loop: Alt/option + L key
    if (e.altKey && e.keyCode === 76) {
      toggleLoop();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <audio
        ref={audioRef}
        controls
        loop={isLoopEnabled}
        className="w-full"
        key={tasks[0]?.id}
        onEnded={handleAudioEnded}
      >
        <source src={tasks[0]?.url} type="audio/mp3" />
      </audio>
      <div className="flex gap-10 my-2">
        <div
          className="md:tooltip tooltip-bottom"
          data-tip={`${
            isPlaying ? "Pause" : "Play"
          } (command + enter, option + enter, ctrl + enter)`}
        >
          <button
            className="btn btn-outline px-5 py-2.5"
            onClick={() => handlePlayPause()}
          >
            {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
          </button>
        </div>
        <div className="md:tooltip tooltip-bottom" data-tip="Loop (Alt + l)">
          <button
            className={
              isLoopEnabled
                ? "btn px-5 py-2.5 bg-yellow-400 hover:bg-yellow-400"
                : "btn btn-outline px-5 py-2.5"
            }
            onClick={() => toggleLoop()}
          >
            <ImLoop />
          </button>
        </div>
        <button
          className="flex item-center btn btn-ghost text-lg p-2 font-semibold"
          onClick={changePlaybackRate}
        >
          <span className="text-xs">{lang.speed}</span>
          <span>{playbackRate}X</span>
        </button>
      </div>
    </>
  );
};
