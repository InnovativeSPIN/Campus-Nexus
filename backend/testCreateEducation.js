import { sequelize } from './config/db.js';
import { models } from './models/index.js';

(async () => {
  try {
    const { Faculty, FacultyEduQualification } = models;
    
    // Test with faculty_id 101
    const testData = {
      faculty_id: 101,
      degree: 'M.Tech',
      branch: 'Data Science',
      college: 'Test University',
      university: 'Anna University',
      year: '2020',
      percentage: '85',
      society_name: 'IEEE'
    };

    console.log('📝 Attempting to create education record with data:', testData);
    
    const education = await FacultyEduQualification.create(testData);
    
    console.log('\n✅ SUCCESS! Record created:');
    console.log(JSON.stringify(education.get({ plain: true }), null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating record:');
    console.error('Message:', error.message);
    console.error('Fields:', error.fields);
    console.error('Errors:', error.errors);
    console.error('\nFull Error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
})();
