import PageHeader from '@/pages/student/components/layout/PageHeader';
import { AnnouncementsList } from '@/components/common/AnnouncementsList';

export default function StudentAnnouncementsPage() {
    return (
        <div>
            <PageHeader
                title="Announcements"
                subtitle="Stay updated with the latest announcements"
            />
            <div className="animate-fade-in">
                <AnnouncementsList />
            </div>
        </div>
    );
}


