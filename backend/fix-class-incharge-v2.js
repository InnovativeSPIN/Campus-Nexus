/**
 * Quick Fix: Assign Faculty 6 as Class Incharge
 * Discovers correct table names and fixes assignment
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixClassIncharge() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  CLASS INCHARGE ASSIGNMENT FIX         ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`Connecting to: ${process.env.MYSQL_HOST || '127.0.0.1'} (DB: ${process.env.MYSQL_DATABASE})\n`);
    
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'eduvertex',
        port: process.env.MYSQL_PORT || 3306
    });
    
    try {
        // Discover table names
        console.log('0️⃣  Discovering database tables...');
        const [tables] = await conn.execute('SHOW TABLES');
        const tableList = tables.map(t => t[Object.keys(t)[0]]);
        console.log(`   Found ${tableList.length} tables\n`);
        
        const facultyTable = tableList.find(t => t.toLowerCase() === 'faculty');
        const inchargeTable = tableList.find(t => t.toLowerCase() === 'classincharge');
        const classTable = tableList.find(t => t.toLowerCase() === 'class');
        
        console.log(`Using: ${facultyTable}, ${inchargeTable}, ${classTable}\n`);
        
        // Check Faculty 6
        console.log('1️⃣  Checking Faculty 6 Details...');
        const [fac] = await conn.execute(`SELECT faculty_id, Name, department_id, is_class_incharge FROM ${facultyTable} WHERE faculty_id = 6`);
        
        if (!fac || fac.length === 0) {
            console.log('   ❌ Faculty ID 6 NOT FOUND!\n');
            return;
        }
        
        const faculty = fac[0];
        console.log(`   ✅ ${faculty.Name} (Dept: ${faculty.department_id})`);
        console.log(`   is_class_incharge: ${faculty.is_class_incharge}\n`);
        
        // Check ClassIncharge assignments
        console.log('2️⃣  Checking ClassIncharge Assignments...');
        const [ci] = await conn.execute(`SELECT id, class_id, status FROM ${inchargeTable} WHERE faculty_id = 6`);
        
        if (ci && ci.length > 0) {
            console.log(`   ✅ Found ${ci.length} assignment(s)\n`);
        } else {
            console.log('   ❌ No assignments found. Creating one...\n');
            
            // Find a class to assign
            console.log('3️⃣  Finding a class in department ' + faculty.department_id + '...');
            const [classes] = await conn.execute(`SELECT id, name FROM ${classTable} WHERE department_id = ? LIMIT 1`, [faculty.department_id]);
            
            if (classes && classes.length > 0) {
                const cls = classes[0];
                console.log(`   ✅ Found class: ${cls.name}\n`);
                
                // Create assignment
                console.log('4️⃣  Creating ClassIncharge assignment...');
                try {
                    await conn.execute(
                        `INSERT INTO ${inchargeTable} (faculty_id, class_id, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
                        [6, cls.id, 'active']
                    );
                    console.log(`   ✅ Assignment created!\n`);
                } catch (e) {
                    if (e.code === 'ER_DUP_ENTRY') {
                        console.log('   ℹ️  Already exists\n');
                    } else {
                        throw e;
                    }
                }
            } else {
                console.log('   ❌ No classes found in department!\n');
                return;
            }
        }
        
        // Update flag
        console.log('5️⃣  Updating is_class_incharge flag...');
        await conn.execute(`UPDATE ${facultyTable} SET is_class_incharge = 1 WHERE faculty_id = 6`);
        console.log('   ✅ Flag set to 1\n');
        
        // Verify
        console.log('6️⃣  Verifying...');
        const [result] = await conn.execute(`SELECT is_class_incharge FROM ${facultyTable} WHERE faculty_id = 6`);
        console.log(`   ✅ is_class_incharge = ${result[0].is_class_incharge}\n`);
        
        console.log('╔════════════════════════════════════════╗');
        console.log('║  ✅ FIXED - REFRESH BROWSER            ║');
        console.log('╚════════════════════════════════════════╝\n');
        
    } catch (err) {
        console.error('❌ ERROR:', err.message, '\n');
    } finally {
        await conn.end();
    }
}

fixClassIncharge().catch(console.error);
