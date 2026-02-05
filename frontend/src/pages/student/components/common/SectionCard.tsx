import { cn } from '@/pages/student/lib/utils';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  className
}: SectionCardProps) {
  return (
    <div className={cn('section-card animate-fade-in', className)}>
      <div className="section-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold font-display">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

