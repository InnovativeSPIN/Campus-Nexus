import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Database,
  Building2,
  LogOut,
  ShieldCheck,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface AppSidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function AppSidebar({
  collapsed: propCollapsed,
  setCollapsed: propSetCollapsed,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('superadmin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('superadmin_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/superadmin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Admins', path: '/admin/superadmin/admins', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/superadmin/students', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Faculty', path: '/admin/superadmin/faculty', icon: <Users className="w-5 h-5" /> },
    { label: 'Departments', path: '/admin/superadmin/departments', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Classes', path: '/admin/superadmin/classes', icon: <Users className="w-5 h-5" /> },
    { label: 'Subjects', path: '/admin/superadmin/subjects', icon: <FileText className="w-5 h-5" /> },
    { label: 'Time Table', path: '/admin/superadmin/timetable', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Announcements', path: '/admin/superadmin/announcements', icon: <Bell className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/superadmin/reports', icon: <FileText className="w-5 h-5" /> },
    { label: 'Backup', path: '/admin/superadmin/backup', icon: <Database className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin/superadmin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA';
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: (collapsed && !isMobileMenuOpen) ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar z-[100] lg:z-50 flex flex-col shadow-2xl transition-transform duration-300",
        // Mobile hidden/visible
        "max-lg:-translate-x-full lg:translate-x-0",
        isMobileMenuOpen && "max-lg:translate-x-0"
      )}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Mobile Close Button Header */}
      <div className="lg:hidden p-4 border-b border-sidebar-border flex items-center justify-between bg-sidebar-accent/10">
        <div className="flex items-center gap-2">
           <GraduationCap className="w-6 h-6 text-white" />
           <span className="text-white font-bold font-serif whitespace-nowrap">NSCET Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen?.(false)}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
   

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center flex-shrink-0 border-2 border-white/10">
              <span className="text-white font-bold text-xs">{getInitials(user.name)}</span>
            </div>
            <AnimatePresence>
              {(!collapsed || isMobileMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-white/60 text-xs uppercase tracking-wider truncate">Super Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setIsMobileMenuOpen?.(false);
                  }}
                  style={{ pointerEvents: 'auto' }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative cursor-pointer overflow-hidden',
                    active
                      ? 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-white shadow-lg shadow-black/20 border-l-4 border-secondary'
                      : 'text-white/70 hover:bg-sidebar-accent/30 hover:text-white'
                  )}
                >
                  {/* Background pulse for active state */}
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 -z-10"
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "transition-colors flex-shrink-0",
                    active ? "text-secondary" : "text-white/70 group-hover:text-secondary"
                  )}>
                    {item.icon}
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {(!collapsed || isMobileMenuOpen) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {item.badge && (!collapsed || isMobileMenuOpen) && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto text-xs bg-secondary text-white px-2 py-0.5 rounded-full font-bold"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3 bg-sidebar-accent/5">
        {/* Logout Button */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          style={{ pointerEvents: 'auto' }}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all font-bold text-sm cursor-pointer",
            "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || isMobileMenuOpen) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Toggle Collapse Button - Hide on mobile */}
        <div className="hidden lg:block">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => setCollapsed?.(!collapsed)}
            style={{ pointerEvents: 'auto' }}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all border font-bold text-sm cursor-pointer",
              collapsed
                ? 'bg-sidebar-accent/40 text-white border-sidebar-accent/60 hover:bg-sidebar-accent/60'
                : 'bg-sidebar-accent/20 text-white/80 border-sidebar-accent/30 hover:bg-sidebar-accent/40 hover:text-white'
            )}
          >
            {collapsed ? (
              <motion.div
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                </motion.div>
                <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
