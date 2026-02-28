import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { AnnouncementsList } from '@/components/common/AnnouncementsList';

export default function AcademicAnnouncementsPage() {
    return (
        <AdminLayout>
            <div className="pb-8">
                <AnnouncementsList />
            </div>
        </AdminLayout>
    );
}