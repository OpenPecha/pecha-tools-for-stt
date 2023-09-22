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
  const [userStatistics, setUserStatistics] = useState([]);
  const [reviewerStatistics, setReviewerStatistics] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [dates, setDates] = useState({ from: "", to: "" });

  useEffect(() => {
    console.log("inside useffect");
    if (selectedGroup) {
      console.log("inside if", selectedGroup);
      fetchUserReportByGroup();
      fetchReviewerReportByGroup();
    }
  }, [selectedGroup, dates]);

  const fetchUserReportByGroup = async () => {
    console.log("fetchUserReportByGroup called");
    const usersOfGroup = await generateUserReportByGroup(selectedGroup, dates);
    setUserStatistics(usersOfGroup);
  };

  const fetchReviewerReportByGroup = async () => {
    console.log("fetchReviewerReportByGroup called");
    const reviewersOfGroup = await generateReviewerReportbyGroup(
      selectedGroup,
      dates
    );
    setReviewerStatistics(reviewersOfGroup);
  };

  const handleGroupChange = (event) => {
    console.log("handleGroupChange", event.target.value);
    setSelectedGroup(event.target.value);
  };

  const handleDateChange = (event) => {
    setDates((prevDates) => ({
      ...prevDates,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <>
      <form className="flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10">
        <Select
          title="group_id"
          label="group"
          options={groups}
          selectedOption={selectedGroup}
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
          userStatistics={userStatistics}
          selectedGroup={selectedGroup}
        />
        <ReviewerReportTable reviewerStatistics={reviewerStatistics} />
      </div>
    </>
  );
};

export default GroupReport;
