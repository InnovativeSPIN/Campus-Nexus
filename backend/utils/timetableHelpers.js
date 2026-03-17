/**
 * Timetable Helper Functions
 * Fetch faculty timetable assignments and student classes from timetable data
 */

export const getFacultyTimetableSlots = async (facultyId, date, models) => {
  try {
    const { TimetableMaster, TimetableMasterSlots, Subject, PeriodSlot } = models;
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];

    // Find all timetable assignments for this faculty on this day
    const assignments = await TimetableMaster.findAll({
      where: {
        faculty_id: facultyId,
      },
      include: [
        {
          model: TimetableMasterSlots,
          as: 'slots',
          where: {
            day_of_week: dayName,
          },
          required: true,
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name'] },
            { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
          ],
        },
      ],
      attributes: ['id', 'class_section_id', 'academic_year'],
      raw: false,
    });

    // Format the response
    const slots = [];
    assignments.forEach(assignment => {
      assignment.slots.forEach(slot => {
        slots.push({
          timetableId: assignment.id,
          classSectionId: assignment.class_section_id,
          academicYear: assignment.academic_year,
          subjectId: slot.subject?.id,
          subjectCode: slot.subject?.subject_code,
          subjectName: slot.subject?.subject_name,
          periodId: slot.period?.id,
          periodLabel: slot.period?.period_label,
          startTime: slot.period?.start_time,
          endTime: slot.period?.end_time,
          dayOfWeek: slot.day_of_week,
        });
      });
    });

    return slots;
  } catch (error) {
    console.error('[getFacultyTimetableSlots] Error:', error);
    throw error;
  }
};

export const getStudentsByClassAndSlot = async (classSectionId, models) => {
  try {
    const { Student } = models;
    
    // Get all students in this class section
    const students = await Student.findAll({
      where: {
        class_section_id: classSectionId,
      },
      attributes: ['id', 'student_id', 'first_name', 'last_name', 'roll_number', 'photo_path'],
      order: [['roll_number', 'ASC']],
    });

    return students;
  } catch (error) {
    console.error('[getStudentsByClassAndSlot] Error:', error);
    throw error;
  }
};

export const formatTimetableSlots = (slots) => {
  // Remove duplicates by subject and period for the same class
  const uniqueSlots = [];
  const seen = new Set();

  slots.forEach(slot => {
    const key = `${slot.classSectionId}_${slot.subjectId}_${slot.periodId}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots;
};
