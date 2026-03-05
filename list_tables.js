import { sequelize } from './backend/models/index.js';
(async()=>{
  try{
    const [rows] = await sequelize.query('SHOW TABLES');
    console.log(rows);
  } catch(e){console.error(e);} finally { process.exit(); }
})();