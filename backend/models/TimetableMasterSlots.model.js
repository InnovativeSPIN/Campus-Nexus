import { DataTypes } from 'sequelize';

const TimetableMasterSlots = (sequelize) => {
  const TimetableMasterSlotsModel = sequelize.define('TimetableMasterSlots', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> timetable_master.id',
    },
    day: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      allowNull: false,
    },
    period_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> period_slots.id (1=I, 2=II, 4=III, 6=IV, 7=V, 9=VI, 10=VII; Skip 3,5,8 breaks)',
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> subjects.id',
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> faculty_profiles.faculty_id',
    },
    session_type: {
      type: DataTypes.ENUM('theory', 'lab', 'tutorial', 'activity', 'project', 'free'),
      defaultValue: 'theory',
    },
    is_lab_session: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '1 = this is a double-period lab',
    },
    lab_pair_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> timetable_master_slots.id (the paired lab slot)',
    },
    lab_group: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: true,
      comment: 'Lab group: A, B, C, D etc.',
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Override room for this slot (NULL = use master room_no)',
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Short label e.g. YOGA, DM, APP LAB',
    },
  }, {
    tableName: 'timetable_master_slots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['master_id', 'day', 'period_slot_id', 'lab_group'],
        name: 'uq_master_slot_group',
      },
    ],
  });

  TimetableMasterSlotsModel.associate = (models) => {
    TimetableMasterSlotsModel.belongsTo(models.TimetableMaster, {
      foreignKey: 'master_id',
      as: 'master',
    });
    TimetableMasterSlotsModel.belongsTo(models.PeriodSlot, {
      foreignKey: 'period_slot_id',
      as: 'period',
    });
    TimetableMasterSlotsModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    TimetableMasterSlotsModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
    TimetableMasterSlotsModel.hasMany(models.TimetableOverlay, {
      foreignKey: 'period_slot_id',
      as: 'overlays',
    });
  };

  return TimetableMasterSlotsModel;
};

export default TimetableMasterSlots;
