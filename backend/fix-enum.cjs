const fs = require('fs');
const path = 'c:/Users/thanu/Documents/Projects/camp/Campus-Nexus/backend/controllers/faculty/alterationPlan.controller.js';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/type: 'leave_approved',/g, "type: 'approved',");
c = c.replace(/type: 'leave_rejected',/g, "type: 'rejected',");
c = c.replace(/type: 'leave_approval_requested',/g, "type: 'submitted',");

fs.writeFileSync(path, c);
console.log("Replaced successfully!");
