import Link from "next/link";
import React from "react";

const ReviewerReportTable = ({ reviewersStatistic }) => {
  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
      <table className="table  ">
        {/* head */}
        <thead className="text-gray-700 bg-gray-50">
          <tr>
            <th>Reviewer Name</th>
            <th>Task Reviewed</th>
            <th>Task Accepted</th>
            <th>Task Finalised</th>
            <th>Reviewed minutes</th>
          </tr>
        </thead>
        <tbody>
          {reviewersStatistic?.map((reviewer) => (
            <tr key={reviewer.id}>
              <td>
                <Link href={`/report/user/${reviewer.id}`}>
                  {reviewer.name}
                </Link>
              </td>
              <td>{reviewer.noReviewed}</td>
              <td>{reviewer.noAccepted}</td>
              <td>{reviewer.noFinalised}</td>
              <td>{(reviewer.reviewedSecs / 60).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewerReportTable;
