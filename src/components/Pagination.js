"use client";

import React from "react";

const Pagination = ({ setCurrentPage, currentPage, nPage }) => {
  let pages = [];

  for (let i = 1; i <= nPage; i++) {
    pages.push(i);
  }

  const prevPage = () => {
    if (currentPage != 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage !== nPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <div className="flex justify-center items-center">
      <nav aria-label="Page navigation" className="fixed bottom-6">
        <ul className="inline-flex -space-x-px text-base h-10">
          <li>
            <a
              href="#"
              className="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
              onClick={prevPage}
            >
              Previous
            </a>
          </li>
          {pages.map((page, index) => {
            return (
              <li key={index} onClick={() => setCurrentPage(page)}>
                <a
                  className={`flex items-center justify-center px-4 h-10 text-blue-600 border border-gray-300 bg-blue-50
                  ${page === currentPage ? "active:bg-blue-200" : "bg-white"}`}
                  href="#"
                >
                  {page}
                </a>
              </li>
            );
          })}
          <li>
            <a
              href="#"
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
              onClick={nextPage}
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
