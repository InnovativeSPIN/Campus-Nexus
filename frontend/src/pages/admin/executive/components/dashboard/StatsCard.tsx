import { ReactNode } from 'react';
import { cn } from '@/pages/admin/executive/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function StatsCard({ title, value, icon, change, changeType = 'neutral', className }: StatsCardProps) {
  return (
    <div className={cn('rounded-xl bg-card p-6 card-shadow border border-border', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-destructive',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <span className="text-primary">{icon}</span>
        </div>
      </div>
    </div>
  );
}
