import { Student, Faculty, Admin } from '@/types/auth';

// NOTE: this file provides temporary placeholder data used by various
// components during early development.  Once the backend APIs are hooked
// up, these mocks can be removed and the components refactored to fetch
// real data instead.

export const mockDepartments = [
  { id: '1', name: 'Computer Science' },
  { id: '2', name: 'Electronics' },
  { id: '3', name: 'Mechanical' },
];

export const mockStudents: Student[] = [
  {
    id: 'stu1',
    role_id: 3,
    studentId: 'S001',
    rollNumber: '1001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    gender: 'male',
    departmentId: 1,
    batch: '2022-2023',
    semester: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stu2',
    role_id: 3,
    studentId: 'S002',
    rollNumber: '1002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    gender: 'female',
    departmentId: 2,
    batch: '2021-2022',
    semester: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockFaculty: Faculty[] = [
  {
    id: 'fac1',
    email: 'alice.smith@example.com',
    name: 'Alice Smith',
    department: 'Computer Science',
    designation: 'Professor',
    joinDate: '2020-07-15',
    status: 'active',
  } as any,
  {
    id: 'fac2',
    email: 'bob.jones@example.com',
    name: 'Bob Jones',
    department: 'Electronics',
    designation: 'Associate Professor',
    joinDate: '2018-01-10',
    status: 'active',
  } as any,
];

export const mockAdmins: Admin[] = [
  {
    id: 'adm1',
    name: 'Super Admin',
    email: 'admin@example.com',
    role: 'superadmin',
    status: 'active',
  },
  {
    id: 'adm2',
    name: 'Academic Admin',
    email: 'academic@example.com',
    role: 'academicadmin',
    status: 'active',
  },
];

export const dashboardStats = {
  totalStudents: mockStudents.length,
  totalFaculty: mockFaculty.length,
  totalDepartments: mockDepartments.length,
  activePrograms: 16,
  attendanceRate: 92,
  graduationRate: 76,
};
