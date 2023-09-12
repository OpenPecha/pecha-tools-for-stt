import React from "react";

const DateInput = ({ label, selectedDate, handleDateChange }) => {
  return (
    <div className="form-control w-fit">
      <label className="label" htmlFor={label}>
        <span className="label-text">{label}:</span>
      </label>
      <input
        name={label}
        type="datetime-local"
        className="input input-bordered max-w-xs"
        value={selectedDate}
        onChange={handleDateChange}
        max={new Date().toISOString().slice(0, 16)}
        min={"2021-01-01T00:00"}
      />
    </div>
  );
};

export default DateInput;
