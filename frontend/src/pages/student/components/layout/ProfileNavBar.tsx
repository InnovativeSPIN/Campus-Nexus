import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/pages/student/lib/utils';

interface ProfileNavItem {
  path: string;
  label: string;
}

const profileNavItems: ProfileNavItem[] = [
  { path: '/student/profile/personal', label: 'Personal Info' },
  { path: '/student/profile/parent', label: 'Parent Info' },
  { path: '/student/profile/reference', label: 'Reference' },
  { path: '/student/profile/photos', label: 'Photos' },
];

export default function ProfileNavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="mb-6">
      <div className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1.5 shadow-sm" style={{ borderRadius: '999px' }}>
        {profileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'px-6 py-2.5 text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap',
              isActive(item.path)
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderRadius: '999px',
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

