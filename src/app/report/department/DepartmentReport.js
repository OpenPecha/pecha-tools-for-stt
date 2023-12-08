"use client";
import React, { useEffect, useState } from "react";
import {
  generateUserReportByGroup,
  generateReviewerReportbyGroup,
  generateFinalReviewerReportbyGroup,
} from "@/model/user";
import Select from "@/components/Select";
import DateInput from "@/components/DateInput";
import TranscriberReportTable from "../group/TranscriberReportTable";
import ReviewerReportTable from "../group/ReviewerReportTable";
import DepartmentTotal from "./DepartmentTotal";
import FinalReviewerTable from "../group/FinalReviewerTable";

const DepartmentReport = ({ departments }) => {
  const [usersStatistic, setUsersStatistic] = useState({});
  const [reviewersStatistic, setReviewersStatistic] = useState({});
  const [finalReviewersStatistic, setFinalReviewersStatistic] = useState({});
  const [selectDepartment, setSelectDepartment] = useState("");
  const [dates, setDates] = useState({ from: "", to: "" });

  const handleDepartmentChange = async (event) => {
    setSelectDepartment(event.target.value);
  };

  const handleDateChange = async (event) => {
    setDates((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  function getGroupByDepartmentId(departmentId) {
    if (!departmentId) return [];
    return departments.find(
      (department) => department.id === parseInt(departmentId)
    )?.groups;
  }

  useEffect(() => {
    if (selectDepartment) {
      async function getUserReportByGroup() {
        for (let group of getGroupByDepartmentId(selectDepartment)) {
          const usersOfGroup = await generateUserReportByGroup(group.id, dates);
          setUsersStatistic((prev) => ({ ...prev, [group.id]: usersOfGroup }));
        }
      }

      async function getReviewerReportByGroup() {
        for (let group of getGroupByDepartmentId(selectDepartment)) {
          const reviewersOfGroup = await generateReviewerReportbyGroup(
            group.id,
            dates
          );
          setReviewersStatistic((prev) => ({
            ...prev,
            [group.id]: reviewersOfGroup,
          }));
        }
      }
      async function getFinalReviewerReportByGroup() {
        for (let group of getGroupByDepartmentId(selectDepartment)) {
          const finalReviewersOfGroup =
            await generateFinalReviewerReportbyGroup(group.id, dates);
          setFinalReviewersStatistic((prev) => ({
            ...prev,
            [group.id]: finalReviewersOfGroup,
          }));
        }
      }
      getFinalReviewerReportByGroup();
      getUserReportByGroup();
      getReviewerReportByGroup();
    }
  }, [selectDepartment, dates]);

  const isEmpty = (obj) => Object.keys(obj).length === 0;

  return (
    <>
      <form className="sticky top-0 z-20 py-8 bg-white dark:bg-gray-800 flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10">
        <Select
          title="department_id"
          label="department"
          options={departments}
          selectedOption={selectDepartment}
          handleOptionChange={handleDepartmentChange}
        />
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <DateInput
            label="from"
            selectedDate={dates.from}
            handleDateChange={handleDateChange}
          />
          <DateInput
            label="to"
            selectedDate={dates.to}
            handleDateChange={handleDateChange}
          />
        </div>
      </form>
      <div className="w-full">
        {isEmpty(usersStatistic) &&
        isEmpty(reviewersStatistic) &&
        selectDepartment !== "" ? (
          <div className="text-center mt-10">
            <span className="loading loading-spinner text-success text-center"></span>
          </div>
        ) : (
          <>
            {getGroupByDepartmentId(selectDepartment).map((group) => (
              <>
                <div
                  key={group.id}
                  className="flex flex-col gap-10 justify-center items-center my-8"
                >
                  <h1>{group.name}</h1>
                  <TranscriberReportTable
                    usersStatistic={usersStatistic[group.id]}
                    selectGroup={group.id}
                  />
                  <ReviewerReportTable
                    reviewersStatistic={reviewersStatistic[group.id]}
                  />
                  <FinalReviewerTable
                    finalReviewersStatistic={finalReviewersStatistic[group.id]}
                  />
                </div>
              </>
            ))}
            {!isEmpty(usersStatistic) && (
              <div className="flex justify-center items-center my-8">
                <DepartmentTotal usersStatistic={usersStatistic} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default DepartmentReport;
