import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
  change,
  trend
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {change !== undefined && trend && (
          <div className="flex items-center pt-1">
            <span
              className={`text-xs font-medium ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {change > 0 ? "+" : ""}{change}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              desde el mes pasado
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};