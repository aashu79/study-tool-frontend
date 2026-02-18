import type { Tab, TabType } from "../../lib/hooks/useTabs";

interface DocumentViewerTabsProps {
  tabs: Tab[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const DocumentViewerTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: DocumentViewerTabsProps) => {
  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 p-2 shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${
                isActive
                  ? `${tab.activeClasses} shadow-md`
                  : "border-transparent bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tab.glowClasses} ${
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-60 transition-opacity"
                }`}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    isActive
                      ? tab.iconClasses
                      : "bg-white text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="font-semibold text-sm sm:text-base">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentViewerTabs;
