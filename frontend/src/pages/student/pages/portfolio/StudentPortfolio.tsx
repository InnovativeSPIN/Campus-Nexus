import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import PortfolioNavBar from '@/pages/student/components/layout/PortfolioNavBar';
import ChangeRequestPendingBanner from '@/pages/student/components/common/ChangeRequestPendingBanner';
import Sports from './Sports';
import Events from './Events';
import Certifications from './Certifications';
import Projects from './Projects';

export default function StudentPortfolio() {
    const location = useLocation();
    const [hasPendingChanges, setHasPendingChanges] = useState(false);

    // Determine which sub-page to show based on current path
    const getContent = () => {
        if (location.pathname === '/student/portfolio/sports') {
            return <Sports onPendingChange={setHasPendingChanges} />;
        }
        if (location.pathname === '/student/portfolio/events') {
            return <Events onPendingChange={setHasPendingChanges} />;
        }
        if (location.pathname === '/student/portfolio/certifications') {
            return <Certifications onPendingChange={setHasPendingChanges} />;
        }
        if (location.pathname === '/student/portfolio/projects') {
            return <Projects onPendingChange={setHasPendingChanges} />;
        }
        // Default to Sports if at /portfolio
        return <Sports onPendingChange={setHasPendingChanges} />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Student Portfolio"
                subtitle="Manage your activities, achievements, and projects"
                breadcrumbs={[
                    { label: 'Portfolio', path: '/student/portfolio/sports' },
                ]}
            />

            <PortfolioNavBar />

            {/* Change Request Pending Banner */}
            {hasPendingChanges && (
                <ChangeRequestPendingBanner />
            )}

            {getContent()}
        </div>
    );
}
