import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/superadmin/components/modals/UserFormModal';
import { Student } from '@/types/auth';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/superadmin/components/ui/select';
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

export default function SuperAdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  // helper to load students & departments
  const loadData = async () => {
    try {
      setLoading(true);
      // build query string from current filters
      const params = new URLSearchParams();
      if (departmentFilter && departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }
      if (yearFilter && yearFilter !== 'all') {
        // send studyYear to backend so it can filter by batch prefix
        params.append('studyYear', yearFilter);
      }
      // always ask for unlimited results
      params.append('limit', '0');
      const url = '/api/v1/students' + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setStudents(
          json.data.map((s: any) => ({
            ...s,
            // ensure UI-friendly fields
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            department: s.department ? s.department.name : '',
            departmentId: s.departmentId ? Number(s.departmentId) : s.department && s.department.id ? Number(s.department.id) : null,
            enrollmentYear: s.batch ? parseInt(s.batch.split('-')[0], 10) : undefined,
            studyYear: s.batch ? (new Date().getFullYear() - parseInt(s.batch.split('-')[0], 10) + 1) : undefined,
          }))
        );
      }

      const deptRes = await fetch('/api/v1/departments', { credentials: 'include' });
      const deptJson = await deptRes.json();
      if (deptJson.success) {
        setDepartments(
          deptJson.data.map((d: any) => ({
            ...d,
            name: d.short_name || d.full_name
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load students or departments', err);
      toast.error('Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // reload when filters change
  useEffect(() => {
    loadData();
  }, [departmentFilter, yearFilter]);

  // open edit modal when url contains ?edit=<id>
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId && students.length > 0) {
      const stu = students.find((s) => s.id === editId);
      if (stu) {
        handleEdit(stu);
      }
    }
  }, [location.search, students]);

  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Student }>({
    open: false,
    mode: 'add',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Student | null }>({
    open: false,
    data: null,
  });

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const deptId = s.departmentId != null ? Number(s.departmentId) : null;
      const matchesDept =
        departmentFilter === 'all' ||
        (deptId !== null && deptId === parseInt(departmentFilter, 10));
      let matchesYear = true;
      if (yearFilter && yearFilter !== 'all') {
        matchesYear = s.studyYear === parseInt(yearFilter, 10);
      }
      return matchesDept && matchesYear;
    });
  }, [students, departmentFilter, yearFilter]);

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
    // navigate to profile route defined in App.tsx
    navigate(`/admin/superadmin/students/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    // pass departmentId (string) rather than department name so modal selects correctly
    const editData = { ...student, department: student.departmentId != null ? String(student.departmentId) : '' } as any;
    setFormModal({ open: true, mode: 'edit', data: editData });
  };

  const handleDelete = (student: Student) => {
    setDeleteDialog({ open: true, data: student });
  };

  const confirmDelete = async () => {
    if (deleteDialog.data) {
      try {
        await fetch(`/api/v1/students/${deleteDialog.data.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        toast.success('Student deleted successfully');
        await loadData();
      } catch (err) {
        console.error('Failed to delete student', err);
        toast.error('Unable to delete student');
      }
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleSave = async (data: any) => {
    // transform department value to id if it is string
    const payload: any = { ...data };
    if (payload.department && typeof payload.department !== 'number') {
      payload.department = parseInt(payload.department, 10);
    }

    try {
      if (formModal.mode === 'add') {
        const res = await fetch('/api/v1/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Student added successfully');
          await loadData();
          navigate('/admin/superadmin/students', { replace: true });
        } else {
          toast.error(json.message || 'Failed to add student');
        }
      } else {
        const res = await fetch(`/api/v1/students/${formModal.data?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Student updated successfully');
          await loadData();
          // clear query param after editing
          navigate('/admin/superadmin/students', { replace: true });
        } else {
          toast.error(json.message || 'Failed to update student');
        }
      }
    } catch (err) {
      console.error('Error saving student', err);
      toast.error('Unable to save student');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage all student records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex-1">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          data={filteredStudents}
          columns={columns}
          title="All Students"
          searchPlaceholder="Search students..."
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <UserFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          type="student"
          initialData={formModal.data}
          mode={formModal.mode}
        />



        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, data: null })}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
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
