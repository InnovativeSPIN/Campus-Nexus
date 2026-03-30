import { sequelize } from './config/db.js';
import initModels from './models/index.js';

const syncEverything = async () => {
    const { StudentMarks, StudentInternalMark, Subject, Student } = initModels();

    try {
        const deptId = 6;
        const studentIds = [3975, 3967, 3971, 3972, 3991];
        const academicYears = {
            1: '2023-2024', 2: '2023-2024',
            3: '2024-2025', 4: '2024-2025',
            5: '2025-2026', 6: '2025-2026'
        };

        const subjectsTemplate = {
            1: [
                { code: 'MA3151', name: 'Matrices and Calculus', credits: 4 },
                { code: 'PH3151', name: 'Engineering Physics', credits: 3 },
                { code: 'CY3151', name: 'Engineering Chemistry', credits: 3 },
                { code: 'GE3151', name: 'Python Programming', credits: 3 },
                { code: 'GE3152', name: 'Tamil Communication', credits: 1 },
                { code: 'GE3171', name: 'Professional English', credits: 2 }
            ],
            2: [
                { code: 'MA3251', name: 'Numerical Methods', credits: 4 },
                { code: 'PH3256', name: 'Physics for Info Science', credits: 3 },
                { code: 'BE3251', name: 'Basic Electrical Engg', credits: 2 },
                { code: 'GE3251', name: 'Engineering Graphics', credits: 4 },
                { code: 'CS3251', name: 'Programming in C', credits: 3 },
                { code: 'GE3271', name: 'Engineering Practices', credits: 2 }
            ],
            3: [
                { code: 'CS3351', name: 'Computer Organization', credits: 4 },
                { code: 'CS3352', name: 'Data Science Foundations', credits: 3 },
                { code: 'CS3301', name: 'Data Structures', credits: 3 },
                { code: 'CS3353', name: 'OOP Concepts', credits: 3 },
                { code: 'MA3351', name: 'Discrete Math', credits: 4 },
                { code: 'CS3361', name: 'DS Laboratory', credits: 1 }
            ],
            4: [
                { code: 'CS3451', name: 'Theory of Computation', credits: 3 },
                { code: 'CS3452', name: 'Operating Systems', credits: 3 },
                { code: 'CS3401', name: 'Design and Analysis of Algorithms', credits: 4 },
                { code: 'CS3491', name: 'Artificial Intelligence', credits: 4 },
                { code: 'MA3451', name: 'Probability & Statistics', credits: 4 },
                { code: 'CS3461', name: 'OS Laboratory', credits: 1 }
            ],
            5: [
                { code: 'AD3501', name: 'Deep Learning', credits: 4 },
                { code: 'CW3551', name: 'Data Analytics', credits: 3 },
                { code: 'CS3591', name: 'Computer Networks', credits: 3 },
                { code: 'AD3502', name: 'Ethics of AI', credits: 2 },
                { code: 'MG3591', name: 'Project Management', credits: 3 },
                { code: 'AD3511', name: 'AI & Data Analytics Lab', credits: 1 }
            ]
        };

        console.log('Synchronizing subjects with VARIANT CREDITS (1, 2, 3, 4)...');

        for (let sem = 1; sem <= 5; sem++) {
            const templates = subjectsTemplate[sem];
            for (const t of templates) {
                const [sub, created] = await Subject.findOrCreate({
                    where: { subject_code: t.code, department_id: deptId },
                    defaults: {
                        subject_name: t.name,
                        semester: sem,
                        credits: t.credits,
                        status: 'active'
                    }
                });
                if (!created) {
                    await sub.update({ credits: t.credits, subject_name: t.name, semester: sem });
                }
            }
        }

        for (const sid of studentIds) {
            console.log(`Processing student ID: ${sid}`);

            await StudentMarks.destroy({ where: { studentId: sid, semester: [1, 2, 3, 4, 5] } });
            await StudentInternalMark.destroy({ where: { studentId: sid, semester: [1, 2, 3, 4, 5] } });

            for (let sem = 1; sem <= 5; sem++) {
                const yearStr = academicYears[sem];
                const semesterSubjects = await Subject.findAll({ where: { department_id: deptId, semester: sem } });

                for (const sub of semesterSubjects) {
                    const rand = Math.random();
                    let baseTotal;
                    if (rand > 0.9) baseTotal = 85 + Math.random() * 10;
                    else if (rand > 0.6) baseTotal = 75 + Math.random() * 10;
                    else if (rand > 0.2) baseTotal = 60 + Math.random() * 15;
                    else baseTotal = 50 + Math.random() * 10;

                    let grade = 'B';
                    let gp = 7;
                    if (baseTotal >= 90) { grade = 'A+'; gp = 10; }
                    else if (baseTotal >= 80) { grade = 'A'; gp = 9; }
                    else if (baseTotal >= 70) { grade = 'B+'; gp = 8; }
                    else if (baseTotal >= 60) { grade = 'B'; gp = 7; }
                    else { grade = 'C'; gp = 6; }

                    await StudentMarks.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalMarks: (baseTotal * 0.4).toFixed(2),
                        externalMarks: (baseTotal * 0.6).toFixed(2),
                        totalMarks: baseTotal.toFixed(2),
                        grade: grade,
                        gradePoints: gp,
                        credits: sub.credits,
                        status: 'pass'
                    });

                    const i1_total = Math.max(0, baseTotal - 10 + Math.random() * 20);
                    await StudentInternalMark.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalNumber: 1,
                        internalScore: (i1_total * 0.6).toFixed(2),
                        assessmentScore: (i1_total * 0.4).toFixed(2),
                        totalScore: i1_total.toFixed(2)
                    });

                    const i2_total = Math.max(0, baseTotal - 8 + Math.random() * 16);
                    await StudentInternalMark.create({
                        studentId: sid,
                        subjectId: sub.id,
                        semester: sem,
                        academicYear: yearStr,
                        internalNumber: 2,
                        internalScore: (i2_total * 0.6).toFixed(2),
                        assessmentScore: (i2_total * 0.4).toFixed(2),
                        totalScore: i2_total.toFixed(2)
                    });
                }
            }
        }

        console.log('Credit-aware sync complete!');
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
};

syncEverything();
