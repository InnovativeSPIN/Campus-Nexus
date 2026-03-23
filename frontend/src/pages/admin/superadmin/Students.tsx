import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/superadmin/components/modals/UserFormModal';
import { StudentBulkUploadModal } from '@/pages/admin/superadmin/components/modals/StudentBulkUploadModal';
import { Student } from '@/types/auth';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { toast } from '@/components/ui/sonner';
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
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  // helper to load students & departments
  const loadData = async () => {
    try {
      // build query string from current filters
      const params = new URLSearchParams();
      if (departmentFilter && departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }
      if (yearFilter && yearFilter !== 'all') {
        // send studyYear to backend so it can filter by the database year column
        params.append('studyYear', yearFilter);
      }
      if (academicYearFilter && academicYearFilter !== 'all') {
        // batch value is the academic year string stored on student
        params.append('batch', academicYearFilter);
      }
      // always ask for unlimited results
      params.append('limit', '0');
      const url = '/api/v1/students' + (params.toString() ? `?${params.toString()}` : '');
      const token = localStorage.getItem('authToken');
      const res = await fetch(url, { 
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store' 
      });
      const json = await res.json();
      if (json.success) {
        const mapped: Student[] = json.data.map((s: any) => ({
          ...s,
          // ensure UI-friendly fields
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          department: s.department ? s.department.name : '',
          departmentId: s.departmentId ? Number(s.departmentId) : s.department && s.department.id ? Number(s.department.id) : null,
          enrollmentYear: s.batch ? parseInt(s.batch.split('-')[0], 10) : undefined,
          // batch is effectively the academic year; expose explicitly
          academicYear: s.batch,
          // map the year correctly to the respected student_profile table
          studyYear: s.year ? parseInt(s.year, 10) : (s.batch ? ((): number => {
            const start = parseInt(s.batch.split('-')[0], 10);
            const diff = new Date().getFullYear() - start;
            // guard against 0 or negative, treat as first year
            return diff > 0 ? diff : 1;
          })() : undefined),
        }));
        setStudents(mapped);
        // update dropdown choices based on whatever records we just loaded
        // mapping academic years (batches) as requested
        const defaultYears = ['2025-2029', '2024-2028', '2023-2027'];
        const years = Array.from(new Set([...defaultYears, ...mapped.map((s: Student) => s.batch)])).filter(Boolean).sort((a: any, b: any) => b.localeCompare(a));
        setAcademicYears(years as string[]);
      }

      const deptRes = await fetch('/api/v1/departments', { 
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // reload when filters change
  useEffect(() => {
    loadData();
  }, [departmentFilter, yearFilter, academicYearFilter]);

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
  const [bulkUploadModal, setBulkUploadModal] = useState(false);
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
      let matchesBatch = true;
      if (academicYearFilter && academicYearFilter !== 'all') {
        matchesBatch = s.batch === academicYearFilter;
      }
      return matchesDept && matchesYear && matchesBatch;
    });
  }, [students, departmentFilter, yearFilter, academicYearFilter]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'batch', label: 'Academic Year' },
    // display study year so it matches the "Year" filter above
    { key: 'studyYear', label: 'Year' },
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

  const handleBulkUpload = () => {
    setBulkUploadModal(true);
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
        const token = localStorage.getItem('authToken');
        await fetch(`/api/v1/students/${deleteDialog.data.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
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
    // Clean up and transform payload
    const payload: any = { ...data };
    
    // Remove frontend-only fields
    delete payload.avatarFile;
    
    // Split full name into firstName and lastName if present
    if (payload.name && typeof payload.name === 'string') {
      const nameParts = payload.name.trim().split(' ');
      payload.firstName = nameParts[0];
      payload.lastName = nameParts.slice(1).join(' ') || '.';
      delete payload.name;
    }

    // Transform department value to id if it is string
    if (payload.department && typeof payload.department !== 'number') {
      payload.department = parseInt(payload.department, 10);
    }

    // Ensure classId is an integer
    if (payload.classId && typeof payload.classId === 'string') {
      payload.classId = parseInt(payload.classId, 10) || null;
    }

    try {
      if (formModal.mode === 'add') {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/v1/students', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/v1/students/${formModal.data?.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors"
          >
            + Add Student
          </button>
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium text-sm transition-colors"
          >
            📥 Bulk Upload
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex-1">
            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Academic Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic Years</SelectItem>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>{year.replace('-', ' - ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        <StudentBulkUploadModal
          open={bulkUploadModal}
          onOpenChange={setBulkUploadModal}
          onSuccess={() => {
            loadData();
          }}
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
