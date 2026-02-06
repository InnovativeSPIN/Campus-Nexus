import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Database,
  Building2,
  LogOut,
  User,
  ShieldCheck,
  Lock,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface AdminLayoutProps {
  children: ReactNode;
}

const navItemsByRole: Record<string, NavItem[]> = {
  superadmin: [
    { label: 'Dashboard', path: '/admin/superadmin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Admins', path: '/admin/superadmin/admins', icon: <ShieldCheck className="h-5 w-5" /> },
    { label: 'Time Table', path: '/admin/superadmin/timetable', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Students', path: '/admin/superadmin/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Faculty', path: '/admin/superadmin/faculty', icon: <Users className="h-5 w-5" /> },
    { label: 'Departments', path: '/admin/superadmin/departments', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/superadmin/reports', icon: <FileText className="h-5 w-5" /> },
    { label: 'Backup', path: '/admin/superadmin/backup', icon: <Database className="h-5 w-5" /> },
    { label: 'Security', path: '/admin/change-password', icon: <ShieldCheck className="h-5 w-5" /> },
    { label: 'Announcements', path: '/admin/superadmin/announcements', icon: <Bell className="h-5 w-5" /> },
  ],
  executive: [
    { label: 'Dashboard', path: '/admin/executive', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Academic Performance', path: '/admin/executive/academic-performance', icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Time Table', path: '/admin/superadmin/timetable', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Students', path: '/admin/executive/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Faculty', path: '/admin/executive/faculty', icon: <Users className="h-5 w-5" /> },
    { label: 'Leave Requests', path: '/admin/executive/leave-requests', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Announcements', path: '/admin/executive/announcements', icon: <Bell className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/executive/reports', icon: <FileText className="h-5 w-5" /> },
    { label: 'Security', path: '/admin/change-password', icon: <ShieldCheck className="h-5 w-5" /> },
  ],
  academic: [
    { label: 'Dashboard', path: '/admin/academic', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Students', path: '/admin/academic/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Faculty', path: '/admin/academic/faculty', icon: <Users className="h-5 w-5" /> },
    { label: 'Departments', path: '/admin/academic/departments', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Announcements', path: '/admin/academic/announcements', icon: <Bell className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/academic/reports', icon: <FileText className="h-5 w-5" /> },
    { label: 'Security', path: '/admin/change-password', icon: <ShieldCheck className="h-5 w-5" /> },
  ],
  faculty: [
    { label: 'Dashboard', path: '/faculty', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Students', path: '/faculty/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Profile', path: '/faculty/profile', icon: <User className="h-5 w-5" /> },
    { label: 'Security', path: '/admin/change-password', icon: <ShieldCheck className="h-5 w-5" /> },
  ],
  student: [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <User className="h-5 w-5" /> },
    { label: 'Security', path: '/admin/change-password', icon: <ShieldCheck className="h-5 w-5" /> },
  ],
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine user info display
  const userRoleDisplay = user.role === 'executive' ? 'Principal & CEO' : (user.role.charAt(0).toUpperCase() + user.role.slice(1));

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col shadow-xl"
      >
        {/* Header / User Info Section */}
        <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {sidebarOpen ? (
                <motion.div
                  key="expanded-user"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-sidebar rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-white text-lg whitespace-nowrap">
                      {user.name}
                    </span>
                    <span className="text-xs text-white/70 whitespace-nowrap">
                      {userRoleDisplay}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-user"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="mx-auto"
                >
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarFallback className="bg-primary/20 text-white font-bold text-xs font-serif">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group relative',
                      isActive
                        ? 'bg-sidebar-accent text-white shadow-lg shadow-black/20'
                        : 'text-white/60 hover:bg-sidebar-accent/50 hover:text-white'
                    )}
                  >
                    <div className={cn(
                      "transition-colors",
                      isActive ? "text-secondary" : "text-white/60 group-hover:text-secondary"
                    )}>
                      {item.icon}
                    </div>

                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-secondary rounded-r-full"
                      />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm",
              "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
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

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/30 text-white/70 hover:bg-sidebar-accent hover:text-white transition-all border border-white/5"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest overflow-hidden">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'ml-[280px]' : 'ml-[80px]')}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-full items-center justify-end px-6">
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(currentTime)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  {formatTime(currentTime)}
                </div>
              </div>

              <div className="h-8 w-[1px] bg-border mx-2" />

              <div className="flex items-center gap-3">
                <IntegratedNotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-muted-foreground text-xs">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/change-password')}>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
