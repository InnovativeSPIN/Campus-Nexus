import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTablesSQL = async () => {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'eduvertex'
    });

    console.log('Creating/updating timetable management tables...\n');

    // Create rooms table (already created, skip if exists)
    console.log('1. Checking rooms table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(50) NOT NULL UNIQUE,
        room_name VARCHAR(255) NOT NULL,
        department_id INT NOT NULL,
        room_type ENUM('classroom', 'lab', 'seminar_hall', 'auditorium') DEFAULT 'classroom',
        capacity INT,
        floor_number INT,
        building VARCHAR(100),
        has_projector BOOLEAN DEFAULT FALSE,
        has_ac BOOLEAN DEFAULT FALSE,
        has_smart_board BOOLEAN DEFAULT FALSE,
        equipment_details TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Rooms table ready\n');

    // Create labs table (already created, skip if exists)
    console.log('2. Checking labs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS labs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lab_name VARCHAR(255) NOT NULL,
        lab_code VARCHAR(50) NOT NULL UNIQUE,
        department_id INT NOT NULL,
        room_id INT,
        subject_ids JSON,
        max_batch_size INT DEFAULT 30,
        equipment_details TEXT,
        software_installed TEXT,
        lab_incharge_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Labs table ready\n');

    // Check if timetable_master exists
    console.log('3. Checking timetable_master table...');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'timetable_master'`);
    if (tables.length === 0) {
      console.log('Creating timetable_master table...');
      // Create if doesn't exist
      await connection.query(`
        CREATE TABLE timetable_master (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          academic_year VARCHAR(20) NOT NULL,
          semester ENUM('odd', 'even') NOT NULL,
          department_id INT,
          year ENUM('1st', '2nd', '3rd', '4th'),
          timetable_incharge_id INT,
          status ENUM('draft', 'pending_approval', 'active', 'inactive') DEFAULT 'draft',
          approved_by INT,
          approved_at DATETIME,
          created_by INT NOT NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    }
    console.log('✅ Timetable master table ready\n');

    // Now create timetable_periods table
    console.log('4. Creating timetable_periods table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timetable_periods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timetable_master_id INT NOT NULL,
        day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
        period_number INT NOT NULL COMMENT 'Period number (1-7)',
        start_time TIME,
        end_time TIME,
        is_break BOOLEAN DEFAULT FALSE,
        break_type ENUM('short', 'lunch'),
        faculty_college_code VARCHAR(50),
        subject_code VARCHAR(50),
        year ENUM('1st', '2nd', '3rd', '4th'),
        section VARCHAR(10),
        room_id INT,
        lab_id INT,
        is_lab_session BOOLEAN DEFAULT FALSE,
        session_type ENUM('theory', 'lab', 'tutorial') DEFAULT 'theory',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (timetable_master_id) REFERENCES timetable_master(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Timetable periods table created\n');

    // Update year_break_timings table
    console.log('5. Updating year_break_timings table...');
    try {
      await connection.query(`
        ALTER TABLE year_break_timings 
        ADD COLUMN year_group ENUM('year_1', 'year_2', 'year_3_4') AFTER department_id
      `);
    } catch (err) {
      if (!err.message.includes('Duplicate column')) throw err;
    }
    
    try {
      await connection.query(`
        ALTER TABLE year_break_timings 
        ADD COLUMN break_type ENUM('short', 'lunch') AFTER break_name
      `);
    } catch (err) {
      if (!err.message.includes('Duplicate column')) throw err;
    }
    
    try {
      await connection.query(`
        ALTER TABLE year_break_timings 
        ADD COLUMN break_number INT AFTER year
      `);
    } catch (err) {
      if (!err.message.includes('Duplicate column')) throw err;
    }
    
    try {
      await connection.query(`
        ALTER TABLE year_break_timings 
        ADD COLUMN period_after INT AFTER break_number
      `);
    } catch (err) {
      if (!err.message.includes('Duplicate column')) throw err;
    }
    console.log('✅ Year break timings table updated\n');

    // Update leaves table
    console.log('6. Updating leaves table...');
    const leaveFields = [
      "ADD COLUMN affected_periods JSON AFTER applicantType",
      "ADD COLUMN substitute_faculty_code VARCHAR(50) AFTER affected_periods",
      "ADD COLUMN substitute_status ENUM('pending', 'accepted', 'rejected') AFTER substitute_faculty_code",
      "ADD COLUMN substitute_notified_at DATETIME AFTER substitute_status",
      "ADD COLUMN substitute_response_at DATETIME AFTER substitute_notified_at",
      "ADD COLUMN substitute_remarks TEXT AFTER substitute_response_at",
      "ADD COLUMN admin_approval_status ENUM('pending', 'approved', 'rejected') AFTER substitute_remarks",
      "ADD COLUMN admin_approval_date DATETIME AFTER admin_approval_status",
      "ADD COLUMN timetable_altered BOOLEAN DEFAULT FALSE AFTER admin_approval_date"
    ];

    for (const field of leaveFields) {
      try {
        await connection.query(`ALTER TABLE leaves ${field}`);
      } catch (err) {
        if (!err.message.includes('Duplicate column')) {
          console.log(`⚠️ ${err.message}`);
        }
      }
    }
    console.log('✅ Leaves table updated\n');

    console.log('\n✅ ALL TABLES CREATED/UPDATED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log('  ✓ rooms - Classroom management');
    console.log('  ✓ labs - Lab management');
    console.log('  ✓ timetable_master - Timetable master records');
    console.log('  ✓ timetable_periods - Period-based timetables');
    console.log('  ✓ year_break_timings - Year-wise break configuration');
    console.log(' ✓ leaves - Leave substitution workflow\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

createTablesSQL();
