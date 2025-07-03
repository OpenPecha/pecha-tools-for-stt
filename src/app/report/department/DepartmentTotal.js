import React from "react";
import { calculatePercent } from "@/lib/calculatePercent";
const DepartmentTotal = ({ usersStatistic }) => {
  const allUsersStatistic = [];

  for (let key in usersStatistic) {
    allUsersStatistic.push(...usersStatistic[key]);
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg w-11/12 md:w-4/5 max-h-[80vh]">
      <table className="table  ">
        {/* head */}
        <thead className="text-sm uppercase">
          <tr>
            <th>Department Total</th>
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
            <th>Character Error %</th>
            <th>
              Reviewed <br /> Syllable count
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td>
              <b>{allUsersStatistic?.reduce((a, b) => a + b.noSubmitted, 0)}</b>
            </td>
            <td>
              <b>{allUsersStatistic?.reduce((a, b) => a + b.noReviewed, 0)}</b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  allUsersStatistic?.reduce((a, b) => a + b.noReviewed, 0),
                  allUsersStatistic?.reduce((a, b) => a + b.noSubmitted, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {allUsersStatistic
                  ?.reduce((a, b) => a + b.submittedInMin, 0)
                  .toFixed(2)}
              </b>
            </td>
            <td>
              <b>
                {allUsersStatistic
                  ?.reduce((a, b) => a + b.reviewedInMin, 0)
                  .toFixed(2)}
              </b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  allUsersStatistic?.reduce((a, b) => a + b.reviewedInMin, 0),
                  allUsersStatistic?.reduce((a, b) => a + b.submittedInMin, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  allUsersStatistic?.reduce(
                    (a, b) => a + b.noTranscriptCorrected,
                    0
                  ),
                  allUsersStatistic?.reduce((a, b) => a + b.noReviewed, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {calculatePercent(
                  allUsersStatistic?.reduce((a, b) => a + b.cer, 0),
                  allUsersStatistic?.reduce((a, b) => a + b.characterCount, 0)
                )}
              </b>
            </td>
            <td>
              <b>
                {allUsersStatistic?.reduce((a, b) => a + b.syllableCount, 0)}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentTotal;
