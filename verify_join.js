import { sequelize, models } from './backend/models/index.js';
(async()=>{
  try{
    const [rows] = await sequelize.query(`
      SELECT t.facultyId, t.department as timetable_dept, f.faculty_college_code,f.department_id, d.short_name as faculty_dept
      FROM timetable t
      LEFT JOIN faculty_profiles f ON f.faculty_college_code = t.facultyId
      LEFT JOIN departments d ON d.id = f.department_id
      LIMIT 10;
    `);
    console.log('join sample', rows);
  }catch(e){console.error(e);}finally{process.exit();}
})();