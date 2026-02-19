import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";

interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export function MainLayout({ children, hideHeader = false }: MainLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-20 lg:ml-[280px] transition-all duration-300">
        {/* Header */}
        {!hideHeader && (
          <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-full items-center justify-end px-6">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end border-r pr-6 border-border/50">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground font-serif">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(currentTime)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    {formatTime(currentTime)}
                  </div>
                </div>
                <IntegratedNotificationBell />
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
