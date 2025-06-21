import { StatCard, type StatCardProps } from "./StatCard";

interface StatsPanelProps {
  stats: Omit<StatCardProps, 'description'>[];
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={`${stat.value} ${stat.title.toLowerCase()}`}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
};

StatsPanel.displayName = "StatsPanel";
export type { StatsPanelProps };
export default StatsPanel;