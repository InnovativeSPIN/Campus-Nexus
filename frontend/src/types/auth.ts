
export type UserRole = 'superadmin' | 'executive' | 'academic' | 'department-admin' | 'faculty' | 'student';

export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	avatar?: string;
	department?: string;
	rollNo?: string;
	year?: number;
	semester?: number;
}

export interface Student {
	id: string;
	name: string;
	email: string;
	phone: string;
	department: string;
	enrollmentYear: number;
	semester?: number;
	status: 'active' | 'inactive' | 'graduated';
	avatar?: string;
}

export interface Faculty {
	id: string;
	employeeId: string;
	name: string;
	email: string;
	phone: string;
	department: string;
	designation: string;
	joinDate: string;
	status: 'active' | 'inactive';
	avatar?: string;
}

export interface Admin {
	id: string;
	name: string;
	email: string;
	role: 'executive' | 'academic' | 'faculty_admin'; // specific admin roles
	department?: string;
	status: 'active' | 'inactive';
}

export interface Department {
	id: string;
	name: string;
	code: string;
	headOfDepartment: string;
	facultyCount: number;
	studentCount: number;
}

export interface TimeTableEntry {
	id: string;
	facultyId: string;
	facultyName: string;
	department: string;
	subject: string;
	classOrLab: string;
	day: string;
	period: number;
	time: string;
	academicYear: string;
	semester: 'odd' | 'even';
}
