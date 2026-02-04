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

export const mockStudents: Student[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "1234567890", department: "Computer Science", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", phone: "1234567890", department: "Mechanical Engineering", enrollmentYear: 2022, semester: 5, status: "active" },
  { id: "3", name: "Carol Lee", email: "carol@example.com", phone: "1234567890", department: "Electronics", enrollmentYear: 2024, semester: 1, status: "active" },
  { id: "4", name: "David Kim", email: "david@example.com", phone: "1234567890", department: "Civil Engineering", enrollmentYear: 2021, semester: 7, status: "inactive" },
  { id: "5", name: "Eva Brown", email: "eva@example.com", phone: "1234567890", department: "Mathematics", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "6", name: "Frank Green", email: "frank@example.com", phone: "1234567890", department: "Physics", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "7", name: "Grace Miller", email: "grace@example.com", phone: "1234567890", department: "Computer Science", enrollmentYear: 2023, semester: 3, status: "active" },
  { id: "8", name: "Henry Wilson", email: "henry@example.com", phone: "1234567890", department: "Mechanical Engineering", enrollmentYear: 2022, semester: 5, status: "active" },
];

export const mockFaculty: Faculty[] = [
  { id: "1", employeeId: "FAC001", name: "Prof. Xavier", email: "xavier@edu.com", phone: "9876543210", designation: "Professor", department: "Computer Science", joinDate: "2015-06-01", status: "active" },
  { id: "2", employeeId: "FAC002", name: "Dr. Jane Foster", email: "jane@edu.com", phone: "9876543210", designation: "Associate Professor", department: "Physics", joinDate: "2018-08-15", status: "active" },
  { id: "3", employeeId: "FAC003", name: "Dr. Bruce Wayne", email: "bruce@edu.com", phone: "9876543210", designation: "Assistant Professor", department: "Electronics", joinDate: "2020-01-10", status: "active" },
  { id: "4", employeeId: "FAC004", name: "Dr. Clark Kent", email: "clark@edu.com", phone: "9876543210", designation: "Professor", department: "Mathematics", joinDate: "2016-03-20", status: "active" },
  { id: "5", employeeId: "FAC005", name: "Prof. Diana Prince", email: "diana@edu.com", phone: "9876543210", designation: "Professor", department: "Computer Science", joinDate: "2017-09-12", status: "active" },
];

export const mockAdmins: Admin[] = [
  { id: "1", name: "Admin One", email: "admin1@edu.com", role: "executive", status: "active" },
  { id: "2", name: "Admin Two", email: "admin2@edu.com", role: "academic", department: "Computer Science", status: "active" },
  { id: "3", name: "Admin Three", email: "admin3@edu.com", role: "faculty_admin", status: "active" },
  { id: "4", name: "Admin Four", email: "admin4@edu.com", role: "executive", status: "active" },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Computer Science', code: 'CS', headOfDepartment: 'Dr. Sarah Chen', facultyCount: 12, studentCount: 150 },
  { id: '2', name: 'Mechanical Engineering', code: 'ME', headOfDepartment: 'Dr. Michael Roberts', facultyCount: 10, studentCount: 120 },
  { id: '3', name: 'Electronics', code: 'EC', headOfDepartment: 'Dr. Emily Watson', facultyCount: 8, studentCount: 100 },
  { id: '4', name: 'Civil Engineering', code: 'CE', headOfDepartment: 'Dr. James Anderson', facultyCount: 9, studentCount: 110 },
  { id: '5', name: 'Mathematics', code: 'MATH', headOfDepartment: 'Dr. Lisa Park', facultyCount: 6, studentCount: 45 },
  { id: '6', name: 'Physics', code: 'PHY', headOfDepartment: 'Dr. Robert Kim', facultyCount: 5, studentCount: 40 },
];

export const mockAcademicYears = [
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
];

export const mockTimeTable: TimeTableEntry[] = [
  { id: "1", facultyId: "1", facultyName: "Prof. Xavier", subject: "Advanced AI", classOrLab: "CS-101", day: "Monday", period: 1, time: "09:00 - 10:00", academicYear: "2024-2025", semester: "odd" },
  { id: "2", facultyId: "1", facultyName: "Prof. Xavier", subject: "Machine Learning", classOrLab: "Lab-2", day: "Monday", period: 2, time: "10:00 - 11:00", academicYear: "2024-2025", semester: "odd" },
  { id: "3", facultyId: "2", facultyName: "Dr. Jane Foster", subject: "Quantum Physics", classOrLab: "PHY-202", day: "Tuesday", period: 1, time: "09:00 - 10:00", academicYear: "2024-2025", semester: "odd" },
  { id: "4", facultyId: "3", facultyName: "Dr. Bruce Wayne", subject: "Circuit Theory", classOrLab: "EC-305", day: "Wednesday", period: 3, time: "11:00 - 12:00", academicYear: "2023-2024", semester: "even" },
  { id: "5", facultyId: "4", facultyName: "Dr. Clark Kent", subject: "Number Theory", classOrLab: "MATH-11", day: "Thursday", period: 4, time: "12:00 - 13:00", academicYear: "2024-2025", semester: "odd" },
  { id: "6", facultyId: "5", facultyName: "Prof. Diana Prince", subject: "Ethics in AI", classOrLab: "CS-Seminar", day: "Friday", period: 2, time: "10:00 - 11:00", academicYear: "2024-2025", semester: "odd" },
];
