import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/academic/components/dashboard/DataTable';
import { DepartmentFormModal } from '@/pages/admin/academic/components/modals/DepartmentFormModal';
import { mockDepartments as initialDepartments } from '@/data/mockData';
import { Department } from '@/types/auth';
import { toast } from 'sonner';

// Academic Admin can create departments but not delete
export default function AcademicDepartments() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Department }>({
    open: false,
    mode: 'add',
  });

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Department Name' },
    { key: 'headOfDepartment', label: 'Head of Department' },
    { key: 'facultyCount', label: 'Faculty' },
    { key: 'studentCount', label: 'Students' },
  ];

  const handleAdd = () => {
    setFormModal({ open: true, mode: 'add' });
  };

  const handleEdit = (item: Department) => {
    setFormModal({ open: true, mode: 'edit', data: item });
  };

  const handleSave = (data: Partial<Department>) => {
    if (formModal.mode === 'add') {
      const newDept: Department = {
        id: String(Date.now()),
        name: data.name || '',
        code: data.code || '',
        headOfDepartment: data.headOfDepartment || '',
        facultyCount: 0,
        studentCount: 0,
      };
      setDepartments((prev) => [...prev, newDept]);
      toast.success('Department created successfully');
    } else {
      setDepartments((prev) =>
        prev.map((d) => (d.id === formModal.data?.id ? { ...d, ...data } : d))
      );
      toast.success('Department updated successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">Create and manage departments (Add & Edit only)</p>
        </div>

        <DataTable
          data={departments}
          columns={columns}
          title="All Departments"
          searchPlaceholder="Search departments..."
          onAdd={handleAdd}
          onEdit={handleEdit}
          canDelete={false}
        />

        <DepartmentFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          initialData={formModal.data}
          mode={formModal.mode}
        />
      </div>
    </AdminLayout>
  );
}
