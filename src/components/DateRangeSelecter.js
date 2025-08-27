import React, { useState } from "react";
import { DateRangePicker } from "react-date-range";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import DateInput from "./DateInput";

const DateRangeSelector = ({ dates, setDates }) => {
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const handleSelect = (ranges) => {
    const { selection } = ranges;
    // Validate date range: end date should not be before the start date
    if (selection.endDate < selection.startDate) {
      // Reset to this month if invalid
      setDates([
        {
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
          key: "selection",
        },
      ]);
    } else {
      setDates([selection]);
    }
  };

  const openDateModal = () => setIsDateModalOpen(true);
  const closeDateModal = () => setIsDateModalOpen(false);
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-6">
      <DateInput
        label="from"
        selectedDate={dates.startDate}
        handleDateChange={handleSelect}
      />
      <DateInput
        label="to"
        selectedDate={dates.endDate}
        handleDateChange={handleSelect}
      />
      <button
        onClick={openDateModal}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Date Filter
      </button>
      <Modal isOpen={isDateModalOpen} onClose={closeDateModal}>
        <DateRangePicker
          ranges={dates}
          onChange={handleSelect}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
        />
      </Modal>
    </div>
  );
};

export default DateRangeSelector;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg ">
        {children}
        <button
          onClick={onClose}
          className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};
