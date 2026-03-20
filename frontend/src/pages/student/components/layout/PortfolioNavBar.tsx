import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/pages/student/lib/utils';
import { Trophy, Calendar, Award, FolderKanban } from 'lucide-react';

interface PortfolioNavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const portfolioNavItems: PortfolioNavItem[] = [
    { path: '/student/portfolio/sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
    { path: '/student/portfolio/events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { path: '/student/portfolio/certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
    { path: '/student/portfolio/projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
];

export default function PortfolioNavBar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                {portfolioNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-t-lg border-b-2 -mb-2',
                            isActive(item.path)
                                ? 'text-primary border-primary bg-primary/5'
                                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                        )}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
