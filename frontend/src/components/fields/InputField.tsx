import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconSrc: string;
  iconAlt: string;
  containerClassName?: string;
  inputClassName?: string;
}

export const InputField = ({
  label,
  iconSrc,
  iconAlt,
  containerClassName = "mb-5",
  inputClassName = "py-2",
  ...props
}: InputFieldProps) => {
  return (
    <>
      <h2 className="mb-1.5 ml-1 text-xl font-semibold text-black">{label}</h2>
      <div className={`relative ${containerClassName}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <img src={iconSrc} alt={iconAlt} className="h-5 w-5 opacity-50" />
        </div>
        <input
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 pr-3 pl-11 text-sm text-gray-800 transition-all duration-200 outline-none focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
          {...props}
        />
      </div>
    </>
  );
};
