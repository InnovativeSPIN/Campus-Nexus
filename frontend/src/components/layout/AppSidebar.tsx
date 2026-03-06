import { useEffect, useState } from "react";
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
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/faculty/profile", icon: User },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  { title: "Academics", url: "/faculty/academics", icon: BookOpen },
  { title: "Leave", url: "/faculty/leave", icon: CalendarDays },
  { title: "Assessments", url: "/faculty/assessments", icon: FileText },
  { title: "Counseling", url: "/faculty/counseling", icon: Users },
  { title: "Communication", url: "/faculty/communication", icon: MessageSquare },
  { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
  const location = useLocation();
  const { user, authToken } = useAuth();
  const [inchargeCount, setInchargeCount] = useState(0);

  useEffect(() => {
    if (user?.is_class_incharge && authToken) {
      const fetchCount = async () => {
        try {
          const res = await fetch('/api/v1/student/portfolio-notifications/unread-count', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setInchargeCount(data.data?.unreadCount || 0);
          }
        } catch (err) {
          console.error('Failed to fetch incharge count:', err);
        }
      };
      fetchCount();
      // Refresh every 2 minutes
      const interval = setInterval(fetchCount, 120000);
      return () => clearInterval(interval);
    }
  }, [user, authToken]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col shadow-xl"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {[
            ...menuItems,
            ...(user?.is_class_incharge ? [{ title: "Class Incharge", url: "/faculty/class-incharge", icon: ShieldCheck }] : [])
          ].map((item, index) => {
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
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white",
                    item.title === "Class Incharge" && "relative"
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
                  {item.title === "Class Incharge" && inchargeCount > 0 && (
                    <div className={cn(
                      "absolute right-2 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white px-1 leading-none shadow-sm",
                      collapsed && "right-3 top-3 border-2 border-sidebar"
                    )}>
                      {inchargeCount > 9 ? '9+' : inchargeCount}
                    </div>
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
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
