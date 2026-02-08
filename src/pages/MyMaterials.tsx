import { useState, useEffect } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import FileCard from "../components/dashboard/FileCard";
import {
  Input,
  Select,
  DatePicker,
  Button,
  Spin,
  Empty,
  Pagination,
} from "antd";
import {
  FiSearch,
  FiFilter,
  FiFolder,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { useFiles } from "../lib/hooks/useFile";
import dayjs from "dayjs";

const MyMaterials = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
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
    if (date) {
      setFromDate(date.format("YYYY-MM-DD"));
    } else {
      setFromDate(undefined);
    }
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSortOrder("desc");
    setFromDate(undefined);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Blur blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-300/30 rounded-full blur-[140px]" />

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiFolder className="text-3xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-2">
                  My Study Materials
                </h1>
                <p className="text-white/90 text-sm md:text-base font-medium">
                  Access and manage all your uploaded study materials in one
                  place
                </p>
              </div>
            </div>

            {/* Stats */}
            {filesData && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/80 text-xs font-medium mb-1">
                    Total Files
                  </p>
                  <p className="text-2xl font-black">{filesData.total}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/80 text-xs font-medium mb-1">
                    Current Page
                  </p>
                  <p className="text-2xl font-black">{filesData.page}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/80 text-xs font-medium mb-1">
                    Per Page
                  </p>
                  <p className="text-2xl font-black">{filesData.limit}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/80 text-xs font-medium mb-1">
                    Total Pages
                  </p>
                  <p className="text-2xl font-black">
                    {Math.ceil(filesData.total / filesData.limit)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-teal-600 text-xl" />
            <h3 className="font-bold text-slate-800 text-lg">
              Filter & Search
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Files
              </label>
              <Input
                placeholder="Search by filename..."
                prefix={<FiSearch className="text-slate-400" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="!rounded-lg !h-10"
                allowClear
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort Order
              </label>
              <Select
                value={sortOrder}
                onChange={(value) => {
                  setSortOrder(value);
                  setPage(1);
                }}
                className="w-full"
                options={[
                  { value: "desc", label: "Newest First" },
                  { value: "asc", label: "Oldest First" },
                ]}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                From Date
              </label>
              <DatePicker
                onChange={handleDateChange}
                placeholder="Select date"
                className="w-full"
                value={fromDate ? dayjs(fromDate) : null}
                suffixIcon={<FiCalendar className="text-slate-400" />}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleReset}
              icon={<FiRefreshCw size={14} />}
              className="!rounded-lg"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* FILES GRID */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              Your Files
            </h3>
            {filesData && (
              <p className="text-sm text-slate-500">
                Showing {filesData.files.length} of {filesData.total} files
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : filesData?.files && filesData.files.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {filesData.files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>

              {/* Pagination */}
              {filesData.total > limit && (
                <div className="flex justify-center pt-4 border-t border-slate-200">
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
            <Empty
              description={
                <div className="text-center py-12">
                  <p className="text-slate-600 font-medium mb-2">
                    No study materials found
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    {search || fromDate
                      ? "Try adjusting your filters or search terms"
                      : "Start uploading your study materials to see them here"}
                  </p>
                  {!search && !fromDate && (
                    <Button
                      type="primary"
                      href="/upload"
                      className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !rounded-lg !h-10 !px-6 !font-semibold"
                    >
                      Upload Materials
                    </Button>
                  )}
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyMaterials;
