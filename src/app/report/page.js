import { getAllGroup } from "@/model/group";
import React from "react";
import ReportForm from "./ReportForm";

const Report = async () => {
  const groups = await getAllGroup();
  return (
    <div className="h-screen my-10">
      <ReportForm options={groups} title="group_id" label=" Groups" />
      <div className="flex justify-center items-center mt-10">
        <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
          <table className="table  ">
            {/* head */}
            <thead className="text-gray-700 bg-gray-50">
              <tr>
                <th></th>
                <th>Name</th>
                <th>Task Completed</th>
                <th>Reviewed Completed</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <th>1</th>
                <td>Tenzin</td>
                <td>22</td>
                <td>10</td>
              </tr>
              {/* row 2 */}
              <tr>
                <th>2</th>
                <td>Sonam</td>
                <td>40</td>
                <td>15</td>
              </tr>
              {/* row 3 */}
              <tr>
                <th>3</th>
                <td>Tashi</td>
                <td>15</td>
                <td>5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;
