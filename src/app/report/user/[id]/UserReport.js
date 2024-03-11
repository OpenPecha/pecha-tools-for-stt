"use client";
import React, { useEffect, useRef, useState } from "react";
import { getUserSpecificTasks, getUserSpecificTasksCount } from "@/model/task";
import PaginationControls from "@/components/PaginationControls";
import UserReportTable from "./UserReportTable";
import Select from "@/components/Select";
import DateInput from "@/components/DateInput";
import { useRouter, usePathname } from "next/navigation";
import useDebounce from "@/components/hooks/useDebounceState";

const UserReport = ({ searchParams, id, users }) => {
  const [userTaskRecord, setUserTaskRecord] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [selectedOption, setSelectedOption] = useState(id ? id : "");
  const [secretAccess, setSecretAccess] = useState(false);
  const [dates, setDates] = useState({ from: "", to: "" });
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const debouncedSearchTerm = useDebounce(transcript, 1000);
  const page = searchParams["page"] ?? "1";
  const per_page = searchParams["per_page"] ?? "10";
  const isReport = pathname.includes("report");
  let allUserSpecificTasks = useRef([]);

  // Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 10;
  // Number of items to skip
  const skip =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0;
  const end = skip + limit;

  useEffect(() => {
    setIsLoading(true); // Start loading
    async function getUserReportByGroup() {
      try {
        allUserSpecificTasks.current = await getUserSpecificTasks(
          selectedOption,
          limit,
          skip,
          dates
        );
        const totalUserSpecificTasks = await getUserSpecificTasksCount(
          selectedOption,
          dates
        );
        setUserTaskRecord(allUserSpecificTasks.current); // Update state with the fetched data
        setTotalTasks(totalUserSpecificTasks); // Update state with the total count
      } catch (error) {
        console.error("Failed to fetch user report by group:", error);
        // Optionally, handle the error state in your UI as well
      } finally {
        setIsLoading(false); // End loading regardless of try/catch outcome
      }
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

  const handlePassword = (event) => {
    if (event.target.value === process.env.NEXT_PUBLIC_PASSWORD) {
      setSecretAccess(true);
    } else {
      setSecretAccess(false);
    }
  };

  const handleFilter = (event) => {
    setTranscript(event.target.value);
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filter = debouncedSearchTerm;
      const filteredTasks = allUserSpecificTasks.current.filter((task) => {
        const transcript = task.transcript;
        return transcript.includes(filter);
      });
      setUserTaskRecord(filteredTasks);
    } else {
      // Return original list of tasks
      setUserTaskRecord(allUserSpecificTasks.current);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="h-full">
      <form className="sticky top-0 z-20 p-4 gap-4 bg-white flex flex-col md:flex-row justify-center md:items-end">
        <Select
          title="user_id"
          label="User"
          options={users}
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          isReport={isReport}
        />
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <DateInput
            label="from"
            selectedDate={dates.from}
            handleDateChange={handleDateChange}
            isReport={isReport}
          />
          <DateInput
            label="to"
            selectedDate={dates.to}
            handleDateChange={handleDateChange}
            isReport={isReport}
          />
        </div>
        <div className="ml-[22%] md:ml-0 flex flex-col md:flex-row gap-4 md:gap-6">
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="input input-bordered max-w-xs"
            onChange={handlePassword}
          />
          <input
            name="filter"
            placeholder="Filter transcript"
            type="text"
            className="input input-bordered max-w-xs"
            value={transcript}
            onChange={handleFilter}
          />
        </div>
      </form>
      <div className="flex flex-col justify-center items-center my-10">
        {isLoading ? (
          <div className="text-center mt-10">
            <span className="loading loading-spinner text-success text-center"></span>
          </div>
        ) : (
          <>
            <UserReportTable
              userTaskRecord={userTaskRecord}
              secretAccess={secretAccess}
              setUserTaskRecord={setUserTaskRecord}
            />
            <PaginationControls
              page={page}
              per_page={per_page}
              hasNextPage={end < totalTasksCount}
              hasPrevPage={skip > 0}
              pageCount={pageCount}
              isReport={isReport}
              setTranscript={setTranscript}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserReport;
