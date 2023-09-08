"use client";
import DateInput from "@/components/DateInput";
import Select from "@/components/Select";
import { generateUserReportByGroup } from "@/model/user";
import React, { useEffect, useRef, useState } from "react";

const ReportForm = ({ id, options, title, label, setList, generateReport }) => {
  const [selectedOption, setSelectedOption] = useState(id ? id : "");
  const [dates, setDates] = useState({ from: "", to: "" });
  const ref = useRef(null);

  useEffect(() => {
    if (id) {
      async function getUserReportByGroup() {
        const usersOfGroup = await generateReport(id, dates);
        setList(usersOfGroup);
      }
      getUserReportByGroup();
      console.log("id", id);
    }
  }, []);

  const handleOptionChange = async (event) => {
    setSelectedOption(event.target.value);
    const usersOfGroup = await generateReport(event.target.value, dates);
    setList(usersOfGroup);
  };

  const handleDateChange = async (event) => {
    setDates((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    if (selectedOption) {
      console.log("dates", dates, "and", dates.from, dates.to);
      const usersOfGroup = await generateReport(selectedOption, {
        ...dates,
        [event.target.name]: event.target.value,
      });
      setList(usersOfGroup);
    }
  };

  return (
    <>
      <form
        ref={ref}
        onChange={(e) => console.log("form changed", e.target.value)}
        className="flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10"
      >
        <Select
          title={title}
          label={label}
          options={options}
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
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
    </>
  );
};

export default ReportForm;
