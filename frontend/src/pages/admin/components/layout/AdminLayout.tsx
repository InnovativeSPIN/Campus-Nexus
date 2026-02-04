import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Database,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '@/pages/admin/components/ui/button';
import { Avatar, AvatarFallback } from '@/pages/admin/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/pages/admin/components/ui/dropdown-menu';
import { cn } from '@/pages/admin/lib/utils';

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
  ],
  executive: [
    { label: 'Dashboard', path: '/admin/executive', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Students', path: '/admin/executive/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Faculty', path: '/admin/executive/faculty', icon: <Users className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/executive/reports', icon: <FileText className="h-5 w-5" /> },
  ],
  academic: [
    { label: 'Dashboard', path: '/admin/academic', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Students', path: '/admin/academic/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Faculty', path: '/admin/academic/faculty', icon: <Users className="h-5 w-5" /> },
    { label: 'Departments', path: '/admin/academic/departments', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/academic/reports', icon: <FileText className="h-5 w-5" /> },
  ],
  faculty: [
    { label: 'Dashboard', path: '/faculty', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Students', path: '/faculty/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Profile', path: '/faculty/profile', icon: <User className="h-5 w-5" /> },
  ],
  student: [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <User className="h-5 w-5" /> },
  ],
};

const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  executive: 'Executive Admin',
  academic: 'Academic Admin',
  faculty: 'Faculty',
  student: 'Student',
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <span className="text-xl font-bold text-sidebar-foreground">
              {roleLabels[user.role]}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors',
              !sidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16')}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-full items-center justify-between px-6">
            <div>
              {/* Branding moved to sidebar */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem className="text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
