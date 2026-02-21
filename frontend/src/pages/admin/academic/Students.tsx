import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/academic/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/academic/components/modals/UserFormModal';
import { ProfileModal } from '@/pages/admin/academic/components/modals/ProfileModal';
import { mockStudents as initialStudents } from '@/data/mockData';
import { Student } from '@/types/auth';
import { Badge } from '@/pages/admin/academic/components/ui/badge';
import { toast } from 'sonner';

// Academic Admin has semi-CRUD (can add and edit, but not delete)
export default function AcademicStudents() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Student }>({
    open: false,
    mode: 'add',
  });
  const [profileModal, setProfileModal] = useState<{ open: boolean; data: Student | null }>({
    open: false,
    data: null,
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'enrollmentYear', label: 'Year' },
    {
      key: 'status',
      label: 'Status',
      render: (student: Student) => (
        <Badge
          variant={student.status === 'active' ? 'default' : 'secondary'}
          className={
            student.status === 'active' ? 'bg-success' :
            student.status === 'completed' ? 'bg-secondary' : ''
          }
        >
          {student.status}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => {
    setFormModal({ open: true, mode: 'add' });
  };

  const handleView = (student: Student) => {
    setProfileModal({ open: true, data: student });
  };

  const handleEdit = (student: Student) => {
    setFormModal({ open: true, mode: 'edit', data: student });
  };

  const handleSave = (data: Partial<Student>) => {
    if (formModal.mode === 'add') {
      const newStudent: Student = {
        id: String(Date.now()),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        enrollmentYear: data.enrollmentYear || new Date().getFullYear(),
        status: data.status || 'active',
      };
      setStudents((prev) => [...prev, newStudent]);
      toast.success('Student added successfully');
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === formModal.data?.id ? { ...s, ...data } : s))
      );
      toast.success('Student updated successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student records (Add & Edit only)</p>
        </div>

        <DataTable
          data={students}
          columns={columns}
          title="All Students"
          searchPlaceholder="Search students..."
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          canDelete={false}
        />

        <UserFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          type="student"
          initialData={formModal.data}
          mode={formModal.mode}
        />

        <ProfileModal
          open={profileModal.open}
          onClose={() => setProfileModal({ open: false, data: null })}
          data={profileModal.data}
          type="student"
        />
      </div>
    </AdminLayout>
  );
}
