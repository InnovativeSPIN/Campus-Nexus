import { motion } from "framer-motion";
import { Clock, MapPin, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/pages/faculty/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ClassInfo {
  subject: string;
  time: string;
  room: string;
  section: string;
  studentsCount: number;
  type?: string;
  totalPeriods?: number;
  duration?: string;
}

interface NextClassCardProps {
  currentClass?: ClassInfo;
  nextClass?: ClassInfo;
  onClassClick?: (classInfo: ClassInfo) => void;
}

export function NextClassCard({ currentClass, nextClass, onClassClick }: NextClassCardProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="widget-card col-span-full lg:col-span-2 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Current Class */}
        {currentClass && (
          <div
            className="flex-1 p-4 bg-primary/5 rounded-xl border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => onClassClick?.(currentClass)}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full animate-pulse-ring">
                LIVE NOW
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">
              {currentClass.subject}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{currentClass.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{currentClass.room}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{currentClass.section} · {currentClass.studentsCount} students</span>
              </div>
            </div>
            <Button
              className="mt-4 w-full bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/faculty/attendance");
              }}
            >
              Quick Mark Attendance
            </Button>
          </div>
        )}

        {/* Separator */}
        {currentClass && nextClass && (
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* Next Class */}
        {nextClass && (
          <div
            className="flex-1 p-4 bg-muted/50 rounded-xl border border-border cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => onClassClick?.(nextClass)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                UP NEXT
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">
              {nextClass.subject}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <span>{nextClass.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{nextClass.room}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" />
                <span>{nextClass.section} · {nextClass.studentsCount} students</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}




