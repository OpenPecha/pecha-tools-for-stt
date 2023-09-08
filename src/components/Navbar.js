import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import Sidebar from "./Sidebar";
const Navbar = () => {
  return (
    <>
      <nav class="border-gray-200 bg-gray-50">
        <div class="lg:hidden flex flex-wrap items-center space-x-2 mx-auto p-4">
          <button type="button">
            <AiOutlineMenu className="w-6 h-6" />
          </button>
          <p class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            STT
          </p>
        </div>
      </nav>
      <Sidebar />
    </>
  );
};

export default Navbar;
