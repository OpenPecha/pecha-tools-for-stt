import React from "react";
import Link from "next/link";

const Dashboard = () => {
  const links = ["department", "group", "user"];
  return (
    <div className="h-screen flex flex-col sm:flex-row justify-center items-center space-y-5 space-x-0 sm:space-y-0 sm:space-x-5">
      {links.map((link) => (
        <Link
          key={link}
          href={`/dashboard/${link}`}
          className="btn btn-accent text-base text-center w-1/2 sm:text-xl sm:w-1/5"
          type="button"
        >
          {link}
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;
