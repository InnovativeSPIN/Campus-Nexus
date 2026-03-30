import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class, Student, ClassIncharge, Faculty, StudentLeave } = models;

const fixToThirdYear = async () => {
    try {
        const FACULTY_ID = 406; // Nagajothi P
        const THIRD_YEAR_CLASS_ID = 21;

        console.log('Fixing mapping to III Year AIDS...');

        // 1. Update Class 21 details to match current semester 6
        await Class.update(
            { semester: 6, name: 'III Year AIDS' },
            { where: { id: THIRD_YEAR_CLASS_ID } }
        );
        console.log('Updated Class 21 to Semester 6.');

        // 2. Assign Nagajothi P back to Class 21
        await ClassIncharge.update(
            { class_id: THIRD_YEAR_CLASS_ID },
            { where: { faculty_id: FACULTY_ID, status: 'active' } }
        );
        console.log('Mapped Nagajothi P back to Class 21.');

        await Faculty.update(
            { class_in_charge_class_id: THIRD_YEAR_CLASS_ID, is_class_in_charge: true },
            { where: { faculty_id: FACULTY_ID } }
        );

        // 3. Assign all 3rd year AIDS students (batch 2023-2027) to Class 21
        const [studentCount] = await Student.update(
            { classId: THIRD_YEAR_CLASS_ID },
            {
                where: {
                    departmentId: 6,
                    batch: ['2023-2027', '2023-27']
                }
            }
        );
        console.log(`Updated ${studentCount} students (Batch 2023-2027) to Class 21.`);

        // 4. Sync Leave Requests for these students
        const students = await Student.findAll({
            where: { classId: THIRD_YEAR_CLASS_ID },
            attributes: ['id'],
            raw: true
        });
        const studentIds = students.map(s => s.id);

        if (studentIds.length > 0) {
            const [leaveCount] = await StudentLeave.update(
                { classId: THIRD_YEAR_CLASS_ID },
                { where: { studentId: studentIds } }
            );
            console.log(`Updated ${leaveCount} leave records to Class 21.`);
        }

        // 5. Cleanup Class 22 (the wrong one I created)
        // Check if anyone is still using it
        const studentsIn22 = await Student.count({ where: { classId: 22 } });
        if (studentsIn22 === 0) {
            console.log('No students in Class 22 anymore. Cleaning up...');
            // We might want to keep it just in case, but let's at least unmap the incharge
        }

        console.log('Final mapping verification...');
        const check = await ClassIncharge.findOne({
            where: { faculty_id: FACULTY_ID, status: 'active' },
            include: [{ model: Class, as: 'class' }]
        });
        console.log(`Faculty 406 is now In-charge for: ${check.class.name} (ID: ${check.class_id})`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixToThirdYear();
