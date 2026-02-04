import { motion } from "framer-motion";
import { Calendar, Briefcase, Heart } from "lucide-react";

interface LeaveBalance {
  type: string;
  icon: typeof Calendar;
  total: number;
  used: number;
  remaining: number;
}

interface LeaveSnapshotProps {
  leaves: LeaveBalance[];
}

export function LeaveSnapshot({ leaves }: LeaveSnapshotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="widget-card"
    >
      <h3 className="section-title flex items-center gap-2">
        <Calendar className="w-5 h-5 text-secondary" />
        Leave Balance
      </h3>
      <div className="space-y-4">
        {leaves.map((leave, index) => {
          const percentage = (leave.remaining / leave.total) * 100;
          const Icon = leave.icon;
          return (
            <motion.div
              key={leave.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {leave.type}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {leave.remaining}/{leave.total} days
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
