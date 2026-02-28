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
    <div className="rounded-xl bg-white border border-slate-200/80 p-1 shadow-sm">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex-1 overflow-hidden rounded-lg px-3 py-2.5 text-center transition-all duration-200 ${
                isActive
                  ? `${tab.activeClasses} shadow-sm`
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r ${tab.glowClasses} ${
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-40 transition-opacity"
                }`}
              />
              <div className="flex items-center justify-center gap-2">
                <Icon size={15} />
                <span className="font-semibold text-sm">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentViewerTabs;
