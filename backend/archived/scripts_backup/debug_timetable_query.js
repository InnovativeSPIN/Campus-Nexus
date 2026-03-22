import { models, sequelize } from '../models/index.js';

async function main() {
  const studentId = 3686;
  const student = await models.Student.findByPk(studentId);
  const timetableMaster = await models.TimetableMaster.findOne({ where: { class_id: student.classId, status: 'active' } });
  console.log('timetableMaster', timetableMaster ? timetableMaster.toJSON() : null);
  await models.TimetableMasterSlots.findAll({
    where: { master_id: timetableMaster.id },
    include: [
      { model: models.Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code', 'type'] },
      { model: models.Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email'] },
      { model: models.PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
    ],
    order: [
      [sequelize.literal('FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")'), 'ASC'],
      ['period_slot_id', 'ASC'],
    ],
    logging: console.log,
  });
  process.exit(0);
}

main().catch(e=>{console.error(e); process.exit(1);});
