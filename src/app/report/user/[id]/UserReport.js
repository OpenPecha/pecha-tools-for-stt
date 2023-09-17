"use client";
import React, { useEffect, useRef, useState } from "react";
import { getUserSpecificTasks, getUserSpecificTasksCount } from "@/model/task";
import PaginationControls from "@/components/PaginationControls";
import UserReportTable from "./UserReportTable";
import Select from "@/components/Select";
import DateInput from "@/components/DateInput";
import { useRouter } from "next/navigation";

const UserReport = ({ searchParams, id, users }) => {
  const [userTaskRecord, setUserTaskRecord] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [selectedOption, setSelectedOption] = useState(id ? id : "");
  const [dates, setDates] = useState({ from: "", to: "" });
  const router = useRouter();
  const page = searchParams["page"] ?? "1";
  const per_page = searchParams["per_page"] ?? "5";

  // Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 5;
  // Number of items to skip
  const skip =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0;
  const end = skip + limit;

  useEffect(() => {
    async function getUserReportByGroup() {
      const allUserSpecificTasks = await getUserSpecificTasks(
        selectedOption,
        limit,
        skip,
        dates
      );
      const totalUserSpecificTasks = await getUserSpecificTasksCount(
        selectedOption,
        dates
      );
      setUserTaskRecord(allUserSpecificTasks);
      setTotalTasks(totalUserSpecificTasks);
    }
    getUserReportByGroup();
  }, [selectedOption, skip, limit, dates]);

  const handleOptionChange = async (event) => {
    setSelectedOption(event.target.value);
    router.push(`/report/user/${event.target.value}`);
  };

  const handleDateChange = async (event) => {
    setDates((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const totalTasksCount = totalTasks;
  const pageCount = Math.ceil(totalTasksCount / limit);
  console.log(
    "end",
    end,
    "totalTasksCount",
    totalTasksCount,
    "pageCount",
    pageCount
  );

  return (
    <>
      <form className="flex flex-col md:flex-row justify-around items-center md:items-end space-y-5 space-x-0 md:space-y-0 md:space-x-10">
        <Select
          title="user_id"
          label="User"
          options={users}
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
      <div className="flex flex-col justify-center items-center mt-10">
        <UserReportTable userTaskRecord={userTaskRecord} />
        <PaginationControls
          page={page}
          per_page={per_page}
          hasNextPage={end < totalTasksCount}
          hasPrevPage={skip > 0}
          pageCount={pageCount}
        />
      </div>
    </>
  );
};

export default UserReport;
