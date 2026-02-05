import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/pages/student/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  FileText,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';

const mainNavItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const profileNavItems = [
  { path: '/student/profile/personal', label: 'Basic Info', icon: User },
];

const academicNavItems = [
  { path: '/student/academics/attendance', label: 'Attendance', icon: Calendar },
  { path: '/student/academics/marks', label: 'Marks', icon: Award },
];

const timetableNavItems = [
  { path: '/student/academics/timetable', label: 'Timetable', icon: Calendar },
];

const leaveNavItems = [
  { path: '/student/academics/leave', label: 'Leave', icon: FileText },
];

const portfolioNavItems = [
  { path: '/student/portfolio/sports', label: 'Portfolio', icon: Award },
];



const announcementNavItems = [
  { path: '/student/announcements', label: 'Announcements', icon: Megaphone },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('profile');

  const isActive = (path: string) => {
    // For dashboard, match exactly
    if (path === '/student/dashboard') {
      return location.pathname === path;
    }

    // For Timetable and Leave, which share a prefix with Academics, match the specific path
    if (path.includes('timetable') || path.includes('leave')) {
      return location.pathname.startsWith(path);
    }

    // For other paths (like Profile or Academics), check if the current pathname starts with the base category
    const segments = path.split('/');
    if (segments.length >= 3) {
      const base = `/${segments[1]}/${segments[2]}`;
      // Ensure we don't highlight "Academics" when on "Timetable" or "Leave" pages
      if (base === '/student/academics') {
        return location.pathname.startsWith(base) &&
          !location.pathname.includes('timetable') &&
          !location.pathname.includes('leave');
      }
      return location.pathname.startsWith(base);
    }

    return location.pathname.startsWith(path);
  };

  const isSectionActive = (items: typeof profileNavItems) =>
    items.some(item => isActive(item.path));

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const NavSection = ({
    title,
    items,
    sectionKey
  }: {
    title: string;
    items: typeof profileNavItems;
    sectionKey: string;
  }) => {
    const isExpanded = expandedSection === sectionKey || isSectionActive(items);

    // For Profile, Announcements, Academics, Portfolio, Timetable, and Leave sections, make them navigate directly without dropdown nodes
    if (sectionKey === 'profile' || sectionKey === 'announcements' || sectionKey === 'academics' || sectionKey === 'portfolio' || sectionKey === 'timetable' || sectionKey === 'leave') {
      const IconComponent = items[0].icon;
      return (
        <div className="mb-2">
          <NavLink
            to={items[0].path}
            className={cn(
              'nav-link',
              isActive(items[0].path) && 'nav-link-active'
            )}
            title={isCollapsed ? title : undefined}
          >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{title}</span>}
          </NavLink>
        </div>
      );
    }

    return (
      <div className="mb-2">
        {!isCollapsed && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider',
              isSectionActive(items) ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'
            )}
          >
            {title}
            <ChevronRight className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-90'
            )} />
          </button>
        )}
        {(isCollapsed || isExpanded) && (
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'nav-link',
                  isActive(item.path) && 'nav-link-active'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-4 h-16 border-b border-sidebar-border',
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-sidebar-primary" />
            <span className="font-display font-bold text-lg text-sidebar-foreground">
              Student ERP
            </span>
          </div>
        )}
        {isCollapsed && (
          <GraduationCap className="w-8 h-8 text-sidebar-primary mx-auto" />
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            isCollapsed && 'mx-auto mt-2'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.rollNo}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Main */}
        <div className="mb-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-link',
                isActive(item.path) && 'nav-link-active'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <NavSection title="Profile" items={profileNavItems} sectionKey="profile" />
        <NavSection title="Academics" items={academicNavItems} sectionKey="academics" />
        <NavSection title="Timetable" items={timetableNavItems} sectionKey="timetable" />
        <NavSection title="Leave" items={leaveNavItems} sectionKey="leave" />
        <NavSection title="Portfolio" items={portfolioNavItems} sectionKey="portfolio" />

        <NavSection title="Announcements" items={announcementNavItems} sectionKey="announcements" />
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="nav-link w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

