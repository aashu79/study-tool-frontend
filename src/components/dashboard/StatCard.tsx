import type { IconType } from "react-icons";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface StatCardProps {
  icon: IconType;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  iconColor = "#10b981",
  iconBgColor = "#d1fae5",
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>

      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
        {value}
      </h3>

      {trend && (
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend.isPositive ? (
              <FiTrendingUp size={11} />
            ) : (
              <FiTrendingDown size={11} />
            )}
            <span>{trend.value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
