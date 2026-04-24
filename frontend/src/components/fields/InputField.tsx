import React, { ReactNode } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconSrc: string;
  iconAlt: string;
  containerClassName?: string;
  inputClassName?: string;
  rightElement?: ReactNode;
}

export const InputField = ({
  label,
  iconSrc,
  iconAlt,
  containerClassName = "mb-6",
  inputClassName = "py-2.5",
  rightElement,
  ...props
}: InputFieldProps) => {
  return (
    <>
      <h2 className="mb-2 ml-1 text-sm font-semibold text-gray-800">{label}</h2>
      <div className={`relative ${containerClassName}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <img src={iconSrc} alt={iconAlt} className="h-4 w-4 opacity-60" />
        </div>
        <input
          className={`w-full rounded-full border border-gray-400 bg-white pr-10 pl-10 text-sm text-gray-800 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${inputClassName}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {rightElement}
          </div>
        )}
      </div>
    </>
  );
};
