import { models } from './models/index.js';

const testAssociation = async () => {
    try {
        console.log("Attempting to query Student with Department include...");
        const student = await models.Student.findOne({
            include: [{
                model: models.Department,
                as: 'department',
                attributes: ['short_name', 'full_name']
            }]
        });
        
        if (student) {
            console.log("SUCCESS: Found student:", student.firstName, "in department:", student.department?.short_name);
        } else {
            console.log("NO STUDENT FOUND");
        }
        process.exit(0);
    } catch (error) {
        console.error("ERROR IN ASSOCIATION QUERY:", error);
        process.exit(1);
    }
};

testAssociation();
