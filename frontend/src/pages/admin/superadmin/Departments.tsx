import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { DepartmentFormModal } from '@/pages/admin/superadmin/components/modals/DepartmentFormModal';
import { mockDepartments as initialDepartments } from '@/data/mockData';
import { Department } from '@/types/auth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/admin/superadmin/components/ui/alert-dialog';

export default function SuperAdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Department }>({
    open: false,
    mode: 'add',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Department | null }>({
    open: false,
    data: null,
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

  const handleDelete = (item: Department) => {
    setDeleteDialog({ open: true, data: item });
  };

  const confirmDelete = () => {
    if (deleteDialog.data) {
      setDepartments((prev) => prev.filter((d) => d.id !== deleteDialog.data!.id));
      toast.success('Department deleted successfully');
    }
    setDeleteDialog({ open: false, data: null });
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
          <p className="text-muted-foreground">Create and manage departments</p>
        </div>

        <DataTable
          data={departments}
          columns={columns}
          title="All Departments"
          searchPlaceholder="Search departments..."
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <DepartmentFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          initialData={formModal.data}
          mode={formModal.mode}
        />

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, data: null })}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteDialog.data?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
