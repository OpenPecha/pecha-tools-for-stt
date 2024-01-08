import { getAllGroup, getAllGroupTaskStats } from "@/model/group";
import React from "react";
import GroupImportStats from "./GroupImportStats";
import TaskStats from "./TaskStats";

const Stats = async () => {

/*
Prisma is getting too slow for this task, so let's do it in SQL instead:

select count(*),
    t.state,
    g.name as group_name,
    d.name as department_name
from "Task" t
    join "Group" g on t.group_id = g.id
    join "Department" d on g.department_id = d.id
group by d.id,
    g.id,
    t.state
order by d.name,
    g.name;
*/
  const allGroup = await getAllGroup();
  const groupStatByDept = await getAllGroupTaskStats(allGroup);

  // make a grid of groupStat of 4 columns
  return (
    <>
      {groupStatByDept && groupStatByDept.length > 0 && (
        <div className="m-5 md:m-10">
          <div className="text-xl md:text-2xl text-center font-bold">
            Group stats on imported task
          </div>
          {groupStatByDept.map((groupStat, index) => (
            <div
              key={index}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5"
            >
              <GroupImportStats groupStat={groupStat} />
            </div>
          ))}
          <TaskStats groupStatByDept={groupStatByDept} />
        </div>
      )}
    </>
  );
};

export default Stats;
