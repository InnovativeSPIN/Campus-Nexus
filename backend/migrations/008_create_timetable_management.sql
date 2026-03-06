import sequelize from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    // Create Period Configuration table
    await queryInterface.createTable('period_config', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      period_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_break: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      break_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Enhanced Timetable table
    await queryInterface.createTable('timetable_master', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      semester: {
        type: Sequelize.ENUM('odd', 'even'),
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      year: {
        type: Sequelize.ENUM('1st', '2nd', '3rd', '4th'),
        allowNull: true
      },
      timetable_incharge_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending_approval', 'active', 'inactive'),
        defaultValue: 'draft'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Timetable Details table (7 periods per day)
    await queryInterface.createTable('timetable_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      timetable_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      day_of_week: {
        type: Sequelize.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        allowNull: false
      },
      period_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      room_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      period_type: {
        type: Sequelize.ENUM('lecture', 'practical', 'tutorial', 'break', 'lunch'),
        defaultValue: 'lecture'
      },
      is_break: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM('active', 'cancelled', 'pending'),
        defaultValue: 'active'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Faculty Leave Schedule table (for unavailable dates)
    await queryInterface.createTable('faculty_leave_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      leave_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      from_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      to_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Staff Alteration Request table
    await queryInterface.createTable('timetable_staff_alterations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      timetable_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      timetable_detail_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      original_faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      alternative_faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      requested_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      alternative_response: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Year Break Timings table
    await queryInterface.createTable('year_break_timings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      year: {
        type: Sequelize.ENUM('1st', '2nd', '3rd', '4th'),
        allowNull: false
      },
      break_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      break_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indices
    await queryInterface.addIndex('timetable_details', ['timetable_id']);
    await queryInterface.addIndex('timetable_details', ['class_id']);
    await queryInterface.addIndex('timetable_details', ['faculty_id']);
    await queryInterface.addIndex('faculty_leave_schedules', ['faculty_id']);
    await queryInterface.addIndex('timetable_staff_alterations', ['original_faculty_id']);
    await queryInterface.addIndex('timetable_staff_alterations', ['alternative_faculty_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('timetable_staff_alterations');
    await queryInterface.dropTable('faculty_leave_schedules');
    await queryInterface.dropTable('year_break_timings');
    await queryInterface.dropTable('timetable_details');
    await queryInterface.dropTable('timetable_master');
    await queryInterface.dropTable('period_config');
  }
};
