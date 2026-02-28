import { AnnouncementsList } from '@/components/common/AnnouncementsList';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';

export default function DepartmentAdminAnnouncementsPage() {
    return (
        <MainLayout>
            <div className="pb-8">
                <AnnouncementsList />
            </div>
        </MainLayout>
    );
}
