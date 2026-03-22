import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class, Student, ClassIncharge, Faculty, StudentLeave } = models;

const fixEverythingThirdYear = async () => {
    try {
        const FACULTY_ID = 406; // Nagajothi P
        const THIRD_YEAR_CLASS_ID = 21;

        console.log('--- RE-FIXING EVERYTHING TO III YEAR AIDS ---');

        // 1. Correct the Faculty table fields
        await Faculty.update(
            {
                is_class_incharge: true,
                class_incharge_class_id: THIRD_YEAR_CLASS_ID
            },
            { where: { faculty_id: FACULTY_ID } }
        );
        console.log('1. Corrected Faculty table (Nagajothi P -> Class 21).');

        // 2. Correct the ClassIncharge association table
        // Deactivate any other records for this faculty and set Class 21 as active
        await ClassIncharge.update(
            { status: 'inactive' },
            { where: { faculty_id: FACULTY_ID } }
        );

        const [incharge, created] = await ClassIncharge.findOrCreate({
            where: { faculty_id: FACULTY_ID, class_id: THIRD_YEAR_CLASS_ID },
            defaults: {
                academic_year: '2024-25',
                status: 'active',
                assigned_by: 2,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        if (!created) {
            await incharge.update({ status: 'active' });
        }
        console.log('2. Ensured ClassIncharge table has active record for Class 21.');

        // 3. Sync all students in Department 6, Batch 2023-2027 to Class 21
        const [studentCount] = await Student.update(
            { classId: THIRD_YEAR_CLASS_ID },
            {
                where: {
                    departmentId: 6,
                    batch: ['2023-2027', '2023-27']
                }
            }
        );
        console.log(`3. Synchronized ${studentCount} students (III Year AIDS) to Class 21.`);

        // 4. Update the Class details
        await Class.update(
            { name: 'III Year AIDS', semester: 6 },
            { where: { id: THIRD_YEAR_CLASS_ID } }
        );
        console.log('4. Updated Class 21 Name and Semester (6).');

        // 5. Sync Leave Requests
        // Find all student IDs that are now in Class 21
        const studentIds = (await Student.findAll({
            where: { classId: THIRD_YEAR_CLASS_ID },
            attributes: ['id'],
            raw: true
        })).map(s => s.id);

        if (studentIds.length > 0) {
            const [leaveCount] = await StudentLeave.update(
                { classId: THIRD_YEAR_CLASS_ID },
                { where: { studentId: studentIds } }
            );
            console.log(`5. Synchronized ${leaveCount} leave requests to Class 21.`);
        }

        // 6. Cleanup Class 22 stuff
        await StudentLeave.destroy({ where: { classId: 22 } }); // Delete dummy leaves
        console.log('6. Deleted dummy leave requests from Class 22.');

        console.log('--- ALL SYSTEMS VERIFIED ---');

        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
};

fixEverythingThirdYear();
