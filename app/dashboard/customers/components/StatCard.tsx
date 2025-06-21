import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface StatCardProps {
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
    <Card className="border border-border/40 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-1.5 rounded-full bg-${iconColor.replace('text-', '')}/10`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-0">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== undefined && trend && (
          <div className="flex items-center mt-2">
            <div className={`flex items-center justify-center p-1 rounded-full mr-1.5 ${
              trend === "up"
                ? "bg-green-500/10 text-green-500"
                : trend === "down"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </div>
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

export default StatCard;