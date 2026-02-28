import { MainLayout } from '@/pages/faculty/components/layout/MainLayout';
import { AnnouncementsList } from '@/components/common/AnnouncementsList';

export default function FacultyAnnouncementsPage() {
    return (
        <MainLayout>
            <div className="pb-8">
                <AnnouncementsList />
            </div>
        </MainLayout>
    );
}