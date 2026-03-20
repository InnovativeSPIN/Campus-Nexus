import { sequelize } from './config/db.js';

async function fix() {
  try {
    console.log("Dropping old constraints and adding new ones pointing to faculty_profiles...");
    
    // Sports
    await sequelize.query("ALTER TABLE student_sports DROP FOREIGN KEY fk_sport_approver");
    await sequelize.query("ALTER TABLE student_sports ADD CONSTRAINT fk_sport_approver FOREIGN KEY (approvedById) REFERENCES faculty_profiles(faculty_id) ON DELETE SET NULL");
    
    // Certifications
    await sequelize.query("ALTER TABLE student_certifications DROP FOREIGN KEY fk_cert_approver");
    await sequelize.query("ALTER TABLE student_certifications ADD CONSTRAINT fk_cert_approver FOREIGN KEY (approvedById) REFERENCES faculty_profiles(faculty_id) ON DELETE SET NULL");
    
    // Events
    await sequelize.query("ALTER TABLE student_events DROP FOREIGN KEY fk_event_approver");
    await sequelize.query("ALTER TABLE student_events ADD CONSTRAINT fk_event_approver FOREIGN KEY (approvedById) REFERENCES faculty_profiles(faculty_id) ON DELETE SET NULL");
    
    // Projects (Check if it exists first as I didn't see it in show_create but it's in models)
    try {
      await sequelize.query("ALTER TABLE student_projects DROP FOREIGN KEY fk_project_approver");
      await sequelize.query("ALTER TABLE student_projects ADD CONSTRAINT fk_project_approver FOREIGN KEY (approvedById) REFERENCES faculty_profiles(faculty_id) ON DELETE SET NULL");
    } catch (e) {
      console.log("Projects table might not have the foreign key or doesn't exist yet, skipping...");
    }

    console.log("SUCCESS: Database constraints updated to reference faculty_profiles.");
    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR during fix:", err);
    process.exit(1);
  }
}

fix();
