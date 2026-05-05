interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'feed', label: 'Hardening feed' },
    { id: 'analytics', label: 'Climate analytics' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'map', label: '🗺️ Map' },
    { id: 'provost', label: 'Provost portal' },
  ];

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
