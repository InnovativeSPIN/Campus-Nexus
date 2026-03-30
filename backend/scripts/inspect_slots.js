import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

(async function(){
  try{
    await sequelize.authenticate();
    console.log('DB connected');
    const facultyId = process.argv[2] || 360;
    const res = await sequelize.query(
      `SELECT ts.id, ts.timetable_id, ts.day, ts.start_time, ts.end_time, s.code as subject_code, s.name as subject_name, ts.room, ts.faculty_id
       FROM timetable_slots ts
       LEFT JOIN subjects s ON s.id = ts.subject_id
       WHERE ts.faculty_id = ?
       ORDER BY ts.timetable_id DESC, ts.day, ts.start_time LIMIT 100;`,
      { replacements: [facultyId], type: QueryTypes.SELECT }
    );
    console.log(JSON.stringify(res, null, 2));
  }catch(err){
    console.error(err);
  }finally{
    process.exit(0);
  }
})();
