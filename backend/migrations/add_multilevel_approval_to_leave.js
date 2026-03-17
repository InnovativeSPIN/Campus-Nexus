// Migration to add multi-level approval workflow fields to Leave table
export const up = async (queryInterface, DataTypes) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Add new columns for multi-level approval workflow
    const tableDescription = await queryInterface.describeTable('leaves');

    const columnsToAdd = [];

    // Check and add missing columns
    if (!tableDescription.overall_status) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'overall_status',
          {
            type: DataTypes.ENUM(
              'pending',
              'substitute_pending',
              'substitute_approved',
              'substitute_rejected',
              'timetable_pending',
              'timetable_approved',
              'executive_pending',
              'executive_approved',
              'approved',
              'rejected',
              'cancelled'
            ),
            defaultValue: 'pending',
            comment: 'Overall status of leave request through the complete workflow',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.substitute_faculty_id) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'substitute_faculty_id',
          {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Requested substitute faculty ID',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.substitute_approval_status) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'substitute_approval_status',
          {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: true,
            defaultValue: 'pending',
            comment: 'Substitute faculty approval decision',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.substitute_approval_date) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'substitute_approval_date',
          {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when substitute approved or rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.substitute_rejection_reason) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'substitute_rejection_reason',
          {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Reason provided by substitute if rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.timetable_incharge_id) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'timetable_incharge_id',
          {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Timetable incharge faculty ID',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.timetable_incharge_approval_status) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'timetable_incharge_approval_status',
          {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: true,
            defaultValue: 'pending',
            comment: 'Timetable incharge approval decision',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.timetable_incharge_approval_date) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'timetable_incharge_approval_date',
          {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when timetable incharge approved or rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.timetable_incharge_rejection_reason) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'timetable_incharge_rejection_reason',
          {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Reason provided by timetable incharge if rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.executive_admin_id) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'executive_admin_id',
          {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Executive admin faculty ID who approved/rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.executive_admin_approval_status) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'executive_admin_approval_status',
          {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: true,
            comment: 'Executive admin approval (only for leaves > 2 days)',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.executive_admin_approval_date) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'executive_admin_approval_date',
          {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when executive admin approved or rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.executive_admin_rejection_reason) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'executive_admin_rejection_reason',
          {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Reason provided by executive admin if rejected',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.dept_admin_notified) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'dept_admin_notified',
          {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether department admin has been notified of alteration',
          },
          { transaction }
        )
      );
    }

    if (!tableDescription.dept_admin_notified_at) {
      columnsToAdd.push(
        queryInterface.addColumn(
          'leaves',
          'dept_admin_notified_at',
          {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when department admin was notified',
          },
          { transaction }
        )
      );
    }

    // Execute all column additions
    await Promise.all(columnsToAdd);

    // Note: Skipping foreign key constraints due to potential table structure variations
    // Foreign key references to faculties table are maintained at the model level in Sequelize
    console.log('✓ All columns added successfully');
    console.log('Note: Foreign key constraints can be added manually if needed via ALTER TABLE statements');

    await transaction.commit();
    console.log('✅ Migration completed: Added multi-level approval fields to Leave table');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Drop columns in reverse order
    const columnsToRemove = [
      'dept_admin_notified_at',
      'dept_admin_notified',
      'executive_admin_rejection_reason',
      'executive_admin_approval_date',
      'executive_admin_approval_status',
      'executive_admin_id',
      'timetable_incharge_rejection_reason',
      'timetable_incharge_approval_date',
      'timetable_incharge_approval_status',
      'timetable_incharge_id',
      'substitute_rejection_reason',
      'substitute_approval_date',
      'substitute_approval_status',
      'substitute_faculty_id',
      'overall_status',
    ];

    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('leaves', column, { transaction });
      } catch (err) {
        // Column might not exist, continue
      }
    }

    await transaction.commit();
    console.log('✅ Migration rolled back: Removed multi-level approval fields from Leave table');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
