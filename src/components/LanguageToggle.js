import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import Sidebar from "./Sidebar";
import { useContext } from "react";
import AppContext from "./AppContext";
const Navbar = () => {
    const value = useContext(AppContext);
    let { languageSelected, setLanguageSelected } = value;
    return (
        <>
            <label class="relative inline-flex items-center mb-5 cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer" onChange={() => setLanguageSelected((prev) => prev === "en" ? "bo" : "en")} />
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{languageSelected}</span>
            </label>
        </>
    );
};

export default Navbar;
