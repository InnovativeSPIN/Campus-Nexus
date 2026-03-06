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
import TimetableMaster from './TimetableMaster.model.js';
import TimetableDetails from './TimetableDetails.model.js';
import FacultyLeaveSchedule from './FacultyLeaveSchedule.model.js';
import TimetableStaffAlteration from './TimetableStaffAlteration.model.js';
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
import FacultyEvents from './FacultyEvents.model.js';
import FacultyResearch from './FacultyResearch.model.js';
import StudentMarks from './StudentMarks.model.js';
import StudentInternalMark from './StudentInternalMark.model.js';
import StudentProject from './StudentProject.model.js';
import StudentCertification from './StudentCertification.model.js';
import StudentSport from './StudentSport.model.js';
import StudentEvent from './StudentEvent.model.js';
import StudentNotification from './StudentNotification.model.js';
import StudentBio from './StudentBio.model.js';
import TimetableSimple from './TimetableSimple.model.js';
import Room from './Room.model.js';
import Lab from './Lab.model.js';
import TimetablePeriod from './TimetablePeriod.model.js';
import StudentLeave from './StudentLeave.model.js';
import ClassIncharge from './ClassIncharge.model.js';
import LeaveNotification from './LeaveNotification.model.js';

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
  TimetableMaster: TimetableMaster(sequelize),
  TimetableDetails: TimetableDetails(sequelize),
  FacultyLeaveSchedule: FacultyLeaveSchedule(sequelize),
  TimetableStaffAlteration: TimetableStaffAlteration(sequelize),
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
  FacultyEvents: FacultyEvents(sequelize),
  FacultyResearch: FacultyResearch(sequelize),
  StudentMarks: StudentMarks(sequelize),
  StudentInternalMark: StudentInternalMark(sequelize),
  StudentProject: StudentProject(sequelize),
  StudentCertification: StudentCertification(sequelize),
  StudentSport: StudentSport(sequelize),
  StudentEvent: StudentEvent(sequelize),
  StudentNotification: StudentNotification(sequelize),
  StudentBio: StudentBio(sequelize),
  TimetableSimple: TimetableSimple(sequelize),
  Room: Room(sequelize),
  Lab: Lab(sequelize),
  TimetablePeriod: TimetablePeriod(sequelize),
  StudentLeave: StudentLeave(sequelize),
  ClassIncharge: ClassIncharge(sequelize),
  LeaveNotification: LeaveNotification(sequelize),
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const initModels = () => ({ ...models, sequelize });

export default initModels;
export { models, sequelize };