import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/executive/components/dashboard/DataTable';
import { mockStudents as initialStudents, mockDepartments } from '@/data/mockData';
import { Student } from '@/types/auth';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Input } from '@/pages/admin/executive/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/executive/components/ui/select';

export default function ExecutiveStudents() {
  const navigate = useNavigate();
  const [students] = useState<Student[]>(initialStudents);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesDept = departmentFilter === 'all' || s.departmentId === parseInt(departmentFilter);
      const matchesYear = !yearFilter || (s.batch && s.batch.toString().includes(yearFilter));
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

  const handleView = (student: Student) => {
    navigate(`/admin/executive/students/${student.id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
          <p className="text-muted-foreground">View and overview all institutional student records</p>
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
                {mockDepartments.map(dept => (
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
          onView={handleView}
          canAdd={false}
          canEdit={false}
          canDelete={false}
        />
      </div>
    </AdminLayout>
  );
}
