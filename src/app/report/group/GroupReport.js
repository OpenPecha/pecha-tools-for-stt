"use client";
import React, { useEffect, useState } from "react";
import {
  generateUserReportByGroup,
  generateReviewerReportbyGroup,
  generateFinalReviewerReportbyGroup,
} from "@/model/user";
import TranscriberReportTable from "./TranscriberReportTable";
import ReviewerReportTable from "./ReviewerReportTable";
import Select from "@/components/Select";
import DateInput from "@/components/DateInput";
import FinalReviewerTable from "./FinalReviewerTable";

const GroupReport = ({ groups }) => {
  const [usersStatistic, setUsersStatistic] = useState([]);
  const [reviewersStatistic, setReviewersStatistic] = useState([]);
  const [finalReviewersStatistic, setFinalReviewersStatistic] = useState([]);
  const [selectGroup, setSelectGroup] = useState("");
  const [dates, setDates] = useState({ from: "", to: "" });

  useEffect(() => {
    if (selectGroup) {
      async function getUserReportByGroup() {
        const usersOfGroup = await generateUserReportByGroup(
          selectGroup,
          dates
        );
        setUsersStatistic(usersOfGroup);
      }
      async function getReviewerReportByGroup() {
        const reviewersOfGroup = await generateReviewerReportbyGroup(
          selectGroup,
          dates
        );
        setReviewersStatistic(reviewersOfGroup);
      }
      async function getFinalReviewerReportByGroup() {
        const finalReviewersOfGroup = await generateFinalReviewerReportbyGroup(
          selectGroup,
          dates
        );
        setFinalReviewersStatistic(finalReviewersOfGroup);
      }
      getFinalReviewerReportByGroup();
      getReviewerReportByGroup();
      getUserReportByGroup();
    }
  }, [selectGroup, dates]);

  const handleGroupChange = async (event) => {
    setSelectGroup(event.target.value);
  };

  const handleDateChange = async (event) => {
    setDates((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <>
      <form className="sticky top-0 z-20 py-8 bg-white dark:bg-gray-800 flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10">
        <Select
          title="group_id"
          label="group"
          options={groups}
          selectedOption={selectGroup}
          handleOptionChange={handleGroupChange}
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
      <div className="flex flex-col gap-10 justify-center items-center mt-10">
        {usersStatistic?.length === 0 &&
        reviewersStatistic?.length === 0 &&
        selectGroup ? (
          <div className="text-center mt-10">
            <span className="loading loading-spinner text-success text-center"></span>
          </div>
        ) : (
          <>
            <TranscriberReportTable
              usersStatistic={usersStatistic}
              selectGroup={selectGroup}
            />
            <ReviewerReportTable reviewersStatistic={reviewersStatistic} />
            <FinalReviewerTable
              finalReviewersStatistic={finalReviewersStatistic}
            />
          </>
        )}
      </div>
    </>
  );
};

export default GroupReport;
