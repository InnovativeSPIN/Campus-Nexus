import { sequelize, models } from './backend/models/index.js';
(async()=>{
  try{
    const [rows] = await sequelize.query('SELECT * FROM timetable LIMIT 5');
    console.log('timetable rows', rows);
  }catch(e){console.error('err',e);}finally{process.exit();}
})();