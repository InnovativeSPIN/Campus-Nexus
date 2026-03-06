import { sequelize, models } from './backend/models/index.js';
const { Student, Class, StudentLeave } = models;

const syncClassIds = async () => {
    try {
        console.log('Starting Class ID sync for Students and StudentLeaves...');

        // 1. Fetch all classes to create a map
        const classes = await Class.findAll({ raw: true });
        const classMap = {};
        classes.forEach(c => {
            const key = `${c.department_id}-${c.batch}-${c.semester}-${c.section || ''}`;
            classMap[key] = c.id;
        });

        // 2. Sync Students
        const students = await Student.findAll();
        let studentCount = 0;
        for (const student of students) {
            const key = `${student.departmentId}-${student.batch}-${student.semester}-${student.section || ''}`;
            const classId = classMap[key];
            if (classId && student.classId !== classId) {
                await student.update({ classId });
                studentCount++;
            }
        }
        console.log(`Updated ${studentCount} students with correct classId.`);

        // 3. Sync StudentLeaves
        const leaves = await StudentLeave.findAll();
        let leaveCount = 0;
        for (const leave of leaves) {
            if (!leave.classId) {
                const student = await Student.findByPk(leave.studentId);
                if (student && student.classId) {
                    await leave.update({ classId: student.classId });
                    leaveCount++;
                }
            }
        }
        console.log(`Updated ${leaveCount} student leaves with correct classId.`);

        console.log('Sync completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error during sync:', error);
        process.exit(1);
    }
};

syncClassIds();
