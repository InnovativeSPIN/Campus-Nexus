import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeImageUrl } from '@/utils/imageUrl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Calendar,
  Award,
  FileText,
  Megaphone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  BookOpen,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/pages/student/lib/utils';

const menuItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/student/profile/personal", icon: User },
  { title: "Academics", url: "/student/academics-main", icon: BookOpen },
  { title: "Attendance", url: "/student/academics/attendance", icon: ClipboardCheck },
  { title: "Timetable", url: "/student/academics/timetable", icon: Calendar },
  { title: "Leave", url: "/student/academics/leave", icon: FileText },
  { title: "Change Password", url: "/student/profile/change-password", icon: Lock },
  { title: "Portfolio", url: "/student/portfolio/sports", icon: Award },
  { title: "Announcements", url: "/student/announcements", icon: Megaphone },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function Sidebar({ 
  isCollapsed: collapsed, 
  onToggle: setCollapsed, 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen 
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/student/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: (collapsed && !isMobileMenuOpen) ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 h-screen h-[100dvh] bg-sidebar z-[100] lg:z-50 flex flex-col shadow-2xl transition-transform duration-300",
        // Mobile hidden/visible
        "max-lg:-translate-x-full lg:translate-x-0",
        isMobileMenuOpen && "max-lg:translate-x-0"
      )}
    >
      {/* Logo & Identity Section */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                src={normalizeImageUrl(user.avatar) || ''}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sidebar-primary to-secondary flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">
                {user?.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobileMenuOpen) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex flex-col"
              >
                <span className="font-serif font-bold text-white text-lg whitespace-nowrap">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold hidden">
                  {user?.rollNo || ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const active = isActive(item.url);
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    active
                      ? "bg-sidebar-primary text-white"
                      : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      active ? "text-white" : "text-white/70 group-hover:text-secondary"
                    )}
                  />
                  <AnimatePresence>
                    {(!collapsed || isMobileMenuOpen) && (
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
                  {active && !collapsed && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-secondary rounded-r-full"
                    />
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Logout and Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/90 text-white hover:bg-destructive transition-colors relative z-high"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || isMobileMenuOpen) && (
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

        {/* Collapse Toggle - Hide on Mobile */}
        <div className="hidden lg:block">
          <button
            onClick={() => setCollapsed()}
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
      </div>
    </motion.aside>
  );
}

