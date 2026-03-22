import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;
import { Op } from 'sequelize';

const clarifyClass21 = async () => {
    try {
        console.log('Cleaning up Class 21 to only include III Year AIDS (2023-2027)...');

        // Unmap students who are NOT in the 2023-2027 batch from Class 21
        const [count] = await Student.update(
            { classId: null },
            {
                where: {
                    classId: 21,
                    batch: { [Op.notIn]: ['2023-2027', '2023-27'] }
                }
            }
        );
        console.log(`Unmapped ${count} students (wrong batch) from Class 21.`);

        // Double check Class 21 count
        const finalCount = await Student.count({ where: { classId: 21 } });
        console.log(`Final count of III Year AIDS students in Class 21: ${finalCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clarifyClass21();
