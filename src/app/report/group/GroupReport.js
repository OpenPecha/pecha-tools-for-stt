"use client";
import React, { useEffect, useState } from "react";
import {
  generateUserReportByGroup,
  generateReviewerReportbyGroup,
} from "@/model/user";
import TranscriberReportTable from "./TranscriberReportTable";
import ReviewerReportTable from "./ReviewerReportTable";
import Select from "@/components/Select";
import DateInput from "@/components/DateInput";

const GroupReport = ({ groups }) => {
  const [usersStatistic, setUsersStatistic] = useState([]);
  const [reviewersStatistic, setReviewersStatistic] = useState([]);
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
      <form className="sticky top-0 z-20 py-8 bg-white flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10">
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
        <TranscriberReportTable
          usersStatistic={usersStatistic}
          selectGroup={selectGroup}
        />
        <ReviewerReportTable reviewersStatistic={reviewersStatistic} />
      </div>
    </>
  );
};

export default GroupReport;
