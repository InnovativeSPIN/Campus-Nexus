import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/superadmin/components/modals/UserFormModal';
import { Faculty } from '@/types/auth';
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

export default function SuperAdminFaculty() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/faculty');
      const result = await response.json();
      if (result.success) {
        setFaculty(result.data.map((f: any) => ({
          ...f,
          name: `${f.firstName} ${f.lastName}`,
          department: f.department?.name || 'N/A'
        })));
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/v1/departments');
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const hodCount = useMemo(() => faculty.filter(f => f.designation === 'HOD').length, [faculty]);

  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Faculty }>({
    open: false,
    mode: 'add',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Faculty | null }>({
    open: false,
    data: null,
  });

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const matchesDept = departmentFilter === 'all' || f.department === departmentFilter;
      const matchesEmpId = !employeeIdFilter || (f.employeeId && f.employeeId.toLowerCase().includes(employeeIdFilter.toLowerCase()));
      return matchesDept && matchesEmpId;
    });
  }, [faculty, departmentFilter, employeeIdFilter]);

  const columns = [
    { key: 'employeeId', label: 'ID' },
    {
      key: 'avatar',
      label: 'Photo',
      render: (item: Faculty) => (
        <img
          src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
          alt={item.name}
          className="w-8 h-8 rounded-full"
        />
      )
    },
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
    navigate(`/admin/superadmin/faculty/${item.id}`);
  };

  const handleEdit = (item: Faculty) => {
    setFormModal({ open: true, mode: 'edit', data: item });
  };

  const handleDelete = (item: Faculty) => {
    setDeleteDialog({ open: true, data: item });
  };

  const confirmDelete = () => {
    if (deleteDialog.data) {
      setFaculty((prev) => prev.filter((f) => f.id !== deleteDialog.data!.id));
      toast.success('Faculty member deleted successfully');
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleSave = (data: any) => {
    if (formModal.mode === 'add') {
      const newFaculty: Faculty = {
        id: String(Date.now()),
        employeeId: data.employeeId || `FAC${Date.now()}`,
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
          <p className="text-muted-foreground">Manage all faculty records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm text-muted-foreground">Total Faculty</p>
            <p className="text-2xl font-bold">{faculty.length}</p>
            <p className="text-xs text-success mt-1">Status: All Records</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm text-muted-foreground">HODs assigned</p>
            <p className="text-2xl font-bold">{hodCount}</p>
            <p className="text-xs text-blue-500 mt-1">1 HOD per Department</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm text-muted-foreground">Faculty Target</p>
            <p className="text-2xl font-bold">30+</p>
            <p className="text-xs text-muted-foreground mt-1">Recommended per Dept</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex-1">
            <Input
              placeholder="Filter by Employee Code..."
              value={employeeIdFilter}
              onChange={(e) => setEmployeeIdFilter(e.target.value)}
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

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <DataTable
            data={filteredFaculty}
            columns={columns}
            title="All Faculty"
            searchPlaceholder="Search by Name..."
            onAdd={handleAdd}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <UserFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add' })}
          onSave={handleSave}
          type="faculty"
          initialData={formModal.data}
          mode={formModal.mode}
        />



        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, data: null })}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Faculty Member</AlertDialogTitle>
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
