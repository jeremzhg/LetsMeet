import React from "react";

interface SelectFieldProps {
  label: string;
  iconSrc: string;
  iconAlt: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  containerClassName?: string;
  required?: boolean;
}

export const SelectField = ({
  label,
  iconSrc,
  iconAlt,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  containerClassName = "mb-6",
  required,
}: SelectFieldProps) => {
  return (
    <>
      <h2 className="mb-2 ml-1 text-sm font-semibold text-gray-800">{label}</h2>
      <div className={`relative ${containerClassName}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <img src={iconSrc} alt={iconAlt} className="h-4 w-4 opacity-60" />
        </div>
        <select
          className="w-full appearance-none rounded-full border border-gray-400 bg-white py-2.5 pr-10 pl-10 text-sm text-gray-800 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4 text-gray-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </>
  );
};
