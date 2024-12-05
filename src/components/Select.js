import React from "react";

const Select = ({
  title,
  label,
  options,
  selectedOption,
  handleOptionChange,
  isReport,
}) => {
  return (
    <div
      className={`${
        isReport
          ? "flex flex-row gap-2 md:form-control md:gap-0"
          : "form-control"
      }`}
    >
      <label className="label w-[20%]" htmlFor={title}>
        <span className="label-text text-base font-semibold">{label}</span>
      </label>
      <select
        id={title}
        name={title}
        className="select select-bordered overflow-y-scroll"
        required
        onChange={handleOptionChange}
        value={selectedOption}
      >
        <option value={""} disabled>
          Select {label}
        </option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
