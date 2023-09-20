"use client";

import React from "react";

const DashboardBtn = ({ label, icon, onClick }) => {
  return (
    <button
      type="button"
      className="btn sm:btn-wide btn-accent text-base sm:text-lg  rounded-md"
      onClick={onClick}
    >
      <div className="flex whitespace-nowrap justify-center items-center space-x-2">
        <p>{label}</p>
        <div className="flex items-center w-8 h-8">{icon}</div>
      </div>
    </button>
  );
};

export default DashboardBtn;
