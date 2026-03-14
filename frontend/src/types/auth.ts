
export type UserRole =
	| 'superadmin'
	| 'super-admin'
	| 'executive'
	| 'executiveadmin'
	| 'academic'
	| 'academicadmin'
	| 'exam_cell_admin'
	| 'placement_cell_admin'
	| 'research_development_admin'
	| 'department-admin'
	| 'faculty'
	| 'student';

export interface Department {
	short_name: string;
	full_name: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	avatar?: string;
	department?: Department | string;
	designation?: string;
	rollNo?: string;
	year?: number;
	semester?: number;
	// additional flags for faculty
	is_timetable_incharge?: boolean;
	is_placement_coordinator?: boolean;
	is_class_incharge?: boolean;
	class_incharge_class_id?: number | null;
}

export interface Student {
	id: string;
	role_id: number;
	studentId: string;
	rollNumber: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	photo?: string;
	gender: 'male' | 'female' | 'other';
	departmentId: number;
	classId?: number;
	batch: string;
	semester: number;
	admissionDate?: string;
	admissionType?: 'regular' | 'lateral' | 'management';
	feeStatus?: 'paid' | 'pending' | 'partial';
	status?: 'active' | 'completed' | 'inactive';
	year?: string;
	// computed by frontend from batch
	enrollmentYear?: number;
	// derived client-side: 1–4 representing academic year
	studyYear?: number;
	// additional computed props used by UI
	departmentName?: string;
	academicYear?: string;
	// UI helpers
	name?: string;
	avatar?: string;
	department?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Faculty {
	id: string;
	faculty_id?: number;
	faculty_college_code: string;
	AICTE_ID?: number;
	Anna_University_ID?: number;
	Name?: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	phone?: string;
	phone_number?: string;
	password?: string;
	role_id?: number;
	department_id?: number;
	department?: any;
	designation?: string;
	educational_qualification?: string;
	gender?: 'Male' | 'Female' | 'Other';
	date_of_birth?: string;
	date_of_joining?: string;
	joinDate?: string;
	profile_image_url?: string;
	status?: 'active' | 'completed' | 'inactive';
	blood_group?: string;
	aadhar_number?: string;
	pan_number?: string;
	perm_address?: string;
	curr_address?: string;
	created_at?: string;
	updated_at?: string;
	orcidId?: string;
	phdStatus?: 'Completed' | 'Pursuing';
	thesisTitle?: string;
	registerNo?: string;
	guideName?: string;
}

export interface Role {
	role_id: number;
	role_name: string;
}

export interface Admin {
	id: string;
	name: string;
	email: string;
	// backend will return a flattened role_name string
	role?: string;
	// when creating/updating we may supply numeric id instead
	role_id?: number;
	department?: string;
	departmentCode?: string;
	status: 'active' | 'inactive';
	avatar?: string;
}

export interface Department {
	id: string;
	name: string;
	code: string;
	headOfDepartment: string;
	facultyCount: number;
	studentCount: number;
}

export interface Class {
	id: string | number;
	name: string;
	room?: string;
	department_id: number;
	capacity?: number;
	status?: 'active' | 'inactive';
	batch?: string;
	semester?: number;
	academic_year?: string;
	section?: string;
	department?: Department;
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
