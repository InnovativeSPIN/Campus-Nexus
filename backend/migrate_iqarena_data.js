import fs from 'fs';
import mysql from 'mysql2/promise';

const sqlFile = 'db_backup/iqarena.sql';
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Extract INSERT statements for users table
const lines = sqlContent.split('\n');
let inUsersInsert = false;
let usersInsertData = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith('INSERT INTO `users`')) {
    inUsersInsert = true;
    usersInsertData += line + '\n';
  } else if (inUsersInsert) {
    usersInsertData += line + '\n';
    if (line.endsWith(';')) {
      break; // End of INSERT statement
    }
  }
}

if (!usersInsertData) {
  console.error('Could not find users INSERT statement');
  process.exit(1);
}

// Extract values from the INSERT statement
const valueMatches = usersInsertData.match(/\(([^)]+)\)/g);

if (!valueMatches) {
  console.error('Could not parse user values');
  process.exit(1);
}

const users = [];
for (const match of valueMatches) {
  const values = match.slice(1, -1).split(', ');
  const user = {
    id: parseInt(values[0].replace(/'/g, '')),
    roll_no: values[1].replace(/'/g, ''),
    name: values[2].replace(/'/g, ''),
    email: values[3] === 'NULL' ? null : values[3].replace(/'/g, ''),
    password: values[4] === 'NULL' ? null : values[4].replace(/'/g, ''),
    year: parseInt(values[5]),
    role_id: parseInt(values[6]),
    department_id: parseInt(values[7]),
    created_at: values[8].replace(/'/g, ''),
    updated_at: values[9].replace(/'/g, '')
  };
  users.push(user);
}

console.log(`Extracted ${users.length} users from iqarena.sql`);

// Separate faculty and students
const faculty = users.filter(u => u.role_id === 2);
const students = users.filter(u => u.role_id === 1);

console.log(`Faculty: ${faculty.length}, Students: ${students.length}`);

// Connect to Eduvertex database
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'eduvertex'
});

try {
  // Process faculty data
  const facultyInserts = [];
  for (const f of faculty) {
    // Generate email if null
    let email = f.email;
    if (!email) {
      // Use faculty code as primary identifier for unique email
      const facultyCode = f.roll_no.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      email = `${facultyCode}@eduvertex.com`;
    }

    facultyInserts.push([
      f.roll_no, // faculty_college_code
      f.name, // Name
      email, // email
      f.password || '$2a$10$defaultFacultyPasswordHash', // password
      f.department_id, // department_id
      'active' // status
    ]);
  }

  // Process student data
  const studentInserts = [];
  const seenStudentIds = new Set();
  for (const s of students) {
    // Skip duplicates
    if (seenStudentIds.has(s.roll_no)) {
      continue;
    }
    seenStudentIds.add(s.roll_no);

    // Split name into first and last
    const nameParts = s.name.split(' ');
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate email if null
    let email = s.email;
    if (!email) {
      email = `${s.roll_no.toLowerCase()}@eduvertex.com`;
    }

    // Map year to semester (year 1 = semester 2, year 2 = semester 4, etc.)
    const semester = Math.min(s.year * 2, 8); // Cap at 8 semesters

    // Generate batch based on roll number pattern
    let batch = '2021-2025'; // Default
    if (s.roll_no.startsWith('921')) {
      // Extract year from roll number if possible
      const yearMatch = s.roll_no.match(/921(\d{2})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 21 && year <= 25) {
          batch = `20${year}-20${year + 4}`;
        }
      }
    }

    studentInserts.push([
      3, // role_id (student role in Eduvertex)
      s.roll_no, // studentId
      s.roll_no, // rollNumber
      firstName, // firstName
      lastName, // lastName
      email, // email
      '9876543210', // phone (default)
      'male', // gender (default)
      s.department_id, // departmentId
      batch, // batch
      semester, // semester
      s.year, // year
      'A', // section
      'regular', // admissionType
      'paid', // feeStatus
      'active', // status
      s.password || '$2a$10$defaultStudentPasswordHash' // password
    ]);
  }

  // Insert faculty data
  if (facultyInserts.length > 0) {
    console.log(`Inserting ${facultyInserts.length} faculty records...`);
    try {
      const facultySql = `INSERT INTO faculty_profiles (faculty_college_code, Name, email, password, department_id, status) VALUES ?`;
      await connection.query(facultySql, [facultyInserts]);
      console.log('Faculty data inserted successfully!');
    } catch (error) {
      console.error('Error inserting faculty data:', error.message);
    }
  }

  // Insert student data
  if (studentInserts.length > 0) {
    console.log(`Inserting ${studentInserts.length} student records...`);
    try {
      const studentSql = `INSERT INTO student_profile (role_id, studentId, rollNumber, firstName, lastName, email, phone, gender, departmentId, batch, semester, year, section, admissionType, feeStatus, status, password) VALUES ?`;
      await connection.query(studentSql, [studentInserts]);
      console.log('Student data inserted successfully!');
    } catch (error) {
      console.error('Error inserting student data:', error.message);
    }
  }

  console.log('Data migration from iqarena to Eduvertex completed!');

} catch (error) {
  console.error('Error during migration:', error);
} finally {
  await connection.end();
}