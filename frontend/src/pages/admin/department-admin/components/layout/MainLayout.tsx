import { useState, ReactNode, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { Menu, X, GraduationCap } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#800000] text-white shadow-md z-[60] sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-lg">NSCET</span>
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

      <AppSidebar 
        // @ts-ignore - syncing collapsed state
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          // Mobile: No margin
          "ml-0",
          // Tablet/Desktop: Respect sidebar width
          collapsed ? "lg:ml-20" : "lg:ml-[280px]"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </motion.main>

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
