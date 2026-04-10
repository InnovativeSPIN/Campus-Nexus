const fs = require('fs');
const file = 'l:/GITS/ERP/Campus-Nexus_back_up_1.4/Campus-Nexus/frontend/src/pages/faculty/pages/Communication.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> Stashed changes[ \t]*(?:\r?\n)?/g;

let count = 0;
content = content.replace(regex, (match, p1) => {
    count++;
    return p1;
});

console.log('Replaced ' + count + ' markers');
fs.writeFileSync(file, content, 'utf8');
