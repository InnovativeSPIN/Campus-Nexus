import { sequelize } from '../config/db.js';

(async () => {
  try {
    const sql = `
CREATE TABLE IF NOT EXISTS faculty_industry_experience (
  exp_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  job_title VARCHAR(150) DEFAULT NULL,
  company VARCHAR(255) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  from_date DATE DEFAULT NULL,
  to_date DATE DEFAULT NULL,
  period VARCHAR(50) DEFAULT NULL,
  is_current TINYINT(1) DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active',
  INDEX idx_faculty_id (faculty_id),
  CONSTRAINT fk_industry_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    await sequelize.query(sql);
    console.log('Created/ensured table faculty_industry_experience');
    await sequelize.close();
  } catch (err) {
    console.error('Create table failed:', err.message || err);
    process.exit(1);
  }
})();
