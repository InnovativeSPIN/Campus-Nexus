import { sequelize } from './config/db.js';
import initModels from './models/index.js';

const seedData = async () => {
    const { AttendanceStudent, StudentMarks, Subject, Faculty, Student } = initModels();

    try {
        const studentIds = [3975, 3336, 3337, 3338, 3339, 3340];
        const academicYear = '2025-2026';
        const deptId = 6;

        const faculty = await Faculty.findOne();
        if (!faculty) throw new Error('No faculty found');
        const facultyId = faculty.faculty_id;

        const subjects = await Subject.findAll({ where: { department_id: deptId }, limit: 5 });
        if (subjects.length === 0) throw new Error('No subjects found');

        console.log(`Adding dummy attendance and marks for students: ${studentIds.join(', ')}`);

        for (const sid of studentIds) {
            const student = await Student.findByPk(sid);
            if (!student) continue;

            const semester = student.semester || 6;

            // Clear existing attendance to avoid duplicates
            await AttendanceStudent.destroy({ where: { student_id: sid } });

            // Add Attendance
            for (const sub of subjects) {
                for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
                    const date = new Date();
                    date.setDate(date.getDate() - dayOffset);

                    await AttendanceStudent.create({
                        student_id: sid,
                        subject_id: sub.id,
                        class_section_id: 1,
                        faculty_id: facultyId,
                        class_date: date,
                        period_session_number: (dayOffset % 7) + 1, // Deterministic to avoid random collisions if any
                        attendance_status: (dayOffset % 5 === 0) ? 'Absent' : 'Present'
                    });
                }
            }

            // Add Marks
            for (const sub of subjects) {
                await StudentMarks.destroy({
                    where: { studentId: sid, subjectId: sub.id, semester: semester }
                });

                const total = 70 + Math.random() * 25;
                const internal = total * 0.4;
                const external = total * 0.6;

                let grade = 'B+';
                if (total > 90) grade = 'A+';
                else if (total > 85) grade = 'A';

                await StudentMarks.create({
                    studentId: sid,
                    subjectId: sub.id,
                    semester: semester,
                    academicYear: academicYear,
                    internalMarks: internal,
                    externalMarks: external,
                    totalMarks: total,
                    grade: grade,
                    gradePoints: 8.0 + Math.random(),
                    credits: 4,
                    status: 'pass'
                });
            }
            console.log(`Data added for ${student.firstName} ${student.lastName} (ID: ${sid})`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
