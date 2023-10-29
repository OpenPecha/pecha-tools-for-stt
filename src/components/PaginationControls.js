"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const PaginationControls = ({
  page,
  per_page,
  hasNextPage,
  hasPrevPage,
  pageCount,
  isReport,
  setTranscript,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="join pt-10">
      <button
        className="join-item btn btn-accent disabled:dark:text-gray-400 disabled:dark:bg-gray-600"
        disabled={!hasPrevPage}
        onClick={() => {
          if (isReport) setTranscript("");
          router.push(
            `${pathname}/?page=${Number(page) - 1}&per_page=${per_page}`
          );
        }}
      >
        Previous
      </button>
      <button className="join-item btn">
        {page} / {pageCount}
      </button>
      <button
        className="join-item btn btn-accent disabled:dark:text-gray-400 disabled:dark:bg-gray-600"
        disabled={!hasNextPage}
        onClick={() => {
          if (isReport) setTranscript("");
          router.push(
            `${pathname}/?page=${Number(page) + 1}&per_page=${per_page}`
          );
        }}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
