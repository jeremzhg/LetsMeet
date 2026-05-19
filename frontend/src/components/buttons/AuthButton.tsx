interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const AuthButton = ({ text, className = "", ...props }: AuthButtonProps) => {
  return (
    <button
      {...props}
      className={`mb-6 w-full rounded-lg bg-blue-600 py-2.5 text-xl font-bold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] ${className}`}
    >
      {text}
    </button>
  );
};
