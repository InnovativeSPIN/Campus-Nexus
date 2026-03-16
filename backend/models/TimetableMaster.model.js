import { DataTypes } from 'sequelize';

const TimetableMaster = (sequelize) => {
  const TimetableMasterModel = sequelize.define('TimetableMaster', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> classes.id'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> departments.id'
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'e.g. 2025-2026'
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '1-8'
    },
    semester_type: {
      type: DataTypes.ENUM('odd', 'even'),
      allowNull: false,
      comment: 'odd or even'
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'e.g. 2023-2027'
    },
    room_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. CR-15'
    },
    effective_from: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'DATE when this timetable is effective'
    },
    revision_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. 05.01.2026/01'
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'draft',
      comment: 'draft on create, active after activation'
    },
    class_coordinator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> faculty_profiles.faculty_id (class coordinator)'
    },
    asst_coordinator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> faculty_profiles.faculty_id (assistant coordinator)'
    },
    timetable_incharge_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> faculty_profiles.faculty_id (is_timetable_incharge=1)'
    },
    hod_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> faculty_profiles.faculty_id (head of department)'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> faculty_profiles.faculty_id (department-admin)'
    }
  }, {
    tableName: 'timetable_master',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['class_id', 'academic_year', 'semester', 'status'],
        where: { status: 'active' },
        name: 'uq_active_class_sem',
        comment: 'Only ONE active timetable per (class_id, academic_year, semester)'
      }
    ]
  });

  TimetableMasterModel.associate = (models) => {
    TimetableMasterModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class'
    });
    TimetableMasterModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department'
    });
    TimetableMasterModel.belongsTo(models.Faculty, {
      foreignKey: 'class_coordinator_id',
      as: 'class_coordinator'
    });
    TimetableMasterModel.belongsTo(models.Faculty, {
      foreignKey: 'asst_coordinator_id',
      as: 'asst_coordinator'
    });
    TimetableMasterModel.belongsTo(models.Faculty, {
      foreignKey: 'timetable_incharge_id',
      as: 'timetable_incharge'
    });
    TimetableMasterModel.belongsTo(models.Faculty, {
      foreignKey: 'hod_id',
      as: 'hod'
    });
    TimetableMasterModel.belongsTo(models.Faculty, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    TimetableMasterModel.hasMany(models.TimetableMasterSlots, {
      foreignKey: 'master_id',
      as: 'slots'
    });
    TimetableMasterModel.hasMany(models.TimetableOverlay, {
      foreignKey: 'master_id',
      as: 'overlays'
    });
  };

  return TimetableMasterModel;
};

export default TimetableMaster;
