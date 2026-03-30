import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  try {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('student_profile');
    
    if (!tableDescription.emisNo) {
      await queryInterface.addColumn('student_profile', 'emisNo', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Education Management Information System Number'
      });
      console.log('✓ Added emisNo column to student_profile table');
    } else {
      console.log('✓ emisNo column already exists in student_profile table');
    }
  } catch (error) {
    console.error('Error adding emisNo column:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    await queryInterface.removeColumn('student_profile', 'emisNo');
    console.log('✓ Removed emisNo column from student_profile table');
  } catch (error) {
    console.error('Error removing emisNo column:', error);
    throw error;
  }
};
