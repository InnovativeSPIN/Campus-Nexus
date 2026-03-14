import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { ClassFormModal } from '@/pages/admin/superadmin/components/modals/ClassFormModal';
import { Class, Department } from '@/types/auth';
import { toast } from '@/components/ui/sonner';
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

export default function SuperAdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Class }>({
    open: false,
    mode: 'add',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Class | null }>({
    open: false,
    data: null,
  });

  // Fetch classes and departments on component mount
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments
      const deptResponse = await fetch('/api/v1/departments');
      const deptResult = await deptResponse.json();
      if (deptResult.success) {
        setDepartments(deptResult.data.map((d: any) => ({
          ...d,
          id: d.id || d._id,
          name: d.name || d.short_name || d.full_name,
        })));
      }

      // Fetch classes
      const classResponse = await fetch('/api/v1/admin/classes');
      const classResult = await classResponse.json();
      if (classResult.success) {
        setClasses(classResult.data.map((c: any) => ({
          ...c,
          id: c.id?.toString() || '',
        })).filter((c: Class) => c.id));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch classes and departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'room', label: 'Room' },
    { 
      key: 'department', 
      label: 'Department',
      render: (item: Class) =>
        item.department?.name || item.department?.short_name || item.department?.full_name || 'N/A'
    },
    { key: 'capacity', label: 'Capacity' },
    { 
      key: 'batch', 
      label: 'Batch',
      render: (item: Class) => item.batch || '-'
    },
    { 
      key: 'semester', 
      label: 'Semester',
      render: (item: Class) => item.semester ? `Sem ${item.semester}` : '-'
    },
    { 
      key: 'academic_year', 
      label: 'Academic Year',
      render: (item: Class) => item.academic_year || '-'
    },
    { 
      key: 'section', 
      label: 'Section',
      render: (item: Class) => item.section || '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Class) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const handleAdd = () => {
    setFormModal({ open: true, mode: 'add' });
  };

  const handleEdit = (item: Class) => {
    setFormModal({ open: true, mode: 'edit', data: item });
  };

  const handleDelete = (item: Class) => {
    setDeleteDialog({ open: true, data: item });
  };

  const confirmDelete = async () => {
    if (deleteDialog.data) {
      try {
        const response = await fetch(`/api/v1/admin/classes/${deleteDialog.data.id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          toast.success('Class deleted successfully');
          fetchData();
        } else {
          toast.error(result.error || 'Failed to delete class');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Error deleting class');
      }
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleSave = async (data: Partial<Class>) => {
    try {
      const url = formModal.mode === 'add' ? '/api/v1/admin/classes' : `/api/v1/admin/classes/${formModal.data?.id}`;
      const method = formModal.mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Class ${formModal.mode === 'add' ? 'created' : 'updated'} successfully`);
        setFormModal({ open: false, mode: 'add' });
        fetchData();
      } else {
        toast.error(result.error || `Failed to ${formModal.mode === 'add' ? 'create' : 'update'} class`);
      }
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Error saving class');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Management</h1>
          <p className="text-muted-foreground">Create and manage classes with all details</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <DataTable<any>
            data={classes}
            columns={columns}
            title="All Classes"
            searchPlaceholder="Search classes..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <ClassFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          initialData={formModal.data}
          mode={formModal.mode}
          departments={departments}
        />

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, data: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the class "{deleteDialog.data?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
