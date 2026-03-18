import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'eduvertex',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  { host: process.env.MYSQL_HOST || 'localhost', dialect: 'mysql', logging: false }
);

async function fixLeaveTable() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Step 1: check what columns exist
    const [cols] = await sequelize.query("SHOW COLUMNS FROM student_leaves");
    const existingCols = cols.map(c => c.Field);
    console.log('Existing columns:', existingCols);

    const migrations = [];

    // submitted_to
    if (!existingCols.includes('submitted_to')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN submitted_to ENUM('Class Incharge','Faculty Advisor','HOD') NOT NULL DEFAULT 'Class Incharge'`);
    } else {
      // make sure ENUM values are correct
      migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN submitted_to ENUM('Class Incharge','Faculty Advisor','HOD') NOT NULL DEFAULT 'Class Incharge'`);
    }

    if (!existingCols.includes('overall_status')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN overall_status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending'`);
    } else {
      migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN overall_status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending'`);
    }

    if (!existingCols.includes('class_incharge_approval_status')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN class_incharge_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`);
    } else {
      migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN class_incharge_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`);
    }

    if (!existingCols.includes('class_incharge_id')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN class_incharge_id INT NULL DEFAULT NULL`);
    }

    if (!existingCols.includes('class_incharge_remarks')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN class_incharge_remarks TEXT NULL`);
    }

    if (!existingCols.includes('class_incharge_approval_date')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN class_incharge_approval_date DATETIME NULL`);
    }

    if (!existingCols.includes('department_admin_approval_status')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN department_admin_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`);
    } else {
      migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN department_admin_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`);
    }

    if (!existingCols.includes('department_admin_id')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN department_admin_id INT NULL DEFAULT NULL`);
    }

    if (!existingCols.includes('department_admin_remarks')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN department_admin_remarks TEXT NULL`);
    }

    if (!existingCols.includes('department_admin_approval_date')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN department_admin_approval_date DATETIME NULL`);
    }

    if (!existingCols.includes('leaveSubType')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN leaveSubType VARCHAR(100) NULL`);
    }

    if (!existingCols.includes('attachment')) {
      migrations.push(`ALTER TABLE student_leaves ADD COLUMN attachment VARCHAR(255) NULL`);
    }

    // Fix leaveType ENUM to include all needed values
    migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN leaveType ENUM('Medical','Casual','On-Duty','Special','Other','Leave','Personal','Earned') NOT NULL DEFAULT 'Casual'`);

    // Fix classId to allow null
    migrations.push(`ALTER TABLE student_leaves MODIFY COLUMN classId INT NULL DEFAULT NULL`);

    console.log(`Running ${migrations.length} migrations...`);
    for (const sql of migrations) {
      try {
        await sequelize.query(sql);
        console.log('✅ OK:', sql.substring(0, 80));
      } catch (e) {
        console.warn('⚠️  SKIP (might already exist):', e.message.substring(0, 100));
      }
    }

    // Final check
    const [finalCols] = await sequelize.query("SHOW COLUMNS FROM student_leaves");
    console.log('\n✅ FINAL table columns:', finalCols.map(c => c.Field));
    process.exit(0);
  } catch (e) {
    console.error('FATAL:', e.message);
    process.exit(1);
  }
}

fixLeaveTable();
