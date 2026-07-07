import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Calendar,
  ClipboardCheck,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/faculty/profile", icon: User },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  { title: "Academics", url: "/faculty/academics", icon: BookOpen },
  { title: "Leave", url: "/faculty/leave", icon: CalendarDays },
  { title: "Assessments", url: "/faculty/assessments", icon: FileText },
  { title: "Mentorship", url: "/faculty/mentorship", icon: Users },
  { title: "Communication", url: "/faculty/communication", icon: MessageSquare },
  { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function AppSidebar({ 
  collapsed, 
  setCollapsed, 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen 
}: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <motion.aside
      initial={false}
      // On mobile we force width to 280 when open, on desktop we use the collapsed state
      animate={{ 
        width: collapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar z-[100] lg:z-50 flex flex-col shadow-2xl transition-transform duration-300",
        // Mobile: Hidden by default, translate back in when open
        "max-lg:-translate-x-full lg:translate-x-0",
        isMobileMenuOpen && "max-lg:translate-x-0"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-serif font-bold text-white text-lg whitespace-nowrap">
                  Faculty Portal
                </h1>
                <p className="text-xs text-white/70 whitespace-nowrap">
                  Management System
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <NotificationBell />
          </div>
          {/* Mobile Close Button */}
          {isMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen?.(false)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.url);
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen?.(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-secondary" : "text-white/70 group-hover:text-secondary"
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle - Hide on mobile since sidebar is a drawer */}
      <div className="p-4 border-t border-sidebar-border hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-white hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
