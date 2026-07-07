import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MentorAllocation = sequelize.define('MentorAllocation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'faculty_profiles',
        key: 'faculty_id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student_profile',
        key: 'id'
      }
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'mentor_allocations',
    timestamps: false
  });

  return MentorAllocation;
};
