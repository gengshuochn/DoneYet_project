import { Activity, Dumbbell, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TabKey } from '../types/models';

const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
  { key: 'diet', label: '饮食', icon: <Utensils size={18} /> },
  { key: 'fitness', label: '健身', icon: <Dumbbell size={18} /> },
  { key: 'data', label: '数据', icon: <Activity size={18} /> }
];

export function Tabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="tabs" aria-label="主模块">
      {tabs.map((tab) => (
        <button type="button" key={tab.key} className={active === tab.key ? 'active' : ''} onClick={() => onChange(tab.key)}>
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
