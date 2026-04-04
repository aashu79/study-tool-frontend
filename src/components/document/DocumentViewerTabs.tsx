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
    <div className="rounded-[22px] border border-slate-200 bg-white p-1.5 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {!isActive ? (
                <span className="pointer-events-none absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-slate-300 opacity-0 transition group-hover:opacity-100" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentViewerTabs;
