import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  LogOut,
  Calendar,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export function ExecutiveAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('executive_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('executive_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/executive', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Academic Performance', path: '/admin/executive/academic-performance', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Time Table', path: '/admin/superadmin/timetable', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/executive/students', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Faculty', path: '/admin/executive/faculty', icon: <Users className="w-5 h-5" /> },
    { label: 'Leave Requests', path: '/admin/executive/leave-requests', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Announcements', path: '/admin/executive/announcements', icon: <Bell className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/executive/reports', icon: <FileText className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin/executive') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'EA';
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col shadow-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="p-4 border-b border-sidebar-border bg-gradient-to-b from-sidebar-accent/20 to-sidebar-accent/5">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-white text-sm leading-tight uppercase tracking-tight">Campus Nexus</h1>
                    <p className="text-[10px] text-white/70 uppercase tracking-widest">Executive Panel</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center"
            >
              <Home className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {user && (
        <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center flex-shrink-0 border-2 border-white/10">
              <span className="text-white font-bold text-xs">{getInitials(user.name)}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-white/60 text-xs uppercase tracking-wider truncate">Principal & CEO</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

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
                  }}
                  style={{ pointerEvents: 'auto' }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative cursor-pointer overflow-hidden',
                    active
                      ? 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-white shadow-lg shadow-black/20 border-l-4 border-secondary'
                      : 'text-white/70 hover:bg-sidebar-accent/30 hover:text-white'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 -z-10"
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <div className={cn(
                    "transition-colors flex-shrink-0",
                    active ? "text-secondary" : "text-white/70 group-hover:text-secondary"
                  )}>
                    {item.icon}
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
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
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3 bg-sidebar-accent/5">
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
            {!collapsed && (
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

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setCollapsed(prev => !prev);
          }}
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
    </motion.aside>
  );
}
