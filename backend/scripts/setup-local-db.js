#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import initModels, { models } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function setup() {
  try {
    console.log('\n🔌 Connecting to local MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL successfully!\n');

    console.log('📦 Initializing models...');
    initModels();
    console.log('✅ Models initialized\n');

    console.log('🔄 Syncing all tables (alter mode)...');
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced!\n');

    console.log('👤 Seeding roles...');
    const roleRows = [
      [1, 'student'], [2, 'super-admin'], [3, 'executiveadmin'],
      [4, 'academicadmin'], [5, 'faculty'], [6, 'department-admin'],
      [7, 'timetable-incharge'], [8, 'exam-cell-admin']
    ];
    for (const [id, name] of roleRows) {
      await sequelize.query(
        `INSERT IGNORE INTO roles (role_id, role_name) VALUES (${id}, '${name}')`
      );
    }
    console.log('✅ Roles seeded\n');

    console.log('👤 Seeding users...');
    const { User } = models;
    if (User) {
      const hashedPassword = await bcrypt.hash('password', 10);
      
      const [, saCreated] = await User.findOrCreate({
        where: { email: 'nscetadmin@nscet.org' },
        defaults: {
          name: 'GOAT',
          email: 'nscetadmin@nscet.org',
          password: hashedPassword,
          role_id: 2,
          phone: '9876543210',
          isActive: true
        }
      });
      console.log(saCreated ? '  ✅ Super Admin created' : '  ℹ️  Super Admin already exists');

      const [, ecaCreated] = await User.findOrCreate({
        where: { email: 'examcell@nscet.org' },
        defaults: {
          name: 'Exam Cell Admin',
          email: 'examcell@nscet.org',
          password: hashedPassword,
          role_id: 8,
          phone: '9876543211',
          isActive: true
        }
      });
      console.log(ecaCreated ? '  ✅ Exam Cell Admin created' : '  ℹ️  Exam Cell Admin already exists');
    }

    console.log('\n🏛️  Seeding departments...');
    const depts = [
      [1, 'CSE', 'Computer Science and Engineering'],
      [2, 'ECE', 'Electronics and Communication Engineering'],
      [3, 'EEE', 'Electrical and Electronics Engineering'],
      [4, 'MECH', 'Mechanical Engineering'],
      [5, 'CIVIL', 'Civil Engineering'],
      [6, 'IT', 'Information Technology'],
      [7, 'AI&DS', 'Artificial Intelligence and Data Science'],
      [8, 'MBA', 'Master of Business Administration'],
      [9, 'S&H', 'Science and Humanities']
    ];
    for (const [id, short_name, full_name] of depts) {
      await sequelize.query(
        `INSERT IGNORE INTO departments (id, short_name, full_name) VALUES (${id}, '${short_name}', '${full_name}')`
      );
    }
    console.log('✅ Departments seeded\n');

    console.log('🎉 DB SETUP COMPLETE!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

setup();
