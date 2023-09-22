import React from "react";
const Sidebar = ({
  children,
  userDetail,
  index,
  taskList,
  completedTasks,
  passedTasks,
  totalTask,
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
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <div className="flex flex-col w-60 min-h-full h-full bg-[#54606e] text-white">
            <header className="bg-[#384451] p-4">
              <div className="text-lg">Pecha STT Tool</div>
            </header>
            <section className="p-5 border-b border-b-[#384451]">
              <h3 className="uppercase font-bold mb-2">Project Info</h3>
              <div className="flex text-right justify-between">
                <label className="text-sm font-bold mb-2">User</label>
                <span className="text-right">{userDetail.name}</span>
              </div>
              <div className="flex text-right justify-between">
                <label className="text-sm font-bold mb-2">Group</label>
                <span className=" text-right">{userDetail.group.name}</span>
              </div>
              <div className="flex text-right justify-between">
                <label className="text-sm font-bold mb-2">Task ID</label>
                <span className=" text-right">{taskList[index]?.id}</span>
              </div>
            </section>
            <section className="p-5 border-b border-b-[#384451]">
              <h3 className="uppercase font-bold mb-2">TARGET PROGRESS</h3>
              <div
                className="tooltip tooltip-bottom w-full mt-2 mb-6"
                data-tip={`${completedTasks}/${totalTask}`}
              >
                <progress
                  className="progress progress-success"
                  value={completedTasks}
                  max={totalTask}
                ></progress>
              </div>

              <div className="flex text-right justify-between">
                <label className="text-sm font-bold mb-2">
                  {role === "TRANSCRIBER"
                    ? "Submitted"
                    : role === "REVIEWER"
                    ? "Reviewed"
                    : "Final Reviewed"}
                </label>
                <span className=" text-right">{completedTasks}</span>
              </div>
              {(role === "TRANSCRIBER" || role === "REVIEWER") && (
                <div className="flex text-right justify-between">
                  <label className="text-sm font-bold mb-2">
                    {role === "TRANSCRIBER"
                      ? "Reviewed"
                      : role === "REVIEWER"
                      ? "Final Reviewed"
                      : ""}
                  </label>
                  <span className=" text-right">{passedTasks}</span>
                </div>
              )}
              <div className="flex text-right justify-between">
                <label className="text-sm font-bold mb-2">
                  {role === "TRANSCRIBER"
                    ? "Total Assigned"
                    : role === "REVIEWER"
                    ? "Total Submitted"
                    : "Total Accepted"}
                </label>
                <span className=" text-right">{totalTask}</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
