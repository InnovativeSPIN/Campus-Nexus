import dotenv from 'dotenv';
dotenv.config();

import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Connected to local MySQL successfully!');

    initModels();
    console.log('📦 Models initialized');

    const { User, Faculty, Student, Role, Department } = models;

    const hashedPassword = await bcrypt.hash('password', 10);

    // List of roles:
    // 1: student
    // 2: super-admin
    // 3: executiveadmin
    // 4: academicadmin
    // 5: faculty
    // 6: department-admin
    // 7: timetable-incharge
    // 8: exam-cell-admin

    console.log('\n--- 🔑 Seeded Administrator/Staff Users in users table ---');
    // Ensure all admin roles have a test account
    const admins = [
      { name: 'Super Admin', email: 'superadmin@nscet.org', role_id: 2 },
      { name: 'Executive Admin', email: 'executiveadmin@nscet.org', role_id: 3 },
      { name: 'Academic Admin', email: 'academicadmin@nscet.org', role_id: 4 },
      { name: 'Timetable Incharge Admin', email: 'timetableincharge@nscet.org', role_id: 7 },
      { name: 'Exam Cell Admin', email: 'examcell@nscet.org', role_id: 8 }
    ];

    for (const admin of admins) {
      const [record, created] = await User.findOrCreate({
        where: { email: admin.email },
        defaults: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role_id: admin.role_id,
          phone: '9876543210',
          isActive: true
        }
      });
      console.log(`Email: ${record.email} | Pass: password | Role ID: ${record.role_id} (${created ? 'Created' : 'Already exists'})`);
    }

    console.log('\n--- 🏫 Seeded Faculty Profiles (role_id = 5 or 6) ---');
    // Ensure a HOD/Department Admin (role_id 7/6 in faculty_profiles, wait, role_id 7 is department-admin in faculty)
    // Wait, let's create a Department Admin / HOD (role_id 7 in faculty_profiles)
    // and a general Faculty (role_id 5 in faculty_profiles)
    const facultyMembers = [
      {
        faculty_college_code: 'FAC001',
        Name: 'Dr. Mathalai Raj',
        email: 'drmathalai.raj@nscet.org',
        role_id: 7, // HOD / Department Admin
        designation: 'Professor & HOD',
        department_id: 1, // CSE
        status: 'active'
      },
      {
        faculty_college_code: 'FAC002',
        Name: 'Professor Faculty',
        email: 'faculty@nscet.org',
        role_id: 5, // Regular Faculty
        designation: 'Assistant Professor',
        department_id: 1, // CSE
        status: 'active'
      }
    ];

    for (const faculty of facultyMembers) {
      // First ensure the user account exists in users table (since HOD needs it)
      await User.findOrCreate({
        where: { email: faculty.email },
        defaults: {
          name: faculty.Name,
          email: faculty.email,
          password: hashedPassword,
          role_id: faculty.role_id,
          department_id: faculty.department_id,
          isActive: true
        }
      });

      const [record, created] = await Faculty.findOrCreate({
        where: { email: faculty.email },
        defaults: {
          ...faculty,
          password: hashedPassword
        }
      });
      console.log(`Email/College Code: ${record.email} (or ${record.faculty_college_code}) | Pass: password | Role ID: ${record.role_id} (${created ? 'Created' : 'Already exists'})`);
    }

    console.log('\n--- 🎓 Seeded Student Profiles ---');
    const studentData = {
      studentId: '2026CSE001',
      rollNumber: '2026CSE001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'student@nscet.org',
      role_id: 1,
      departmentId: 1,
      phone: '9876543210',
      gender: 'male',
      batch: '2023-2027',
      year: '3',
      semester: 6,
      status: 'active'
    };

    // Ensure student exists in users table first
    await User.findOrCreate({
      where: { email: studentData.email },
      defaults: {
        name: `${studentData.firstName} ${studentData.lastName}`,
        email: studentData.email,
        password: hashedPassword,
        role_id: studentData.role_id,
        department_id: studentData.departmentId,
        isActive: true
      }
    });

    const [record, created] = await Student.findOrCreate({
      where: { email: studentData.email },
      defaults: {
        ...studentData,
        password: hashedPassword
      }
    });
    console.log(`Email/Student ID: ${record.email} (or ${record.studentId}) | Pass: password | Role ID: ${record.role_id} (${created ? 'Created' : 'Already exists'})`);

    console.log('\n🎉 ALL ROLE ACCOUNTS ARE READY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
