interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const ScoreBadge = ({ score, size = "md", label }: ScoreBadgeProps) => {
  const getColor = () => {
    if (score >= 90) return { stroke: "#16a34a", text: "text-green-600", bg: "bg-green-50" };
    if (score >= 70) return { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-50" };
    return { stroke: "#6b7280", text: "text-gray-500", bg: "bg-gray-100" };
  };

  const color = getColor();

  const sizeMap = {
    sm: { container: "w-12 h-12", fontSize: "text-sm", strokeWidth: 3, radius: 20 },
    md: { container: "w-16 h-16", fontSize: "text-lg", strokeWidth: 3.5, radius: 28 },
    lg: { container: "w-20 h-20", fontSize: "text-2xl", strokeWidth: 4, radius: 34 },
  };

  const s = sizeMap[size];
  const circumference = 2 * Math.PI * s.radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${s.container} flex items-center justify-center`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={s.radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={s.strokeWidth}
          />
          <circle
            cx="40"
            cy="40"
            r={s.radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`relative font-bold ${s.fontSize} ${color.text}`}>
          {Math.round(score)}
        </span>
      </div>
      {label && <span className="text-xs text-gray-500 text-center">{label}</span>}
    </div>
  );
};
