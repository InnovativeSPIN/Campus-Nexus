import { DataTypes } from 'sequelize';

const ClassIncharge = (sequelize) => {
  const ClassInchargeModel = sequelize.define('ClassIncharge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_id'
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'faculty_id'
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year'
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_by',
      comment: 'Department admin who assigned'
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      field: 'status'
    }
  }, {
    tableName: 'class_incharges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['class_id', 'academic_year'],
        name: 'unique_class_academic_year'
      },
      {
        fields: ['faculty_id'],
        name: 'idx_faculty_id'
      },
      {
        fields: ['class_id'],
        name: 'idx_class_id'
      },
      {
        fields: ['status'],
        name: 'idx_status'
      }
    ]
  });

  ClassInchargeModel.associate = (models) => {
    // InCharge belongs to Class
    ClassInchargeModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    // InCharge belongs to Faculty
    ClassInchargeModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });

    // InCharge belongs to User (who assigned it)
    ClassInchargeModel.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assignedBy'
    });
  };

  return ClassInchargeModel;
};

export default ClassIncharge;
