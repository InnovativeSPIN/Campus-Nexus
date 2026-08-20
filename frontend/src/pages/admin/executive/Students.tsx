import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/executive/components/dashboard/DataTable';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Input } from '@/pages/admin/executive/components/ui/input';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/executive/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function ExecutiveStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter && departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }
      if (academicYearFilter && academicYearFilter !== 'all') {
        params.append('batch', academicYearFilter);
      }
      if (searchFilter) {
        params.append('search', searchFilter);
      }
      params.append('limit', '1000');
      
      const url = '/api/v1/students' + (params.toString() ? `?${params.toString()}` : '');
      const res = await apiFetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((s: any) => ({
          ...s,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Student',
          departmentName: s.department ? (s.department.short_name || s.department.full_name) : '',
          studentCode: s.studentId || s.rollNumber || `ID-${s.id}`,
        }));
        setStudents(mapped);
      }

      const deptRes = await apiFetch('/api/v1/departments');
      const deptJson = await deptRes.json();
      if (deptJson.success && Array.isArray(deptJson.data)) {
        setDepartments(deptJson.data);
      }
    } catch (err) {
      console.error('Failed to load students or departments', err);
      toast.error('Unable to load student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, academicYearFilter, searchFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const deptId = s.departmentId != null ? String(s.departmentId) : s.department?.id != null ? String(s.department.id) : '';
      const matchesDept = departmentFilter === 'all' || deptId === departmentFilter;
      const matchesSearch = !searchFilter || 
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchFilter.toLowerCase()));
      const matchesBatch = academicYearFilter === 'all' || s.batch === academicYearFilter;
      return matchesDept && matchesSearch && matchesBatch;
    });
  }, [students, departmentFilter, searchFilter, academicYearFilter]);

  const columns = [
    { 
      key: 'studentCode', 
      label: 'Student ID',
      render: (s: any) => s.studentCode || s.studentId || s.rollNumber || s.id
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'departmentName', label: 'Department' },
    { key: 'batch', label: 'Batch / Year' },
    {
      key: 'status',
      label: 'Status',
      render: (student: any) => (
        <Badge
          variant={student.status === 'active' ? 'default' : 'secondary'}
          className={
            student.status === 'active' ? 'bg-success text-white' :
            student.status === 'completed' ? 'bg-secondary text-white' : ''
          }
        >
          {student.status || 'active'}
        </Badge>
      ),
    },
  ];

  const handleView = (student: any) => {
    navigate(`/admin/executive/students/${student.id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
          <p className="text-muted-foreground">View and manage all institutional student records (Live Database)</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
          <div>
            <Input
              placeholder="Search by name, roll no, or email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={String(dept.id)}>{dept.full_name || dept.short_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="2025-2029">2025-2029</SelectItem>
                <SelectItem value="2024-2028">2024-2028</SelectItem>
                <SelectItem value="2023-2027">2023-2027</SelectItem>
                <SelectItem value="2022-2026">2022-2026</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => { setDepartmentFilter('all'); setSearchFilter(''); setAcademicYearFilter('all'); }}
              className="px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 bg-card border border-border rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            data={filteredStudents}
            columns={columns}
            title={`All Students (${filteredStudents.length})`}
            searchPlaceholder="Search within list..."
            onView={handleView}
            canAdd={false}
            canEdit={false}
            canDelete={false}
          />
        )}
      </div>
    </AdminLayout>
  );
}
