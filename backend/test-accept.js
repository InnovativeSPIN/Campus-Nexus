import { models, sequelize } from './models/index.js';

async function test() {
  try {
    const { FacultySubstitutes, Faculty, LeaveNotification } = models;
    const id = 77;
    const facultyId = 444; // dummy

    console.log("Fetching record...");
    const record = await FacultySubstitutes.findByPk(id, {
      include: [{ model: Faculty, as: 'absent_faculty', attributes: ['faculty_id', 'Name', 'department_id'] }],
    });

    if (!record) {
        console.log("Record not found!");
        process.exit(1);
    }
    
    console.log("Record found:", record.toJSON());

    const departmentId = record.absent_faculty?.department_id;
    const substituteId = record.substitute_faculty_id;
    
    console.log("Saving record...");
    record.status = 'approved';
    record.approved_by = facultyId;
    record.approval_date = new Date();
    await record.save();
    
    console.log("Fetching substitute info...");
    const substituteInfo = await Faculty.findByPk(substituteId, { attributes: ['Name'] });
    const periodInfo = JSON.parse(record.reason || '{}');
    const dateStr = new Date(record.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    console.log("Creating notification...");
    await LeaveNotification.create({
      recipientId: record.faculty_id,
      recipientType: 'faculty',
      departmentId,
      senderId: facultyId,
      senderName: substituteInfo?.Name || 'Substitute',
      leaveId: null,
      type: 'leave_approved',
      title: `Period Covered — ${dateStr}`,
      message: `Substitute has accepted to cover your ${periodInfo.period_label || 'period'} on ${dateStr}.`,
      isRead: false,
    });
    
    console.log("Success!");
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

test();
