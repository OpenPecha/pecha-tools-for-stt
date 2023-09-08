import React from "react";

const DateInput = ({ label, selectedDate, handleDateChange }) => {
  return (
    <div className="form-control w-80 sm:w-fit">
      <label className="label" htmlFor={label}>
        <span className="label-text">{label}:</span>
      </label>
      <input
        name={label}
        type="date"
        className="input input-bordered max-w-xs"
        value={selectedDate}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default DateInput;
