import { Card } from "antd";
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
  iconColor = "#4f46e5",
  iconBgColor = "#e0e7ff",
}: StatCardProps) => {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 border border-slate-200 h-full"
      bodyStyle={{ padding: "1.5rem" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon size={24} style={{ color: iconColor }} />
          </div>

          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{value}</h3>

          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.isPositive ? (
                <FiTrendingUp className="text-emerald-500" size={16} />
              ) : (
                <FiTrendingDown className="text-rose-500" size={16} />
              )}
              <span
                className={
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
