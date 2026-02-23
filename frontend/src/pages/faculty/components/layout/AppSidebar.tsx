import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Users,
  LogOut,
  Briefcase,
  Clock,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/faculty/profile", icon: User },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  { title: "Academics", url: "/faculty/academics", icon: BookOpen },
  { title: "Leave", url: "/faculty/leave", icon: CalendarDays },
  { title: "Assessments", url: "/faculty/assessments", icon: FileText },
  { title: "Counseling", url: "/faculty/counseling", icon: Users },
  { title: "Announcement", url: "/faculty/communication", icon: MessageSquare },
  { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, refreshUserData } = useAuth();
  const refreshedRef = useRef(false);
  const [isTimetableIncharge, setIsTimetableIncharge] = useState(user?.is_timetable_incharge || false);
  const [isPlacementCoordinator, setIsPlacementCoordinator] = useState(user?.is_placement_coordinator || false);

  useEffect(() => {
    // Refresh user data once when sidebar mounts to get latest coordinator status
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  // Watch for user changes and update local state
  useEffect(() => {
    setIsTimetableIncharge(user?.is_timetable_incharge || false);
    setIsPlacementCoordinator(user?.is_placement_coordinator || false);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'F';
  };

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
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex items-center"
              >
                {/* User Photo */}
                <img
                  src={user?.avatar || "/src/assets/prathap.png"}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-12 h-12 rounded-full bg-gradient-to-br from-sidebar-accent to-secondary flex items-center justify-center flex-shrink-0 text-white font-bold text-sm border-2 border-white">
                  {getInitials(user?.name || 'F')}
                </div>
                {/* Name and Role */}
                <div className="flex flex-col ml-3">
                  <span className="font-serif font-bold text-white text-lg whitespace-nowrap">
                    {user?.name || 'Faculty'}
                  </span>
                  <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mt-1">
                    {user?.designation || 'Faculty'}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">
                    {typeof user?.department === 'object'
                      ? user.department.short_name || user.department.full_name
                      : typeof user?.department === 'string'
                        ? user.department
                        : 'Department'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Conditional: Timetable Alteration - shows only if faculty is timetable incharge */}
          {isTimetableIncharge && (
            <motion.li
              key="timetable-alteration"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <NavLink
                to="/faculty/timetable/alterations"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  location.pathname.startsWith("/faculty/timetable/alterations")
                    ? "bg-sidebar-accent text-white"
                    : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <Clock
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    location.pathname.startsWith("/faculty/timetable/alterations")
                      ? "text-secondary"
                      : "text-white/70 group-hover:text-secondary"
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
                      Timetable Alteration
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.li>
          )}

          {/* Conditional: Placement - shows only if faculty is placement coordinator */}
          {isPlacementCoordinator && (
            <motion.li
              key="placement"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <NavLink
                to="/faculty/placement"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  location.pathname.startsWith("/faculty/placement")
                    ? "bg-sidebar-accent text-white"
                    : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <Briefcase
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    location.pathname.startsWith("/faculty/placement")
                      ? "text-secondary"
                      : "text-white/70 group-hover:text-secondary"
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
                      Placement
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.li>
          )}
        </ul>
      </nav>

      {/* Logout and Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/90 text-white hover:bg-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse Toggle */}
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
