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
  Lock,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/faculty/profile", icon: User },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  { title: "Academics", url: "/faculty/academics", icon: BookOpen },
  { title: "Assessments", url: "/faculty/assessments", icon: FileText },
  { title: "Counseling", url: "/faculty/counseling", icon: Users },
  { title: "Change Password", url: "/faculty/change-password", icon: Lock },
  { title: "Announcement", url: "/faculty/communication", icon: MessageSquare },
  { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function AppSidebar({
  collapsed,
  setCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, refreshUserData } = useAuth();
  const refreshedRef = useRef(false);
  const [isPlacementCoordinator, setIsPlacementCoordinator] = useState(user?.is_placement_coordinator || false);
  const [isTimetableIncharge, setIsTimetableIncharge] = useState(user?.is_timetable_incharge || false);
  const [isClassIncharge, setIsClassIncharge] = useState(user?.is_class_incharge || false);

  useEffect(() => {
    // Refresh user data once when sidebar mounts to get latest coordinator status
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  // Watch for user changes and update local state
  useEffect(() => {
    setIsPlacementCoordinator(user?.is_placement_coordinator || false);

    // Also verify timetable-related assignments via API in case user flag isn't set
    const controller = new AbortController();
    const checkTimetableRoles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return; // Skip if token not available yet
        
        const res = await fetch('/api/v1/faculty/me/timetable-roles', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          setIsTimetableIncharge(json.data.isTimetableIncharge || false);
          setIsClassIncharge(json.data.isClassCoordinator || false);
        }
      } catch (err) {
        // ignore; this call is just for UI visibility
      }
    };

    checkTimetableRoles();

    return () => controller.abort();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'F';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'F';
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col shadow-xl transition-all duration-300",
        "z-[100] lg:z-50",
        // Mobile visibility
        "max-lg:-translate-x-full lg:translate-x-0",
        isMobileMenuOpen && "max-lg:translate-x-0"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
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
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shrink-0"
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
                  <p className="text-[10px] text-white/50 uppercase tracking-wider truncate max-w-[150px]">
                    {user?.department
                      ? (typeof user.department === 'object'
                        ? user.department.short_name || user.department.full_name
                        : user.department)
                      : 'Department'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center text-white shrink-0">
               <span className="font-bold">N</span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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

          {/* Conditional: Timetable Management - shows ONLY if faculty is timetable_incharge */}
          {isTimetableIncharge && (
            <>
              <motion.li
                key="timetable-management"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.56 }}
              >
                <NavLink
                  to="/faculty/timetable-management"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    location.pathname.startsWith("/faculty/timetable-management")
                      ? "bg-sidebar-accent text-white"
                      : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <Calendar
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      location.pathname.startsWith("/faculty/timetable-management")
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
                        Timetable Mgmt
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </motion.li>


            </>
          )}

          {/* Conditional: Class Incharge Management - shows only if faculty is class incharge */}
          {isClassIncharge && (
            <motion.li
              key="class-incharge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.58 }}
            >
              <NavLink
                to="/faculty/class-incharge"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  location.pathname.startsWith("/faculty/class-incharge")
                    ? "bg-sidebar-accent text-white"
                    : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <Users
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    location.pathname.startsWith("/faculty/class-incharge")
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
                      Class Incharge
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.li>
          )}

          {/* Conditional: Leave Management - for submitting and tracking leave applications */}
          <motion.li
            key="leave-management"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.59 }}
          >
            <NavLink
              to="/faculty/leave-management"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                location.pathname.startsWith("/faculty/leave-management")
                  ? "bg-sidebar-accent text-white"
                  : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
              )}
            >
              <CalendarDays
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  location.pathname.startsWith("/faculty/leave-management")
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
                    Leave Management
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.li>

          {/* Conditional: Alteration Approval - shows only if faculty has substitute requests */}
          <motion.li
            key="alteration-approval"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.60 }}
          >
            <NavLink
              to="/faculty/alteration-approval"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                location.pathname.startsWith("/faculty/alteration-approval")
                  ? "bg-sidebar-accent text-white"
                  : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
              )}
            >
              <CheckCircle2
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  location.pathname.startsWith("/faculty/alteration-approval")
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
                    Approve Alterations
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.li>


        </ul>
      </nav>

      {/* Logout and Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/90 text-white hover:bg-destructive transition-colors",
            collapsed && "px-0"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
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

        {/* Collapse Toggle - Hide on mobile since it's a drawer */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-white hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
