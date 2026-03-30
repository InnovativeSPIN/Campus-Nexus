/**
 * Quick Fix: Assign Faculty 6 as Class Incharge
 * This script checks the current assignments and fixes the issue
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'eduvertex',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function fixClassIncharge() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  CLASS INCHARGE ASSIGNMENT FIX         ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`Connecting to: ${process.env.MYSQL_HOST || '127.0.0.1'} (DB: ${process.env.MYSQL_DATABASE})\n`);
    
    const conn = await pool.getConnection();
    
    try {
        // First, list all tables to find the correct names
        console.log('0️⃣  Discovering database tables...');
        const [tables] = await conn.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(`   Found ${tableNames.length} tables: ${tableNames.join(', ')}\n`);
        
        // Find Faculty table (might be case-sensitive)
        const facultyTable = tableNames.find(t => t.toLowerCase() === 'faculty');
        const classInchargeTable = tableNames.find(t => t.toLowerCase() === 'classincharge');
        const classTable = tableNames.find(t => t.toLowerCase() === 'class');
        
        if (!facultyTable) {
            console.log(`❌ Faculty table not found! Available tables: ${tableNames.join(', ')}`);
            return;
        }
        
        console.log(`Using tables: Faculty="${facultyTable}", ClassIncharge="${classInchargeTable}", Class="${classTable}"\n`);
        
        if (!fac || fac.length === 0) {
            console.log('   ❌ Faculty ID 6 NOT FOUND in database!');
            return;
        }
        
        const faculty = fac[0];
        console.log(`   ✅ Found: ${faculty.Name}`);
        console.log(`      Department ID: ${faculty.department_id}`);
        console.log(`      is_class_incharge: ${faculty.is_class_incharge}`);
        console.log(`      is_timetable_incharge: ${faculty.is_timetable_incharge}\n`);
        
        // Check ClassIncharge Assignments
        console.log('2️⃣  Checking ClassIncharge Assignments for Faculty 6...');
        const [ci] = await conn.query(
            'SELECT id, class_id, faculty_id, status FROM `ClassIncharge` WHERE faculty_id = 6'
        );
        
        if (ci && ci.length > 0) {
            console.log(`   ✅ Found ${ci.length} ClassIncharge assignment(s):`);
            ci.forEach((assignment, i) => {
                console.log(`      ${i+1}. Class ID: ${assignment.class_id}, Status: ${assignment.status}`);
            });
        } else {
            console.log('   ❌ No ClassIncharge assignments found\n');
            
            // Try to find a class to assign
            console.log('3️⃣  Finding available classes for Assignment...');
            const [classes] = await conn.query(
                `SELECT id, name FROM \`Class\` WHERE department_id = ? LIMIT 3`,
                [faculty.department_id]
            );
            
            if (classes && classes.length > 0) {
                const firstClass = classes[0];
                console.log(`   ✅ Found ${classes.length} class(es) in department ${faculty.department_id}`);
                console.log(`   📌 Will assign Faculty 6 to Class ID: ${firstClass.id} (${firstClass.name})\n`);
                
                // Create ClassIncharge Assignment
                console.log('4️⃣  Creating ClassIncharge Assignment...');
                try {
                    await conn.query(
                        'INSERT INTO `ClassIncharge` (Faculty_id, class_id, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                        [6, firstClass.id, 'active']
                    );
                    console.log(`   ✅ ClassIncharge Assignment Created!\n`);
                } catch (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        console.log('   ℹ️  Assignment already exists (duplicate entry handled)\n');
                    } else {
                        throw err;
                    }
                }
            } else {
                console.log('   ❌ No classes found in this department');
                console.log('   ℹ️  Cannot auto-assign. Please check class data.\n');
                return;
            }
        }
        
        // Update Faculty Flag
        console.log('5️⃣  Updating Faculty is_class_incharge Flag...');
        await conn.query(
            'UPDATE `Faculty` SET is_class_incharge = 1 WHERE faculty_id = 6'
        );
        console.log('   ✅ Flag Updated!\n');
        
        // Verify Final State
        console.log('6️⃣  Verifying Final State...');
        const [verify] = await conn.query(
            'SELECT is_class_incharge FROM `Faculty` WHERE faculty_id = 6'
        );
        console.log(`   ✅ Faculty 6 is_class_incharge: ${verify[0].is_class_incharge}\n`);
        
        console.log('╔════════════════════════════════════════╗');
        console.log('║  ✅ FIX COMPLETE - RELOAD BROWSER      ║');
        console.log('╚════════════════════════════════════════╝\n');
        
    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        conn.release();
        await pool.end();
    }
}

fixClassIncharge().catch(console.error);
