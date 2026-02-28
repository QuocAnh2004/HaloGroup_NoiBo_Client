
import React from 'react';

export interface TabOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  activeColorClass?: string; // Class màu text khi active (vd: text-indigo-600)
  activeBgClass?: string;    // Class màu background badge khi active (vd: bg-indigo-50)
}

interface TabTriggersProps<T> {
  tabs: TabOption<T>[];
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
}

function TabTriggers<T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabTriggersProps<T>) {

  return (
    <div className={`flex gap-8 border-b border-slate-100 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const activeTextClass = tab.activeColorClass || 'text-indigo-600';
        const activeBadgeClass = tab.activeBgClass || 'bg-indigo-50';
        
        return (
          <button
            key={String(tab.value)}
            onClick={() => onTabChange(tab.value)}
            className={`pb-4 flex items-center gap-2 text-sm font-medium transition-all relative ${
              isActive ? activeTextClass : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon && <span className={isActive ? `fill-current opacity-20` : ''}>{tab.icon}</span>}
            {tab.label}
            
            {tab.count !== undefined && (
              <span className={`ml-1 px-2.5 py-0.5 rounded-full text-[10px] ${
                isActive ? `${activeBadgeClass} ${activeTextClass}` : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
            
            {isActive && (
              <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-t-full bg-current`}></span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default TabTriggers;
