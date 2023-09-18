import React from "react";
const Sidebar = ({
  children,
  userDetail,
  index,
  taskList,
  completedTask,
  role,
}) => {
  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center">
          {/* Navbar */}
          <div className="w-full navbar text-white bg-[#384451] lg:hidden">
            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-6 h-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>
            <div className="flex-1 px-2 mx-2">Pecha STT Tool</div>
          </div>
          {children}
        </div>
        <div className="drawer-side ">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <div className="flex flex-col w-60 min-h-full h-full bg-[#54606e] text-white">
            <header className="bg-[#384451] p-4">
              <div className="text-lg">Pecha STT Tool</div>
            </header>
            <section className="p-5 border-b border-b-[#384451]">
              <h3 className="uppercase font-bold mb-2">Project Info</h3>
              <div className="flex text-right justify-between capitalize">
                <label className="capitalize text-sm font-bold mb-2">
                  User
                </label>
                <span className="capitalize text-right">{userDetail.name}</span>
              </div>
              <div className="flex text-right justify-between capitalize">
                <label className="capitalize text-sm font-bold mb-2">
                  Task ID
                </label>
                <span className="capitalize text-right">
                  {taskList[index]?.id}
                </span>
              </div>
            </section>
            <section className="p-5 border-b border-b-[#384451]">
              <h3 className="uppercase font-bold mb-2">TARGET PROGRESS</h3>
              <div className="flex text-right justify-between capitalize">
                <label className="capitalize text-sm font-bold mb-2">
                  {role === "TRANSCRIBER"
                    ? "Submitted"
                    : role === "REVIEWER"
                    ? "Reviewed"
                    : "Final Reviewed"}
                </label>
                <span className="capitalize text-right">{completedTask}</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
