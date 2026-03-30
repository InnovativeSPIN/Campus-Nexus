const fs = require('fs');
const files = [
    'studentExtracurricular.controller.js',
    'studentProject.controller.js',
    'studentCertification.controller.js'
];
for (let file of files) {
    let p = 'c:/Users/Acer/Documents/Eduvertex-1/backend/controllers/student/' + file;
    if (!fs.existsSync(p)) continue;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/model: User, as: 'approvedBy', attributes: \['name'\]/g, "model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']]");
    fs.writeFileSync(p, text);
    console.log('Fixed ' + file);
}
