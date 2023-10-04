import Link from "next/link";
import React from "react";
import { calculatePay } from "@/lib/calculatePay";
const TranscriberReportTable = ({ usersStatistic, selectGroup }) => {
  return (
    <>
      <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
        <table className="table  ">
          {/* head */}
          <thead className="text-gray-700 bg-gray-50">
            <tr>
              <th>Transcriber Name</th>
              <th>Task Submitted</th>
              <th>Task Reviewed</th>
              <th>Reviewed %</th>
              <th>Submitted Min.</th>
              <th>Reviewed Min.</th>
              <th>Reviewed min %</th>
              <th>Reviewed Syllable count</th>
              <th>Rs.</th>
            </tr>
          </thead>
          <tbody>
            {usersStatistic.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link href={`/report/user/${user.id}`}>{user.name}</Link>
                </td>
                <td>{user.noSubmitted}</td>
                <td>{user.noReviewed}</td>
                <td>
                  {user.noReviewed !== 0
                    ? ((user.noReviewed / user.noSubmitted) * 100).toFixed(2)
                    : 0}
                </td>
                <td>{user.submittedInMin}</td>
                <td>{user.reviewedInMin}</td>
                <td>
                  {user.reviewedInMin !== 0
                    ? (
                        (user.reviewedInMin / user.submittedInMin) *
                        100
                      ).toFixed(2)
                    : 0}
                </td>
                <td>{user.syllableCount}</td>
                <td>
                  {calculatePay(
                    selectGroup,
                    user.reviewedSecs,
                    user.syllableCount,
                    user.noReviewed
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TranscriberReportTable;
