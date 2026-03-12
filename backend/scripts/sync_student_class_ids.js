import dotenv from 'dotenv';
dotenv.config();

import { sequelize, models } from '../models/index.js';
const { Student, Class, StudentLeave } = models;

const syncClassIds = async () => {
    try {
        console.log('Starting Class ID sync for Students and StudentLeaves...');

        // 1. Fetch all classes
        const classes = await Class.findAll({ raw: true });
        console.log(`Found ${classes.length} classes.`);

        // 2. Sync Students
        const students = await Student.findAll();
        console.log(`Analyzing ${students.length} students...`);
        let studentCount = 0;

        for (const student of students) {
            // Finding best match class
            let bestClass = classes.find(c =>
                c.department_id === student.departmentId &&
                c.batch === student.batch &&
                c.semester === student.semester
            );

            if (!bestClass) {
                // Secondary match: ignore batch
                bestClass = classes.find(c =>
                    c.department_id === student.departmentId &&
                    c.semester === student.semester
                );
            }

            if (!bestClass) {
                // Tertiary match: ignore batch and section
                bestClass = classes.find(c =>
                    c.department_id === student.departmentId &&
                    c.semester === student.semester
                );
            }

            if (bestClass && student.classId !== bestClass.id) {
                await student.update({ classId: bestClass.id });
                studentCount++;
            }
        }
        console.log(`Updated ${studentCount} students with correct classId.`);

        // 3. Sync StudentLeaves
        const leaves = await StudentLeave.findAll();
        console.log(`Analyzing ${leaves.length} student leaves...`);
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
