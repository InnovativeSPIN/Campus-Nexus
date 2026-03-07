import { sequelize } from './config/db.js';
import initModels from './models/index.js';

const seedHistory = async () => {
    const { AttendanceStudent, StudentMarks, Subject, Faculty, Student } = initModels();

    try {
        const studentIds = [3975, 3967, 3971, 3972, 3991]; // Logesh + the 4 specified rolls
        const academicYears = {
            1: '2023-2024',
            2: '2023-2024',
            3: '2024-2025',
            4: '2024-2025',
            5: '2025-2026',
            6: '2025-2026'
        };
        const deptId = 6;

        const faculty = await Faculty.findOne();
        if (!faculty) throw new Error('No faculty found');
        const facultyId = faculty.faculty_id;

        const subjects = await Subject.findAll({ where: { department_id: deptId }, limit: 6 });
        if (subjects.length === 0) throw new Error('No subjects found');

        console.log(`Adding historical data (Sem 1-6) for students: ${studentIds.join(', ')}`);

        for (const sid of studentIds) {
            const student = await Student.findByPk(sid);
            if (!student) continue;

            // Clear existing data to be fresh
            await AttendanceStudent.destroy({ where: { student_id: sid } });
            await StudentMarks.destroy({ where: { studentId: sid } });

            // For semesters 1 to 6
            for (let sem = 1; sem <= 6; sem++) {
                const yearStr = academicYears[sem];

                // Add Marks for each semester
                for (const sub of subjects) {
                    const total = 75 + Math.random() * 20; // 75-95 range
                    const internal = total * 0.4;
                    const external = total * 0.6;

                    let grade = 'B+';
                    if (total > 90) grade = 'A+';
                    else if (total > 85) grade = 'A';
                    else if (total > 80) grade = 'A-';

                    await StudentMarks.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalMarks: internal,
                        externalMarks: external,
                        totalMarks: total,
                        grade: grade,
                        gradePoints: 8.0 + (Math.random() * 2),
                        credits: 4,
                        status: 'pass'
                    });
                }

                // Add Attendance for current/recent semesters (e.g. 5 and 6)
                if (sem >= 5) {
                    for (const sub of subjects) {
                        for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
                            const date = new Date();
                            date.setDate(date.getDate() - (dayOffset + (sem === 5 ? 30 : 0)));

                            await AttendanceStudent.create({
                                student_id: sid,
                                subject_id: sub.id,
                                class_section_id: 1,
                                faculty_id: facultyId,
                                class_date: date,
                                period_session_number: (dayOffset % 7) + 1,
                                attendance_status: (dayOffset % 8 === 0) ? 'Absent' : 'Present'
                            });
                        }
                    }
                }
            }
            console.log(`Full history (Sem 1-6) added for ${student.firstName} ${student.lastName} (Roll: ${student.rollNumber})`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedHistory();
