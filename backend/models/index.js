import { Sequelize } from 'sequelize';
import { sequelize } from '../config/db.js';

// Import models
import User from './User.model.js';
import Role from './Role.model.js';
import Department from './Department.model.js';
import Subject from './Subject.model.js';
import PeriodConfig from './PeriodConfig.model.js';
import ClassModel from './Class.model.js';
import Timetable from './Timetable.model.js';
import TimetableSlot from './TimetableSlot.model.js';
import TimetableAlteration from './TimetableAlteration.model.js';
import Faculty from './Faculty.model.js';
import Student from './Student.model.js';
import Leave from './Leave.model.js';
import LeaveBalance from './LeaveBalance.model.js';
import Attendance from './Attendance.model.js';
import FacultyAttendance from './FacultyAttendance.model.js';
import AttendanceStudent from './AttendanceStudent.model.js';
import Announcement from './Announcement.model.js';
import YearBreakTiming from './YearBreakTiming.model.js';
import TimetableSlotAssignment from './TimetableSlotAssignment.model.js';
import TimetableNotification from './TimetableNotification.model.js';
import FacultySubjectAssignment from './FacultySubjectAssignment.model.js';
import SubjectClassMapping from './SubjectClassMapping.model.js';
import FacultyEduQualification from './FacultyEduQualification.model.js';
import FacultyExperience from './FacultyExperience.model.js';
import FacultyIndustryExperience from './FacultyIndustryExperience.model.js';
import FacultyPhd from './FacultyPhd.model.js';

// Initialize models
const models = {
  User: User(sequelize),
  Role: Role(sequelize),
  Department: Department(sequelize),
  Subject: Subject(sequelize),
  PeriodConfig: PeriodConfig(sequelize),
  Class: ClassModel(sequelize),
  Timetable: Timetable(sequelize),
  TimetableSlot: TimetableSlot(sequelize),
  TimetableAlteration: TimetableAlteration(sequelize),
  Faculty: Faculty(sequelize),
  Student: Student(sequelize),
  Leave: Leave(sequelize),
  LeaveBalance: LeaveBalance(sequelize),
  Attendance: Attendance(sequelize),
  FacultyAttendance: FacultyAttendance(sequelize),
  AttendanceStudent: AttendanceStudent(sequelize),
  Announcement: Announcement(sequelize),
  YearBreakTiming: YearBreakTiming(sequelize),
  TimetableSlotAssignment: TimetableSlotAssignment(sequelize),
  TimetableNotification: TimetableNotification(sequelize),
  FacultySubjectAssignment: FacultySubjectAssignment(sequelize),
  SubjectClassMapping: SubjectClassMapping(sequelize),
  FacultyEduQualification: FacultyEduQualification(sequelize),
  FacultyExperience: FacultyExperience(sequelize),
  FacultyIndustryExperience: FacultyIndustryExperience(sequelize),
  FacultyPhd: FacultyPhd(sequelize),
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const initModels = () => ({...models, sequelize});

export default initModels;
export { models, sequelize };