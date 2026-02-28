import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { AnnouncementsList } from '@/components/common/AnnouncementsList';

export default function ExecutiveAnnouncementsPage() {
    return (
        <AdminLayout>
            <div className="pb-8">
                <AnnouncementsList />
            </div>
        </AdminLayout>
    );
}