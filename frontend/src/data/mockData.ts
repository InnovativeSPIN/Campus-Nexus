import { Student, Faculty, Admin, Department, TimeTableEntry } from '@/types/auth';

export const dashboardStats = {
  totalStudents: 1250,
  totalFaculty: 85,
  totalDepartments: 6,
  totalCourses: 48,
  activePrograms: 18,
  graduationRate: 94,
  attendanceRate: 89,
  activeAdmins: 8,
};

// legacy mock data used by some admin modules; superadmin now fetches real data from the API
export const mockStudents: Student[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "1234567890", department: "CSE", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", phone: "1234567890", department: "Mechanical Engineering", enrollmentYear: 2022, semester: 5, status: "active" },
  { id: "3", name: "Carol Lee", email: "carol@example.com", phone: "1234567890", department: "ECE", enrollmentYear: 2024, semester: 1, status: "completed" },
  { id: "4", name: "David Kim", email: "david@example.com", phone: "1234567890", department: "Civil Engineering", enrollmentYear: 2021, semester: 7, status: "inactive" },
  { id: "5", name: "Eva Brown", email: "eva@example.com", phone: "1234567890", department: "AI & DS", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "6", name: "Frank Green", email: "frank@example.com", phone: "1234567890", department: "B.Tech IT", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "7", name: "Grace Miller", email: "grace@example.com", phone: "1234567890", department: "EEE", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "8", name: "Henry Wilson", email: "henry@example.com", phone: "1234567890", department: "Mechanical Engineering", enrollmentYear: 2022, semester: 5, status: "active" },
  { id: "9", name: "Isla Martinez", email: "isla@example.com", phone: "1234567890", department: "CSE", enrollmentYear: 2020, semester: 7, status: "completed" },
];

// legacy faculty mock list (kept for offline examples)
export const mockFaculty: Faculty[] = [
  { id: "1", employeeId: "FAC001", name: "Prof. Xavier", email: "xavier@edu.com", phone: "9876543210", designation: "Professor", department: "CSE", joinDate: "2015-06-01", status: "active" },
  { id: "2", employeeId: "FAC002", name: "Dr. Jane Foster", email: "jane@edu.com", phone: "9876543210", designation: "Associate Professor", department: "AI & DS", joinDate: "2018-08-15", status: "active" },
  { id: "3", employeeId: "FAC003", name: "Dr. Bruce Wayne", email: "bruce@edu.com", phone: "9876543210", designation: "Assistant Professor", department: "ECE", joinDate: "2020-01-10", status: "active" },
  { id: "4", employeeId: "FAC004", name: "Dr. Clark Kent", email: "clark@edu.com", phone: "9876543210", designation: "Professor", department: "B.Tech IT", joinDate: "2016-03-20", status: "active" },
  { id: "5", employeeId: "FAC005", name: "Prof. Diana Prince", email: "diana@edu.com", phone: "9876543210", designation: "Professor", department: "EEE", joinDate: "2017-09-12", status: "active" },
];

export const mockAdmins: Admin[] = [
  { id: "1", name: "Executive Chief", email: "executive@edu.com", role: "executive", status: "active" },
  { id: "2", name: "Academic Dean", email: "academic@edu.com", role: "academic", department: "CSE", status: "active" },
  { id: "3", name: "Exam Controller", email: "exam@edu.com", role: "exam_cell_admin", status: "active" },
  { id: "4", name: "Placement Officer", email: "placement@edu.com", role: "placement_cell_admin", status: "active" },
  { id: "5", name: "R&D Director", email: "rnd@edu.com", role: "research_development_admin", status: "active" },
  { id: "6", name: "CSE Dept Admin", email: "deptadmin@edu.com", role: "department-admin", department: "CSE", status: "active" },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'CSE', code: 'CSE', headOfDepartment: 'Dr. Sarah Chen', facultyCount: 57, studentCount: 555 },
  { id: '2', name: 'Mechanical Engineering', code: 'ME', headOfDepartment: 'Dr. Michael Roberts', facultyCount: 45, studentCount: 450 },
  { id: '3', name: 'ECE', code: 'ECE', headOfDepartment: 'Dr. Emily Watson', facultyCount: 51, studentCount: 490 },
  { id: '4', name: 'EEE', code: 'EEE', headOfDepartment: 'Dr. John Miller', facultyCount: 41, studentCount: 380 },
  { id: '5', name: 'B.Tech IT', code: 'IT', headOfDepartment: 'Dr. Lisa Park', facultyCount: 46, studentCount: 410 },
  { id: '6', name: 'AI & DS', code: 'AIDS', headOfDepartment: 'Dr. Robert Kim', facultyCount: 36, studentCount: 175 },
  { id: '7', name: 'Civil Engineering', code: 'CE', headOfDepartment: 'Dr. James Anderson', facultyCount: 36, studentCount: 290 },
];

export const mockAcademicYears = [
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
];

export const mockTimeTable: TimeTableEntry[] = [
  { id: "1", facultyId: "1", facultyName: "Prof. Xavier", department: "CSE", subject: "Advanced AI", classOrLab: "CS-101", day: "Monday", period: 1, time: "09:00 - 10:00", academicYear: "2024-2025", semester: "odd" },
  { id: "2", facultyId: "1", facultyName: "Prof. Xavier", department: "CSE", subject: "Machine Learning", classOrLab: "Lab-2", day: "Monday", period: 2, time: "10:00 - 11:00", academicYear: "2024-2025", semester: "odd" },
  { id: "3", facultyId: "2", facultyName: "Dr. Jane Foster", department: "AI & DS", subject: "Quantum Physics", classOrLab: "PHY-202", day: "Tuesday", period: 1, time: "09:00 - 10:00", academicYear: "2024-2025", semester: "odd" },
  { id: "4", facultyId: "3", facultyName: "Dr. Bruce Wayne", department: "ECE", subject: "Circuit Theory", classOrLab: "EC-305", day: "Wednesday", period: 3, time: "11:00 - 12:00", academicYear: "2023-2024", semester: "even" },
  { id: "5", facultyId: "4", facultyName: "Dr. Clark Kent", department: "B.Tech IT", subject: "Number Theory", classOrLab: "MATH-11", day: "Thursday", period: 4, time: "12:00 - 13:00", academicYear: "2024-2025", semester: "odd" },
  { id: "6", facultyId: "5", facultyName: "Prof. Diana Prince", department: "EEE", subject: "Ethics in AI", classOrLab: "CS-Seminar", day: "Friday", period: 2, time: "10:00 - 11:00", academicYear: "2024-2025", semester: "odd" },
];
