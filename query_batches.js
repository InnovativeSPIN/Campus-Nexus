import { sequelize, models } from './backend/models/index.js';
(async()=>{
  try{
    const [rows] = await sequelize.query("SELECT DISTINCT batch FROM student_profile WHERE batch IS NOT NULL ORDER BY batch DESC");
    console.log('batches', rows);
  }catch(e){console.error(e);}finally{process.exit();}
})();