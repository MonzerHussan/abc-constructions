import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color = "bg-amber-50 text-amber-600" }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1",
                trend.positive ? "text-success-600" : "text-danger-600"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}%
            </p>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
