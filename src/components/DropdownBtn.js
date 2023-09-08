"use client";

import React, { useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import DashboardBtn from "./DashboardBtn";

const DropdownBtn = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <div className="relative text-center">
        <DashboardBtn
          label="Select Group"
          icon={<IoIosArrowDropdown />}
          onClick={toggleDropdown}
        />
        {showDropdown && (
          <div className="absolute z-40 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow w-[310px] sm:w-64 ml-[74px]">
            <ul
              className="py-2 text-sm text-gray-700"
              aria-labelledby="dropdownDefaultButton"
            >
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Settings
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default DropdownBtn;
