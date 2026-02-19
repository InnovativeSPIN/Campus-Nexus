import User from './User.model.js';
import Department from './Department.model.js';
import Faculty from './Faculty.model.js';
import Student from './Student.model.js';
import ClassModel from './Class.model.js';
import Subject from './Subject.model.js';
import Announcement from './Announcement.model.js';
import Attendance from './Attendance.model.js';
import AttendanceStudent from './AttendanceStudent.model.js';
import FacultyAttendance from './FacultyAttendance.model.js';
import Leave from './Leave.model.js';
import LeaveBalance from './LeaveBalance.model.js';
import PeriodConfig from './PeriodConfig.model.js';
import Timetable from './Timetable.model.js';
import TimetableSlot from './TimetableSlot.model.js';
import FacultySubject from './FacultySubject.model.js';
import FacultyClass from './FacultyClass.model.js';
import StudentSubject from './StudentSubject.model.js';
import FacultyPhd from './FacultyPhd.model.js';

let initialized = false;

const initModels = () => {
  if (initialized) {
    return;
  }

  Department.hasMany(ClassModel, { foreignKey: 'departmentId' });
  ClassModel.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

  Department.hasMany(Subject, { foreignKey: 'departmentId' });
  Subject.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

  Department.hasMany(Faculty, { foreignKey: 'departmentId' });
  Faculty.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

  Department.hasMany(Student, { foreignKey: 'departmentId' });
  Student.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

  Department.belongsTo(Faculty, { as: 'head', foreignKey: 'headId' });
  Faculty.hasOne(Department, { as: 'headedDepartment', foreignKey: 'headId' });

  Faculty.hasMany(FacultyPhd, { as: 'phds', foreignKey: 'faculty_id' });
  FacultyPhd.belongsTo(Faculty, { as: 'faculty', foreignKey: 'faculty_id' });

  User.hasOne(Faculty, { foreignKey: 'userId' });
  Faculty.belongsTo(User, { as: 'user', foreignKey: 'userId' });

  User.hasOne(Student, { foreignKey: 'userId' });
  Student.belongsTo(User, { as: 'user', foreignKey: 'userId' });

  ClassModel.belongsTo(Faculty, { as: 'classTeacher', foreignKey: 'classTeacherId' });

  Faculty.belongsToMany(Subject, {
    as: 'subjects',
    through: FacultySubject,
    foreignKey: 'facultyId',
    otherKey: 'subjectId'
  });
  Subject.belongsToMany(Faculty, {
    as: 'facultyMembers',
    through: FacultySubject,
    foreignKey: 'subjectId',
    otherKey: 'facultyId'
  });

  Faculty.belongsToMany(ClassModel, {
    as: 'assignedClasses',
    through: FacultyClass,
    foreignKey: 'facultyId',
    otherKey: 'classId'
  });
  ClassModel.belongsToMany(Faculty, {
    as: 'assignedFaculty',
    through: FacultyClass,
    foreignKey: 'classId',
    otherKey: 'facultyId'
  });

  Student.belongsToMany(Subject, {
    as: 'subjects',
    through: StudentSubject,
    foreignKey: 'studentId',
    otherKey: 'subjectId'
  });
  Subject.belongsToMany(Student, {
    as: 'students',
    through: StudentSubject,
    foreignKey: 'subjectId',
    otherKey: 'studentId'
  });

  Announcement.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  Attendance.belongsTo(ClassModel, { as: 'class', foreignKey: 'classId' });
  Attendance.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
  Attendance.belongsTo(Faculty, { as: 'faculty', foreignKey: 'facultyId' });
  Attendance.belongsTo(User, { as: 'markedBy', foreignKey: 'markedById' });
  Attendance.hasMany(AttendanceStudent, { as: 'students', foreignKey: 'attendanceId' });
  AttendanceStudent.belongsTo(Attendance, { foreignKey: 'attendanceId' });
  AttendanceStudent.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });

  FacultyAttendance.belongsTo(Faculty, { as: 'faculty', foreignKey: 'facultyId' });
  FacultyAttendance.belongsTo(User, { as: 'markedBy', foreignKey: 'markedById' });

  Leave.belongsTo(User, { as: 'applicant', foreignKey: 'applicantId' });
  Leave.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });
  Leave.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

  LeaveBalance.belongsTo(User, { foreignKey: 'userId' });

  Timetable.belongsTo(ClassModel, { as: 'class', foreignKey: 'classId' });
  Timetable.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
  Timetable.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
  Timetable.hasMany(TimetableSlot, { as: 'slots', foreignKey: 'timetableId' });
  TimetableSlot.belongsTo(Timetable, { foreignKey: 'timetableId' });
  TimetableSlot.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
  TimetableSlot.belongsTo(Faculty, { as: 'faculty', foreignKey: 'facultyId' });

  initialized = true;
};

export default initModels;
