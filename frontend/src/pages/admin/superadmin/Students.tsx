import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/superadmin/components/modals/UserFormModal';
import { Student } from '@/types/auth';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { toast } from 'sonner';
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
  const [yearFilter, setYearFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/students', { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
          setStudents(
            json.data.map((s: any) => ({
              ...s,
              department: s.department ? s.department.name : ''
            }))
          );
        }

        const deptRes = await fetch('/api/v1/departments', { credentials: 'include' });
        const deptJson = await deptRes.json();
        if (deptJson.success) {
          setDepartments(deptJson.data);
        }
      } catch (err) {
        console.error('Failed to load students or departments', err);
        toast.error('Unable to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
      const matchesYear = !yearFilter || (s.enrollmentYear && s.enrollmentYear.toString().includes(yearFilter));
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
    navigate(`/admin/superadmin/students/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    setFormModal({ open: true, mode: 'edit', data: student });
  };

  const handleDelete = (student: Student) => {
    setDeleteDialog({ open: true, data: student });
  };

  const confirmDelete = () => {
    if (deleteDialog.data) {
      setStudents((prev) => prev.filter((s) => s.id !== deleteDialog.data!.id));
      toast.success('Student deleted successfully');
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleSave = (data: any) => {
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
          <p className="text-muted-foreground">Manage all student records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex-1">
            <Input
              placeholder="Filter by Year (e.g. 2023)..."
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              type="number"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
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
