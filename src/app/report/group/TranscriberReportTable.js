import Link from "next/link";
import React from "react";
import { calculatePay } from "@/lib/calculatePay";
import { calculatePercent } from "@/lib/calculatePercent";
const TranscriberReportTable = ({ usersStatistic, selectGroup }) => {
  
  const glideGreentoRed = (num1, num2) => {
    // Calculate the percentage
    const percentage = calculatePercent(num1, num2);
    // if else to return the color based on the percentage
    if (percentage > 80) {
      return "bg-[#ff0000]";
    } else if (percentage > 60) {
      return "bg-[#ffa700]";
    } else if (percentage > 40) {
      return "bg-[#fff400]";
    } else if (percentage > 20) {
      return "bg-[#a3ff00]";
    } else {
      return "bg-[#2cba00]";
    }
  };

  const glideRedtoGreen = (num1, num2) => {
    // Calculate the percentage
    const percentage = calculatePercent(num1, num2);
    // if else to return the color based on the percentage
    if (percentage > 80) {
      return "bg-[#2cba00]";
    } else if (percentage > 60) {
      return "bg-[#a3ff00]";
    } else if (percentage > 40) {
      return "bg-[#fff400]";
    } else if (percentage > 20) {
      return "bg-[#ffa700]";
    } else {
      return "bg-[#ff0000]";
    }
  };

  return (
      <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
        <table className="table  ">
          {/* head */}
          <thead
            className="text-gray-700 bg-gray-50
          "
          >
            <tr>
              <th>Transcriber Name</th>
              <th>
                Task <br /> Submitted
              </th>
              <th>
                Task <br /> Reviewed
              </th>
              <th>Reviewed %</th>
              <th>Submitted Min.</th>
              <th>Reviewed Min.</th>
              <th>Reviewed min %</th>
              <th>Task Corrected %</th>
              <th>
                Reviewed <br /> Syllable count
              </th>
              <th>Rs.</th>
            </tr>
          </thead>
          <tbody>
            {usersStatistic?.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link href={`/report/user/${user.id}`}>{user.name}</Link>
                </td>
                <td>{user.noSubmitted}</td>
                <td>{user.noReviewed}</td>
                <td
                  className={`${glideRedtoGreen(
                    user.noReviewed,
                    user.noSubmitted
                  )}
                  `}
                >
                  {calculatePercent(user.noReviewed, user.noSubmitted)}
                </td>
                <td>{user.submittedInMin}</td>
                <td>{user.reviewedInMin}</td>
                <td>
                  {calculatePercent(user.reviewedInMin, user.submittedInMin)}
                </td>
                <td
                  className={`${glideGreentoRed(
                    user.noReviewedCorrected,
                    user.noReviewed
                  )} 

                  `}
                >
                  {calculatePercent(user.noReviewedCorrected, user.noReviewed)}
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
  );
};

export default TranscriberReportTable;
