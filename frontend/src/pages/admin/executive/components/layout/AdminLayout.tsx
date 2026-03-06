import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ExecutiveAdminSidebar } from './ExecutiveAdminSidebar';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';
import { LeaveNotificationBell } from '@/components/common/LeaveNotificationBell';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Executive Sidebar */}
      <ExecutiveAdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[280px]">
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-full items-center justify-between px-6">
            <h1 className="text-xl font-bold text-foreground">
              Executive Panel Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <LeaveNotificationBell />
              <IntegratedNotificationBell />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
