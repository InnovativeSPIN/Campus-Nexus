import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { FacultyFormModal } from '@/pages/admin/superadmin/components/modals/FacultyFormModal';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/superadmin/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/pages/admin/superadmin/components/ui/table';
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
import { Plus, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { FacultyUploadModal } from '@/pages/admin/superadmin/components/modals/FacultyUploadModal';

export default function SuperAdminFaculty() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('all');

  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    data?: any;
  }>({
    open: false,
    mode: 'add',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    data: any | null;
  }>({
    open: false,
    data: null,
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);


  const fetchFaculty = async (filters: { department?: string; designation?: string; search?: string } = {}) => {
    try {
      setLoading(true);
      let url = '/api/v1/faculty?limit=1000'; // ask backend for many rows since we handle paging client side
      if (filters.department && filters.department !== 'all') {
        url += `&department=${encodeURIComponent(filters.department)}`;
      }
      if (filters.designation && filters.designation !== 'all') {
        url += `&designation=${encodeURIComponent(filters.designation)}`;
      }
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setFaculty(Array.isArray(result.data) ? result.data : []);
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
        setDepartments(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    // re-fetch whenever filters change
    fetchFaculty({ department: departmentFilter, designation: designationFilter, search: searchFilter });
    fetchDepartments();
  }, [departmentFilter, designationFilter, searchFilter]);

  const uniqueDesignations = useMemo(() => {
    return Array.from(new Set(faculty.map((f) => f.designation).filter(Boolean)));
  }, [faculty]);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesDept = departmentFilter === 'all' || String(f.department_id) === departmentFilter;
      const matchesDesignation =
        designationFilter === 'all' || f.designation === designationFilter;
      const matchesSearch =
        !searchFilter ||
        f.Name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.faculty_college_code?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesDept && matchesDesignation && matchesSearch;
    });
  }, [faculty, departmentFilter, designationFilter, searchFilter]);

  const handleDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      const response = await fetch(
        `/api/v1/faculty/${deleteDialog.data.faculty_id}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (result.success) {
        toast.success('Faculty deleted successfully');
        fetchFaculty();
        setDeleteDialog({ open: false, data: null });
      } else {
        toast.error(result.message || 'Failed to delete faculty');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete faculty');
    }
  };

  const getDepartmentName = (deptId: number | string) => {
    return departments.find((d) => d.id === Number(deptId))?.full_name || 'N/A';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
            <p className="text-muted-foreground mt-1">Manage all faculty members and their profiles</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFormModal({ open: true, mode: 'add' })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add New Faculty
            </Button>
            <Button
              variant="secondary"
              onClick={() => setUploadModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Upload Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search by name, code, or email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchFaculty({ department: departmentFilter, designation: designationFilter, search: searchFilter }); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.full_name || dept.short_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <Select value={designationFilter} onValueChange={(val) => setDesignationFilter(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {uniqueDesignations.map((des) => (
                  <SelectItem key={des} value={des as string}>
                    {des}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <div className="flex items-center justify-center h-9 rounded-md border border-input bg-muted/50 px-3">
              <span className="text-sm font-medium">{filteredFaculty.length} found</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No faculty found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>College Code</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((fac) => (
                  <TableRow key={fac.faculty_id} className="hover:bg-muted/50">
                    <TableCell>
                      <img
                        src={
                          fac.profile_image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(fac.Name)}&background=random&size=40`
                        }
                        alt={fac.Name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{fac.Name}</TableCell>
                    <TableCell className="text-sm">{fac.faculty_college_code}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fac.email}</TableCell>
                    <TableCell className="text-sm">{fac.designation || '-'}</TableCell>
                    <TableCell className="text-sm">{getDepartmentName(fac.department_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={fac.status === 'active' ? 'default' : 'secondary'}
                        className={
                          fac.status === 'active'
                            ? 'bg-green-600'
                            : fac.status === 'on_leave'
                            ? 'bg-yellow-600'
                            : 'bg-gray-600'
                        }
                      >
                        {fac.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/superadmin/faculty/${fac.faculty_id}`)}
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormModal({ open: true, mode: 'edit', data: fac })
                        }
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({ open: true, data: fac })
                        }
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Faculty Form Modal */}
      <FacultyFormModal
        open={formModal.open}
        onOpenChange={(open) => setFormModal({ ...formModal, open })}
        mode={formModal.mode}
        facultyData={formModal.data}
        departments={departments}
        onSuccess={fetchFaculty}
      />

      {/* Upload Modal */}
      <FacultyUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={fetchFaculty}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.data?.Name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
