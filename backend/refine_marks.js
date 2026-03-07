import { sequelize } from './config/db.js';
import initModels from './models/index.js';

const refineMarks = async () => {
    const { StudentMarks, StudentInternalMark, Subject, Faculty, Student } = initModels();

    try {
        const studentIds = [3975, 3967, 3971, 3972, 3991];
        const deptId = 6;

        const academicYears = {
            1: '2023-2024',
            2: '2023-2024',
            3: '2024-2025',
            4: '2024-2025',
            5: '2025-2026',
            6: '2025-2026'
        };

        console.log('Final refinement: Deleting ALL Sem 6 entries (Finals + Internals), and adding historical Internals for Sem 1-5.');

        for (const sid of studentIds) {
            // 1. Remove ANY entries (Finals + Internals) for Semester 6
            await StudentMarks.destroy({ where: { studentId: sid, semester: 6 } });
            await StudentInternalMark.destroy({ where: { studentId: sid, semester: 6 } });

            // 2. Clear and add historical Internal marks for Semesters 1-5
            await StudentInternalMark.destroy({
                where: {
                    studentId: sid,
                    semester: [1, 2, 3, 4, 5]
                }
            });

            for (let sem = 1; sem <= 5; sem++) {
                const yearStr = academicYears[sem];
                const subjects = await Subject.findAll({ where: { department_id: deptId, semester: sem } });

                for (const sub of subjects) {
                    // Internal 1
                    const i1_score = 35 + Math.random() * 20;
                    const i1_ass = 20 + Math.random() * 15;
                    await StudentInternalMark.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalNumber: 1,
                        internalScore: i1_score.toFixed(2),
                        assessmentScore: i1_ass.toFixed(2),
                        totalScore: (i1_score + i1_ass).toFixed(2)
                    });

                    // Internal 2
                    const i2_score = 38 + Math.random() * 18;
                    const i2_ass = 22 + Math.random() * 13;
                    await StudentInternalMark.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalNumber: 2,
                        internalScore: i2_score.toFixed(2),
                        assessmentScore: i2_ass.toFixed(2),
                        totalScore: (i2_score + i2_ass).toFixed(2)
                    });
                }
            }
            console.log(`Updated internals for student ID: ${sid}`);
        }

        console.log('Refining completed!');
        process.exit(0);
    } catch (err) {
        console.error('Refining failed:', err);
        process.exit(1);
    }
};

refineMarks();
