import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Menu, X } from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";

interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export function MainLayout({ children, hideHeader = false }: MainLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  // Initialize from localStorage to persist across navigation
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('faculty_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('faculty_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#800000] text-white shadow-md z-[60] sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="font-bold text-lg">N</span>
          </div>
          <span className="font-serif font-bold text-lg">NSCET Faculty</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AppSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <motion.div 
        initial={false}
        animate={{ 
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (collapsed ? 80 : 280) 
            : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 min-h-screen relative flex flex-col w-full"
      >
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
          className="flex-1"
        >
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
