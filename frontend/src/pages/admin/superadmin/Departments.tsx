import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { DepartmentFormModal } from '@/pages/admin/superadmin/components/modals/DepartmentFormModal';
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Department }>({
    open: false,
    mode: 'add',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Department | null }>({
    open: false,
    data: null,
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/departments');
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data.map((d: any) => ({
          ...d,
          id: d._id,
          headOfDepartment: d.headOfDepartment || 'N/A',
          facultyCount: d.facultyCount || 0,
          studentCount: d.studentCount || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const confirmDelete = async () => {
    if (deleteDialog.data) {
      try {
        const response = await fetch(`/api/v1/departments/${deleteDialog.data.id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          toast.success('Department deleted successfully');
          fetchDepartments();
        } else {
          toast.error(result.error || 'Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Error deleting department');
      }
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleSave = async (data: Partial<Department>) => {
    try {
      const url = formModal.mode === 'add' ? '/api/v1/departments' : `/api/v1/departments/${formModal.data?.id}`;
      const method = formModal.mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Department ${formModal.mode === 'add' ? 'created' : 'updated'} successfully`);
        setFormModal({ open: false, mode: 'add' });
        fetchDepartments();
      } else {
        toast.error(result.error || `Failed to ${formModal.mode === 'add' ? 'create' : 'update'} department`);
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Error saving department');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">Create and manage departments</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <DataTable
            data={departments}
            columns={columns}
            title="All Departments"
            searchPlaceholder="Search departments..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

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
