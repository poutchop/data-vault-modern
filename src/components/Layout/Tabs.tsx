interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

export default function Tabs({ activeTab, setActiveTab, isAdmin }: TabsProps) {
  const allTabs = [
    { id: 'scanner', label: '📠 Scanner', role: 'field' },
    { id: 'analytics', label: 'Impact Wall', role: 'field' },
    { id: 'leaderboard', label: 'Leaderboard', role: 'field' },
    { id: 'feed', label: 'Hardening feed', role: 'admin' },
    { id: 'map', label: '🗺️ Map', role: 'admin' },
    { id: 'main', label: 'Main portal', role: 'admin' },
  ];

  const tabs = allTabs.filter(t => isAdmin || t.role === 'field');

  return (
    <div className="bg-surf border-b border-border px-6 flex gap-0.5 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-green-custom border-green-custom'
              : 'text-muted border-transparent hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
