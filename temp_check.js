import { sequelize, models } from './backend/models/index.js';
(async()=>{
  try{
    const recs = await models.TimetableSimple.findAll({limit:5});
    console.log('records',recs.map(r=>r.toJSON()));
  }catch(e){console.error('err',e)}
  process.exit();
})();