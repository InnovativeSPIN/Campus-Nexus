import { DataTypes } from 'sequelize';

const TimetableAlteration = (sequelize) => {
  const TimetableAlterationModel = sequelize.define('TimetableAlteration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    old_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    new_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    proposed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'timetable_alterations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  TimetableAlterationModel.associate = (models) => {
    TimetableAlterationModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    TimetableAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'old_faculty_id',
      as: 'oldFaculty',
    });
    TimetableAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'new_faculty_id',
      as: 'newFaculty',
    });
    TimetableAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'requested_by',
      as: 'requestedByFaculty',
    });
    TimetableAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'approved_by',
      as: 'approvedByFaculty',
    });
  };

  return TimetableAlterationModel;
};

export default TimetableAlteration;
