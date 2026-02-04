import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/academic/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/academic/components/modals/UserFormModal';
import { ProfileModal } from '@/pages/admin/academic/components/modals/ProfileModal';
import { mockFaculty as initialFaculty } from '@/data/mockData';
import { Faculty } from '@/types/auth';
import { Badge } from '@/pages/admin/academic/components/ui/badge';
import { toast } from 'sonner';

// Academic Admin has semi-CRUD (can add and edit, but not delete)
export default function AcademicFaculty() {
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Faculty }>({
    open: false,
    mode: 'add',
  });
  const [profileModal, setProfileModal] = useState<{ open: boolean; data: Faculty | null }>({
    open: false,
    data: null,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Faculty) => (
        <Badge
          variant={item.status === 'active' ? 'default' : 'secondary'}
          className={item.status === 'active' ? 'bg-success' : ''}
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => {
    setFormModal({ open: true, mode: 'add' });
  };

  const handleView = (item: Faculty) => {
    setProfileModal({ open: true, data: item });
  };

  const handleEdit = (item: Faculty) => {
    setFormModal({ open: true, mode: 'edit', data: item });
  };

  const handleSave = (data: Partial<Faculty>) => {
    if (formModal.mode === 'add') {
      const newFaculty: Faculty = {
        id: String(Date.now()),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        designation: data.designation || '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setFaculty((prev) => [...prev, newFaculty]);
      toast.success('Faculty member added successfully');
    } else {
      setFaculty((prev) =>
        prev.map((f) => (f.id === formModal.data?.id ? { ...f, ...data } : f))
      );
      toast.success('Faculty member updated successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculty records (Add & Edit only)</p>
        </div>

        <DataTable
          data={faculty}
          columns={columns}
          title="All Faculty"
          searchPlaceholder="Search faculty..."
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          canDelete={false}
        />

        <UserFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          type="faculty"
          initialData={formModal.data}
          mode={formModal.mode}
        />

        <ProfileModal
          open={profileModal.open}
          onClose={() => setProfileModal({ open: false, data: null })}
          data={profileModal.data}
          type="faculty"
        />
      </div>
    </AdminLayout>
  );
}
