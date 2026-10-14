import React from 'react';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-[#292929] overflow-x-auto pb-px', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer select-none',
              isActive
                ? 'border-[#FFC21A] text-[#FFC21A]'
                : 'border-transparent text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#383838]'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 text-[10px] rounded-full font-bold tabular-nums',
                  isActive ? 'bg-[#FFC21A] text-[#080808]' : 'bg-[#1C1C1C] text-[#A5A5A5]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
