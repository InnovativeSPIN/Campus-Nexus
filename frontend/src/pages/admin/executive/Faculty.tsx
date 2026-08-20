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

export default function ExecutiveFaculty() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [designationFilter, setDesignationFilter] = useState<string>('all');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/faculty?limit=1000';
      if (departmentFilter && departmentFilter !== 'all') {
        url += `&department=${encodeURIComponent(departmentFilter)}`;
      }
      if (designationFilter && designationFilter !== 'all') {
        url += `&designation=${encodeURIComponent(designationFilter)}`;
      }
      if (searchFilter) {
        url += `&search=${encodeURIComponent(searchFilter)}`;
      }
      const response = await apiFetch(url);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setFaculty(result.data);
      }

      const deptRes = await apiFetch('/api/v1/departments');
      const deptJson = await deptRes.json();
      if (deptJson.success && Array.isArray(deptJson.data)) {
        setDepartments(deptJson.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to fetch faculty directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [departmentFilter, designationFilter, searchFilter]);

  const uniqueDesignations = useMemo(() => {
    return Array.from(new Set(faculty.map((f) => f.designation).filter(Boolean)));
  }, [faculty]);

  const getDepartmentName = (deptId: number | string) => {
    return departments.find((d) => d.id === Number(deptId))?.short_name || departments.find((d) => d.id === Number(deptId))?.full_name || 'N/A';
  };

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesDept = departmentFilter === 'all' || String(f.department_id) === departmentFilter;
      const matchesDesignation = designationFilter === 'all' || f.designation === designationFilter;
      const matchesSearch =
        !searchFilter ||
        (f.Name && f.Name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (f.faculty_college_code && f.faculty_college_code.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (f.email && f.email.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesDept && matchesDesignation && matchesSearch;
    });
  }, [faculty, departmentFilter, designationFilter, searchFilter]);

  const columns = [
    { key: 'faculty_college_code', label: 'College Code' },
    {
      key: 'profile_image_url',
      label: 'Photo',
      render: (item: any) => (
        <img
          src={item.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.Name || 'Faculty')}&background=random`}
          alt={item.Name || 'Faculty'}
          className="w-8 h-8 rounded-full object-cover"
        />
      )
    },
    { key: 'Name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'department_id', 
      label: 'Department',
      render: (item: any) => getDepartmentName(item.department_id)
    },
    { key: 'designation', label: 'Designation' },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => (
        <Badge
          variant={item.status === 'active' ? 'default' : 'secondary'}
          className={item.status === 'active' ? 'bg-success text-white' : ''}
        >
          {item.status || 'active'}
        </Badge>
      ),
    },
  ];

  const handleView = (item: any) => {
    navigate(`/admin/executive/faculty/${item.faculty_id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Directory</h1>
          <p className="text-muted-foreground">View and overview all institutional faculty records (Live Database)</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
          <div>
            <Input
              placeholder="Search by name, code, or email..."
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
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.full_name || dept.short_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={designationFilter} onValueChange={setDesignationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {uniqueDesignations.map((des) => (
                  <SelectItem key={des as string} value={des as string}>
                    {des as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => { setDepartmentFilter('all'); setDesignationFilter('all'); setSearchFilter(''); }}
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
            data={filteredFaculty.map((f, index) => ({ ...f, id: (f.faculty_id ?? index).toString() }))}
            columns={columns}
            title={`All Faculty (${filteredFaculty.length})`}
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
