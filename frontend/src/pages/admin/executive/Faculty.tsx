import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/executive/components/dashboard/DataTable';
import { mockFaculty as initialFaculty, mockDepartments } from '@/data/mockData';
import { Faculty } from '@/types/auth';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Input } from '@/pages/admin/executive/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/executive/components/ui/select';

export default function ExecutiveFaculty() {
  const navigate = useNavigate();
  const [faculty] = useState<Faculty[]>(initialFaculty);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');

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

  const handleView = (item: Faculty) => {
    navigate(`/admin/executive/faculty/${item.id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Directory</h1>
          <p className="text-muted-foreground">View and overview all institutional faculty records</p>
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
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          data={filteredFaculty}
          columns={columns}
          title="All Faculty"
          searchPlaceholder="Search by Name..."
          onView={handleView}
          canAdd={false}
          canEdit={false}
          canDelete={false}
        />
      </div>
    </AdminLayout>
  );
}
