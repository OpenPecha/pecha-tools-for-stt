import React, { useEffect, useRef, useState } from "react";

export const AudioPlayer = ({ tasks, index, audioRef }) => {
  return (
    <>
      <audio
        controls
        className="w-4/5"
        controlsList="nodownload"
        ref={audioRef}
        key={tasks[index]?.id}
      >
        <source
          src={tasks[index]?.url}
          type="audio/mp3"
        />
      </audio>
    </>
  );
};
