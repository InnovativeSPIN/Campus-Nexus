const fs = require('fs');
const file = 'c:/Users/thanu/Documents/Projects/camp/Campus-Nexus/backend/controllers/timetable/timetable-display.controller.js';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('export const getMyClassTimetable ='));
let endIndex = -1;

// Find the matching closing brace for the function
let braceCount = 0;
let started = false;
for (let i = startIndex; i < lines.length; i++) {
  if (lines[i].includes('{')) {
    started = true;
    braceCount += (lines[i].match(/\{/g) || []).length;
  }
  if (lines[i].includes('}')) {
    braceCount -= (lines[i].match(/\}/g) || []).length;
  }
  if (started && braceCount === 0) {
    endIndex = i;
    // include the closing parenthesis and semicolon if any
    if (lines[i].includes('});')) {
      // it's on this line
    } else if (i + 1 < lines.length && lines[i+1].includes('});')) {
      endIndex = i + 1;
    }
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const newFunc = `export const getMyClassTimetable = asyncHandler(async (req, res, next) => {
  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in session'
      });
    }

    // Since we're delegating to getEffectiveClassTimetable, we need to import Student
    const { Student } = (await import('../../models/index.js')).models;
    const student = await Student.findByPk(studentId);

    if (!student || !student.classId) {
      return res.status(404).json({
        success: false,
        message: 'Student class not found'
      });
    }

    req.params.classId = student.classId;
    
    // Instead of duplicating logic, simply delegate to the function that handles overlays correctly
    return await getEffectiveClassTimetable(req, res, next);
  } catch (error) {
    console.error('[TimetableDisplay] Error in getMyClassTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});`;

  lines.splice(startIndex, endIndex - startIndex + 1, newFunc);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully replaced getMyClassTimetable');
} else {
  console.log('Could not find bounds of getMyClassTimetable');
}
