import { StatCard, type StatCardProps } from "./StatCard";

interface StatsPanelProps {
  stats: (Omit<StatCardProps, 'description'> & { description?: string })[];
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={`${stat.title}-${index}`}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description || `${typeof stat.value === 'string' ? stat.value : stat.value.toString()} ${stat.title.toLowerCase()}`}
          iconColor={stat.iconColor || "text-primary"}
          change={stat.change}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

StatsPanel.displayName = "StatsPanel";
export type { StatsPanelProps };
export default StatsPanel;