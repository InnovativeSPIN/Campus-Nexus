import { useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ExecutiveAdminSidebar } from './ExecutiveAdminSidebar';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';
import { LeaveNotificationBell } from '@/components/common/LeaveNotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#800000] text-white shadow-md z-[60] sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-lg">NSCET Executive</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          tabIndex={0}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <ExecutiveAdminSidebar 
        // @ts-ignore - syncing states
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-screen",
        "ml-0",
        collapsed ? "lg:ml-20" : "lg:ml-[280px]"
      )}>
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-full items-center justify-between px-4 md:px-6">
            <h1 className="text-sm md:text-xl font-bold text-foreground truncate">
              Executive Panel
            </h1>
            <div className="flex items-center gap-2">
              <LeaveNotificationBell />
              <IntegratedNotificationBell />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

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
