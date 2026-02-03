import { useLocation } from 'react-router-dom';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import PortfolioNavBar from '@/pages/student/components/layout/PortfolioNavBar';
import Sports from './Sports';
import Events from './Events';
import Certifications from './Certifications';
import Projects from './Projects';

export default function StudentPortfolio() {
    const location = useLocation();

    // Determine which sub-page to show based on current path
    const getContent = () => {
        if (location.pathname === '/student/portfolio/sports') {
            return <Sports />;
        }
        if (location.pathname === '/student/portfolio/events') {
            return <Events />;
        }
        if (location.pathname === '/student/portfolio/certifications') {
            return <Certifications />;
        }
        if (location.pathname === '/student/portfolio/projects') {
            return <Projects />;
        }
        // Default to Sports if at /portfolio
        return <Sports />;
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

            {getContent()}
        </div>
    );
}
