import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class, Student, ClassIncharge, Faculty } = models;

const fixMapping = async () => {
    try {
        // 1. Create II Year AIDS class
        console.log('Creating II Year AIDS class...');
        const newClass = await Class.create({
            name: 'II Year AIDS',
            section: 'A',
            room: '8', // arbitrary
            department_id: 6,
            semester: 4,
            batch: '2024-2028',
            capacity: 60,
            status: 'active'
        });
        console.log(`Class created with ID: ${newClass.id}`);

        // 2. Assign 2nd year students to this class
        console.log('Assigning 2nd year students to new class...');
        const updatedCount = await Student.update(
            { classId: newClass.id },
            {
                where: {
                    departmentId: 6,
                    semester: 4,
                    batch: '2024-2028'
                }
            }
        );
        console.log(`Updated ${updatedCount[0]} students.`);

        // 3. Update Class Incharge Mapping for Nagajothi P
        // Faculty ID for Nagajothi P is 406
        console.log('Updating Class Incharge mapping for Nagajothi P (ID: 406)...');

        // Find if they have an active in-charge record already (which was for class 21)
        const incharge = await ClassIncharge.findOne({
            where: { faculty_id: 406, status: 'active' }
        });

        if (incharge) {
            console.log(`Updating existing incharge record (ID: ${incharge.id}) from class ${incharge.class_id} to ${newClass.id}`);
            await incharge.update({ class_id: newClass.id });
        } else {
            console.log('Creating new incharge record for faculty 406...');
            await ClassIncharge.create({
                class_id: newClass.id,
                faculty_id: 406,
                academic_year: '2024-25',
                status: 'active',
                assigned_by: 2 // admin
            });
        }

        // Also update the flag on Faculty table (if used by any old logic)
        await Faculty.update(
            {
                is_class_incharge: true,
                class_incharge_class_id: newClass.id
            },
            { where: { faculty_id: 406 } }
        );

        console.log('Mapping fixed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error during mapping fix:', err);
        process.exit(1);
    }
};

fixMapping();
