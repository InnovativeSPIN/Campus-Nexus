import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  type: string;
}

interface PendingTasksListProps {
  tasks: Task[];
}

const priorityStyles = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-muted-foreground bg-muted/50",
};

const priorityIcons = {
  high: AlertCircle,
  medium: Clock,
  low: CheckCircle2,
};

export function PendingTasksList({ tasks }: PendingTasksListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="widget-card"
    >
      <h3 className="section-title flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-warning" />
        Announcement & Circulars
      </h3>
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const Icon = priorityIcons[task.priority];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:translate-x-1",
                priorityStyles[task.priority]
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 mt-0.5",
                      task.priority === "high" && "text-destructive",
                      task.priority === "medium" && "text-warning",
                      task.priority === "low" && "text-muted-foreground"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {task.dueDate}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground capitalize">
                  {task.type}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}



