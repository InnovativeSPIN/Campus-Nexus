import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class, Student, ClassIncharge, Faculty } = models;

const fixMapping = async () => {
    try {
        // 1. Find max ID in classes table
        const classes = await Class.findAll({
            order: [['id', 'DESC']],
            limit: 1,
            raw: true
        });
        const nextId = (classes.length > 0 ? (classes[0].id + 1) : 1);
        console.log(`Next available Class ID: ${nextId}`);

        // 2. Create II Year AIDS class manually with ID
        console.log('Creating II Year AIDS class...');
        const newClass = await Class.create({
            id: nextId,
            name: 'II Year AIDS',
            section: 'A',
            room: '8',
            department_id: 6,
            semester: 4,
            batch: '2024-2028',
            capacity: 60,
            status: 'active'
        });
        console.log(`Class created with ID: ${newClass.id}`);

        // 3. Assign 2nd year students to this class
        console.log('Assigning 2nd year students to new class...');
        const updatedCount = await Student.update(
            { classId: nextId },
            {
                where: {
                    departmentId: 6,
                    semester: 4,
                    batch: '2024-2028'
                }
            }
        );
        console.log(`Updated ${updatedCount[0]} students.`);

        // 4. Update Class Incharge Mapping for Nagajothi P (Faculty ID: 406)
        console.log('Updating Class Incharge mapping for Nagajothi P (ID: 406)...');

        const incharge = await ClassIncharge.findOne({
            where: { faculty_id: 406, status: 'active' }
        });

        if (incharge) {
            console.log(`Updating existing incharge record (ID: ${incharge.id}) from class ${incharge.class_id} to ${nextId}`);
            await incharge.update({ class_id: nextId });
        } else {
            console.log('Creating new incharge record for faculty 406...');
            await ClassIncharge.create({
                class_id: nextId,
                faculty_id: 406,
                academic_year: '2024-25',
                status: 'active',
                assigned_by: 2,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        // Also update Faculty table
        await Faculty.update(
            {
                is_class_incharge: true,
                class_incharge_class_id: nextId
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
