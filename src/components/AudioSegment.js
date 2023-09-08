"use client";

import Link from "next/link";
import React, { useState } from "react";
import Pagination from "./Pagination";

const AudioSegment = ({ files }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const filesPerPage = 5;
  const lastFileIndex = currentPage * filesPerPage;
  const firstFileIndex = lastFileIndex - filesPerPage;
  const currentFiles = files?.slice(firstFileIndex, lastFileIndex);
  const nPage = Math.ceil(files?.length / filesPerPage);

  return (
    <div className="flex flex-col justify-center items-center gap-5 mt-10">
      {currentFiles?.map((list) => {
        return (
          <div
            key={list.id}
            className="flex space-x-5 justify-center items-center border-solid border-2 rounded-md py-2 border-gray-400 w-1/2"
          >
            <p className=" text-2xl font-semibold">Audio Segment {list.id}</p>
            <Link
              href={{
                pathname: `/annotation-tool/${list.id}`,
              }}
              className=" bg-gray-200 border-2 px-2.5 py-1 rounded-md text-black text-md w-1/4 text-center"
              type="button"
            >
              {list.status}
            </Link>
          </div>
        );
      })}
      <Pagination
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        nPage={nPage}
      />
    </div>
  );
};

export default AudioSegment;
