import { useState, useEffect } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import FileCard from "../components/dashboard/FileCard";
import {
  Input,
  Select,
  DatePicker,
  Spin,
  Pagination,
} from "antd";
import {
  FiSearch,
  FiFolder,
  FiCalendar,
  FiRefreshCw,
  FiPlus,
  FiFilter,
} from "react-icons/fi";
import { useFiles } from "../lib/hooks/useFile";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

const MyMaterials = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: filesData, isLoading } = useFiles({
    search: debouncedSearch || undefined,
    sortOrder,
    fromDate,
    page,
    limit,
  });

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setFromDate(date ? date.format("YYYY-MM-DD") : undefined);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSortOrder("desc");
    setFromDate(undefined);
    setPage(1);
  };

  const hasActiveFilters = !!(search || fromDate || sortOrder !== "desc");

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* PAGE HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-7 text-white shadow-lg shadow-emerald-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <FiFolder size={22} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  My Study Materials
                </h1>
                <p className="text-white/80 text-sm mt-0.5 font-medium">
                  {filesData
                    ? `${filesData.total} file${filesData.total !== 1 ? "s" : ""} in your library`
                    : "Manage all your uploaded content"}
                </p>
              </div>
            </div>

            <Link
              to="/upload"
              className="inline-flex items-center gap-2 self-start md:self-auto bg-white text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
            >
              <FiPlus size={16} />
              Upload New
            </Link>
          </div>

          {/* Stats row */}
          {filesData && (
            <div className="relative z-10 mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Files", value: filesData.total },
                { label: "Current Page", value: filesData.page },
                { label: "Per Page", value: filesData.limit },
                {
                  label: "Total Pages",
                  value: Math.ceil(filesData.total / filesData.limit),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-3"
                >
                  <p className="text-white/70 text-[11px] font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FiFilter size={14} className="text-emerald-600" />
              </div>
              <span className="font-bold text-slate-800 text-sm">
                Filter & Search
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  Active
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                <FiRefreshCw size={12} />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Search Files
              </label>
              <Input
                placeholder="Search by filename..."
                prefix={<FiSearch className="text-slate-400" size={14} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl! h-10!"
                allowClear
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Sort Order
              </label>
              <Select
                value={sortOrder}
                onChange={(value) => {
                  setSortOrder(value);
                  setPage(1);
                }}
                className="w-full"
                size="middle"
                options={[
                  { value: "desc", label: "Newest First" },
                  { value: "asc", label: "Oldest First" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                From Date
              </label>
              <DatePicker
                onChange={handleDateChange}
                placeholder="Select date"
                className="w-full"
                value={fromDate ? dayjs(fromDate) : null}
                suffixIcon={<FiCalendar className="text-slate-400" size={14} />}
              />
            </div>
          </div>
        </div>

        {/* FILES GRID */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Your Files</h3>
              {filesData && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filesData.files.length} of {filesData.total} files
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : filesData?.files && filesData.files.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
                {filesData.files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>

              {filesData.total > limit && (
                <div className="flex justify-center pt-4 border-t border-slate-100">
                  <Pagination
                    current={page}
                    total={filesData.total}
                    pageSize={limit}
                    onChange={(newPage) => setPage(newPage)}
                    showSizeChanger={false}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} files`
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <FiFolder size={28} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-700 mb-1">
                {search || fromDate
                  ? "No files match your search"
                  : "No study materials yet"}
              </p>
              <p className="text-sm text-slate-400 mb-5">
                {search || fromDate
                  ? "Try adjusting your filters or search terms"
                  : "Start uploading your study materials to see them here"}
              </p>
              {!search && !fromDate && (
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-200 hover:shadow-md transition-all"
                >
                  <FiPlus size={15} />
                  Upload Materials
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyMaterials;
