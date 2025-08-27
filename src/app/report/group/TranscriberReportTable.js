import Link from "next/link";
import React from "react";
import PropTypes from "prop-types";
import { calculatePay } from "@/lib/calculatePay";
import { calculatePercent } from "@/lib/calculatePercent";
const TranscriberReportTable = ({ usersStatistic, selectGroup }) => {
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
            <th>Trashed Min</th>
            <th>Total Audio Min</th>
            <th>Task Corrected %</th>
            <th>Character Error %</th>
            <th>
              Transcriber <br /> Syllable count
            </th>
            <th>Transcriber CER</th>
            <th>
              Reviewed <br /> Syllable count
            </th>
            <th>Rs.</th>
          </tr>
        </thead>
        <tbody>
          {usersStatistic?.map((user) => (
            <tr className="dark:text-slate-50" key={user.id}>
              <td>
                <Link href={`/report/user/${user.id}`}>{user.name}</Link>
              </td>
              <td>{user.noSubmitted}</td>
              <td>{user.noReviewed}</td>
              <td
                className={`${glideRedtoGreen(
                  user.noReviewedBasedOnSubmitted,
                  user.noSubmitted
                )}`}
              >
                {calculatePercent(
                  user.noReviewedBasedOnSubmitted,
                  user.noSubmitted
                )}
              </td>
              <td>{user.submittedInMin}</td>
              <td>{user.reviewedInMin}</td>
              <td
                className={`${glideRedtoGreen(
                  user.reviewedInMin,
                  user.submittedInMin
                )}`}
              >
                {calculatePercent(user.reviewedInMin, user.submittedInMin)}
              </td>
              <td>{user.trashedInMin}</td>
              <td>
                {parseFloat(
                  (user.reviewedInMin + user.trashedInMin).toFixed(2)
                )}
              </td>
              <td
                className={`${glideGreentoRed(
                  user.noTranscriptCorrected,
                  user.noReviewed
                )}`}
              >
                {calculatePercent(user.noTranscriptCorrected, user.noReviewed)}
              </td>
              <td
                className={`${glideGreentoRed(
                  user.totalCer,
                  user.characterCount
                )}`}
              >
                {calculatePercent(user.totalCer, user.characterCount)}
              </td>
              <td>{user.transcriberSyllableCount}</td>
              <td>{user.transcriberCer}</td>
              <td>{user.syllableCount}</td>
              <td>
                {calculatePay(
                  selectGroup,
                  user.reviewedInMin,
                  user.trashedInMin,
                  user.syllableCount,
                  user.noReviewed,
                  user.transcriberSyllableCount
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td>
              <b>{usersStatistic?.reduce((a, b) => a + b.noSubmitted, 0)}</b>
            </td>
            <td>
              <b>{usersStatistic?.reduce((a, b) => a + b.noReviewed, 0)}</b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  usersStatistic?.reduce(
                    (a, b) => a + b.noReviewedBasedOnSubmitted,
                    0
                  ),
                  usersStatistic?.reduce((a, b) => a + b.noSubmitted, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {usersStatistic
                  ?.reduce((a, b) => a + b.submittedInMin, 0)
                  .toFixed(2)}
              </b>
            </td>
            <td>
              <b>
                {usersStatistic
                  ?.reduce((a, b) => a + b.reviewedInMin, 0)
                  .toFixed(2)}
              </b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  usersStatistic?.reduce((a, b) => a + b.reviewedInMin, 0),
                  usersStatistic?.reduce((a, b) => a + b.submittedInMin, 0)
                )}
              </b>
            </td>
            <td>
              {usersStatistic
                ?.reduce((a, b) => a + b.trashedInMin, 0)
                .toFixed(2)}
            </td>
            <td>
              {parseFloat(
                (
                  usersStatistic?.reduce((a, b) => a + b.reviewedInMin, 0) +
                  usersStatistic?.reduce((a, b) => a + b.trashedInMin, 0)
                ).toFixed(2)
              ) || 0}
            </td>
            <td>
              <b>
                {calculatePercent(
                  usersStatistic?.reduce(
                    (a, b) => a + b.noTranscriptCorrected,
                    0
                  ),
                  usersStatistic?.reduce((a, b) => a + b.noReviewed, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  usersStatistic?.reduce((a, b) => a + b.totalCer, 0),
                  usersStatistic?.reduce((a, b) => a + b.characterCount, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {usersStatistic?.reduce(
                  (a, b) => a + b.transcriberSyllableCount,
                  0
                )}
              </b>
            </td>
            <td>
              <b>{usersStatistic?.reduce((a, b) => a + b.transcriberCer, 0)}</b>
            </td>
            <td>
              <b>{usersStatistic?.reduce((a, b) => a + b.syllableCount, 0)}</b>
            </td>
            <td>
              <b>
                {calculatePay(
                  selectGroup,
                  usersStatistic?.reduce((a, b) => a + b.reviewedInMin, 0),
                  usersStatistic?.reduce((a, b) => a + b.trashedInMin, 0),
                  usersStatistic?.reduce((a, b) => a + b.syllableCount, 0),
                  usersStatistic?.reduce((a, b) => a + b.noReviewed, 0)
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

TranscriberReportTable.propTypes = {
  usersStatistic: PropTypes.arrayOf(PropTypes.object),
  selectGroup: PropTypes.any,
};

export default TranscriberReportTable;
