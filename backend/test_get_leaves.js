import { getMyLeaves } from './controllers/student/studentLeave.controller.js';
import { models } from './models/index.js';

// Mocking the request and response objects
const runTest = async () => {
    try {
        console.log("Simulating GET /api/v1/student-leaves...");
        
        // Find a random student to test with
        const student = await models.Student.findOne();
        if (!student) {
            console.error("No student found in DB to test with.");
            process.exit(1);
        }
        
        const req = {
            user: { id: student.id },
            query: {}
        };
        
        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`STATUS: ${code}`);
                    console.log("DATA:", JSON.stringify(data, null, 2));
                }
            })
        };
        
        const next = (err) => {
            if (err) {
                console.error("NEXT ERR:", err);
            }
        };

        await getMyLeaves(req, res, next);
        process.exit(0);
    } catch (error) {
        console.error("CRASHED:", error);
        process.exit(1);
    }
};

runTest();
