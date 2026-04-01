import { useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';
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
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#800000] text-white shadow-lg z-[60] sticky top-0 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-tight">NSCET</span>
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-black">Super Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IntegratedNotificationBell />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            tabIndex={0}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Sidebar Component */}
      <AppSidebar 
        // @ts-ignore - syncing states
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "ml-0",
        collapsed ? "lg:ml-20" : "lg:ml-[280px]"
      )}>
        {/* Header Bar - Hidden on Mobile */}
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 hidden lg:block">
          <div className="flex h-full items-center justify-between px-8">
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
               <span className="text-foreground font-semibold">
                 Howdy, <span className="text-primary">{user.name || 'Admin'}</span>
               </span>
            </div>
            <div className="flex items-center gap-6">
              <IntegratedNotificationBell />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full transition-all">
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
