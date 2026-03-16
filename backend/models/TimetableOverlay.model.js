import { DataTypes } from 'sequelize';

const TimetableOverlay = (sequelize) => {
  const TimetableOverlayModel = sequelize.define('TimetableOverlay', {
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
    overlay_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'The specific date of the affected period',
    },
    period_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK -> period_slots.id',
    },
    original_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Absent faculty - FK -> faculty_profiles.faculty_id',
    },
    substitute_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Accepted substitute - FK -> faculty_profiles.faculty_id',
    },
    original_subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Subject being substituted - FK -> subjects.id',
    },
    substitute_subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Same as original unless class is different',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Leave: [leave_type_code] — [reason text]',
    },
    leave_request_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> leave_requests.id',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Timetable-incharge faculty_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'timetable_overlay',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['master_id', 'overlay_date', 'period_slot_id'],
        name: 'uq_overlay_date_slot',
      },
    ],
  });

  TimetableOverlayModel.associate = (models) => {
    TimetableOverlayModel.belongsTo(models.TimetableMaster, {
      foreignKey: 'master_id',
      as: 'master',
    });
    TimetableOverlayModel.belongsTo(models.Faculty, {
      foreignKey: 'original_faculty_id',
      as: 'absent_faculty',
    });
    TimetableOverlayModel.belongsTo(models.Faculty, {
      foreignKey: 'substitute_faculty_id',
      as: 'substitute_faculty',
    });
    TimetableOverlayModel.belongsTo(models.Subject, {
      foreignKey: 'original_subject_id',
      as: 'original_subject',
    });
    TimetableOverlayModel.belongsTo(models.Subject, {
      foreignKey: 'substitute_subject_id',
      as: 'substitute_subject',
    });
    TimetableOverlayModel.belongsTo(models.Leave, {
      foreignKey: 'leave_request_id',
      as: 'leave_request',
    });
  };

  return TimetableOverlayModel;
};

export default TimetableOverlay;
