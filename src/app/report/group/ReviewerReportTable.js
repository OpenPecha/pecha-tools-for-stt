import { calculatePercent } from "@/lib/calculatePercent";
import Link from "next/link";
import React from "react";

const ReviewerReportTable = ({ reviewersStatistic }) => {
  const glideGreentoRed = (num1, num2) => {
    // Calculate the percentage
    const percentage = calculatePercent(num1, num2);
    // if else to return the color based on the percentage
    if (percentage > 90) {
      return "bg-[#ff0000]"; // Red
    } else if (percentage > 80) {
      return "bg-[#ff4500]"; // Red-orange
    } else if (percentage > 70) {
      return "bg-[#ff7700]"; // Dark orange
    } else if (percentage > 60) {
      return "bg-[#ffa700]"; // Orange
    } else if (percentage > 50) {
      return "bg-[#ffc700]"; // Orange-yellow
    } else if (percentage > 40) {
      return "bg-[#fff400]"; // Yellow
    } else if (percentage > 30) {
      return "bg-[#cfff00]"; // Light lime green
    } else if (percentage > 20) {
      return "bg-[#a3ff00]"; // Lime green
    } else if (percentage > 10) {
      return "bg-[#4edc00]"; // Light green
    } else {
      return "bg-[#2cba00]"; // Dark green
    }
  };

  const glideRedtoGreen = (num1, num2) => {
    // Calculate the percentage
    const percentage = calculatePercent(num1, num2);
    // if else to return the color based on the percentage
    if (percentage > 90) {
      return "bg-[#2cba00]"; // Dark green
    } else if (percentage > 80) {
      return "bg-[#4edc00]"; // Light green
    } else if (percentage > 70) {
      return "bg-[#a3ff00]"; // Lime green
    } else if (percentage > 60) {
      return "bg-[#cfff00]"; // Light lime green
    } else if (percentage > 50) {
      return "bg-[#fff400]"; // Yellow
    } else if (percentage > 40) {
      return "bg-[#ffc700]"; // Orange-yellow
    } else if (percentage > 30) {
      return "bg-[#ffa700]"; // Orange
    } else if (percentage > 20) {
      return "bg-[#ff7700]"; // Dark orange
    } else if (percentage > 10) {
      return "bg-[#ff4500]"; // Red-orange
    } else {
      return "bg-[#ff0000]"; // Red
    }
  };

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
      <table className="table">
        {/* head */}
        <thead className="text-sm uppercase">
          <tr>
            <th>Reviewer Name</th>
            <th>Task Reviewed</th>
            <th>Task Accepted</th>
            <th>Task Finalised</th>
            <th>Reviewed minutes</th>
            <th>Finalised %</th>
            <th>Task Corrected %</th>
            <th>Character Error %</th>
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
              <td>{reviewer.reviewedInMin}</td>
              <td
                className={`${glideRedtoGreen(
                  reviewer.noFinalised,
                  reviewer.noReviewed
                )}`}
              >
                {calculatePercent(reviewer.noFinalised, reviewer.noReviewed)}
              </td>
              <td
                className={`${glideGreentoRed(
                  reviewer.noReviewedTranscriptCorrected,
                  reviewer.noFinalised
                )}`}
              >
                {calculatePercent(
                  reviewer.noReviewedTranscriptCorrected,
                  reviewer.noFinalised
                )}
              </td>
              <td
                className={`${glideGreentoRed(
                  reviewer.totalCer,
                  reviewer.characterCount
                )}`}
              >
                {calculatePercent(reviewer.totalCer, reviewer.characterCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewerReportTable;
