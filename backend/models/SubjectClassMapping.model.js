import { DataTypes } from 'sequelize';

const SubjectClassMapping = (sequelize) => {
  const SubjectClassMappingModel = sequelize.define('SubjectClassMapping', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      }
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: true,
      comment: 'Academic year e.g. 2024-2025'
    },
    is_core: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'true = Core, false = Elective'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'subject_class_mappings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        name: 'uq_sub_class_map',
        unique: true,
        fields: ['subject_id', 'class_id', 'semester', 'academic_year']
      },
      {
        fields: ['class_id', 'semester']
      },
      {
        fields: ['department_id', 'semester']
      },
      {
        fields: ['academic_year']
      }
    ]
  });

  SubjectClassMappingModel.associate = (models) => {
    // Mapping belongs to Subject
    SubjectClassMappingModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });

    // Mapping belongs to Class
    SubjectClassMappingModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });

    // Mapping belongs to Department
    SubjectClassMappingModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
  };

  return SubjectClassMappingModel;
};

export default SubjectClassMapping;
