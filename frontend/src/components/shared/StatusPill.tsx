interface StatusPillProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-600 border-red-200",
  ongoing: "bg-amber-100 text-amber-700 border-amber-200",
  "high roi": "bg-emerald-100 text-emerald-700 border-emerald-200",
  successful: "bg-green-100 text-green-700 border-green-200",
};

export const StatusPill = ({ status, className = "" }: StatusPillProps) => {
  const key = status.toLowerCase();
  const style = statusStyles[key] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style} ${className}`}
    >
      {status}
    </span>
  );
};
