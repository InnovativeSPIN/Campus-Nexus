import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { sequelize, models } from '../../models/index.js';
import { TimetableSimple } from '../../models/index.js';
import { Op } from 'sequelize';

// extract frequently used models
const { TimetableAlteration, Faculty } = models;
import csvParser from 'csv-parser';
import fs from 'fs';

// @desc      Bulk upload timetable from CSV
// @route     POST /api/v1/timetable/bulk-upload
// @access    Private
export const bulkUploadTimetable = asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload a CSV file', 400));
  }

  // Get academicYear and semester from request body (optional - can be in CSV)
  const { academicYear: bodyAcademicYear, semester } = req.body;

  // Parse CSV file - use let for results since we need to reassign
  let results = [];
  const errors = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => {
          // Validate required fields
          const requiredFields = ['facultyId', 'facultyName', 'department', 'year', 'section', 'day', 'hour', 'subject'];
          const missingFields = requiredFields.filter(field => !data[field] || (typeof data[field] === 'string' && data[field].trim() === ''));

          if (missingFields.length > 0) {
            errors.push({
              row: results.length + 1,
              error: `Missing required fields: ${missingFields.join(', ')}`,
              data
            });
          } else {
            // Validate required fields
            const hourStr = data.hour?.toString().trim();
            const hour = hourStr ? parseInt(hourStr, 10) : null;

            if (!hour || isNaN(hour)) {
              errors.push({
                row: results.length + 1,
                error: `Invalid hour value: ${data.hour}`,
                data
              });
              return; // Skip this row
            }

            // Normalize and validate data
            // Use academicYear from CSV or from request body; treat blank as null
            let academicYearValue = data.academicYear ? data.academicYear.trim() : '';
            if (!academicYearValue) {
              academicYearValue = bodyAcademicYear ? bodyAcademicYear.trim() : null;
            }
            if (academicYearValue === '') academicYearValue = null;

            results.push({
              facultyId: data.facultyId.trim(),
              facultyName: data.facultyName.trim(),
              department: data.department.trim(),
              year: data.year.trim(),
              section: data.section ? data.section.trim() : '',
              day: data.day.trim(),
              hour: hour,
              subject: data.subject.trim(),
              academicYear: academicYearValue
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  } catch (error) {
    return next(new ErrorResponse(`Error parsing CSV file: ${error.message}`, 400));
  }

  // Check if there are valid rows to insert
  if (results.length === 0) {
    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse('No valid rows found in CSV file', 400));
  }

  // Check for duplicates within the CSV itself (same faculty, day, hour)
  const seen = new Set();
  const csvDuplicates = [];

  results.forEach((row, index) => {
    const key = `${row.facultyId}|${row.day}|${row.hour}`;
    if (seen.has(key)) {
      csvDuplicates.push({
        row: index + 2, // +2 because row 1 is header and index starts at 0
        facultyId: row.facultyId,
        day: row.day,
        hour: row.hour,
        subject: row.subject
      });
    }
    seen.add(key);
  });

  if (csvDuplicates.length > 0) {
    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse(`Duplicate entries found in CSV file: ${csvDuplicates.map(d => `Row ${d.row} (${d.facultyId} on ${d.day} hour ${d.hour})`).join(', ')}`, 400));
  }

  // Get unique department names from the uploaded data
  // Note: We use department name (string) directly, not departmentId

  console.log('[DEBUG] Processing', results.length, 'rows from CSV');

  // Add departmentId to each result - using map creates new array, no reassignment needed
  // Validate all fields and ensure no NaN/undefined values
  // Convert Roman year to numeric
  const romanToNumber = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4,
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4
  };

  results = results.map(row => {
    // Validate and parse hour
    const hourValue = row.hour;
    if (hourValue === undefined || hourValue === null || isNaN(hourValue)) {
      console.error('[ERROR] Invalid hour value:', row.hour, 'Row:', row);
      throw new Error(`Invalid hour value: ${row.hour} at faculty ${row.facultyId}`);
    }

    // Convert Roman year to numeric
    let yearValue = row.year?.toString().trim();
    if (romanToNumber[yearValue]) {
      yearValue = romanToNumber[yearValue];
    }
    yearValue = parseInt(yearValue, 10);

    // Validate year
    if (yearValue === undefined || yearValue === null || isNaN(yearValue) || ![1, 2, 3, 4].includes(yearValue)) {
      console.error('[ERROR] Invalid year value:', row.year, 'Row:', row);
      throw new Error(`Invalid year value: ${row.year} at faculty ${row.facultyId}`);
    }

    return {
      facultyId: row.facultyId,
      facultyName: row.facultyName,
      department: row.department,
      year: yearValue,
      section: row.section || null,
      day: row.day,
      hour: hourValue,
      subject: row.subject,
      academicYear: row.academicYear || null
    };
  });

  // Get unique faculty IDs and academic years from the uploaded data
  const uniqueFacultyIds = [...new Set(results.map(row => row.facultyId))];
  // ignore null/undefined academic years when computing unique list
  const uniqueAcademicYears = [...new Set(results.map(row => row.academicYear).filter(v => v != null))];

  // Start transaction
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Delete existing records for uploaded faculty and academic years
    // This allows re-uploading without duplicate errors
    let deletedCount = 0;
    if (uniqueFacultyIds.length > 0 && uniqueAcademicYears.length > 0) {
      deletedCount = await TimetableSimple.destroy({
        where: {
          facultyId: {
            [Op.in]: uniqueFacultyIds
          },
          academicYear: {
            [Op.in]: uniqueAcademicYears
          }
        },
        transaction,
        force: true // Force delete even if soft delete is enabled
      });
      console.log('[DEBUG] Deleted', deletedCount, 'existing records for re-upload');
    }

    // Bulk insert all records
    const insertedRecords = await TimetableSimple.bulkCreate(results, {
      validate: true,
      ignoreDuplicates: false,
      transaction
    });

    // Commit transaction
    await transaction.commit();

    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    // Format response data for preview
    const previewData = insertedRecords.slice(0, 50).map(record => ({
      id: record.id,
      facultyId: record.facultyId,
      facultyName: record.facultyName,
      department: record.department,
      year: record.year,
      section: record.section,
      day: record.day,
      hour: record.hour,
      subject: record.subject,
      academicYear: record.academicYear
    }));

    console.log('[DEBUG] Bulk upload successful - Inserted:', insertedRecords.length, 'records, Deleted:', deletedCount, 'old records');

    res.status(200).json({
      success: true,
      message: 'Timetable uploaded successfully and replaced old records',
      insertedCount: insertedRecords.length,
      deletedCount: deletedCount,
      preview: previewData,
      total: insertedRecords.length
    });

  } catch (error) {
    // Rollback transaction on error if it exists
    console.error('[ERROR] Bulk upload failed:', error.message);
    console.error('[ERROR] Stack:', error.stack);

    if (transaction) {
      await transaction.rollback();
    }

    // Clean up uploaded file
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    // Handle duplicate entry error
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error.errors[0]?.path || 'facultyId, day, hour';
      return next(new ErrorResponse(`Duplicate entry found for ${duplicateField}. Transaction rolled back.`, 400));
    }

    // Handle validation error
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(e => e.message).join(', ');
      return next(new ErrorResponse(`Validation error: ${validationErrors}. Transaction rolled back.`, 400));
    }

    // Generic error - return the actual error message
    return next(new ErrorResponse(`Error uploading timetable: ${error.message}`, 500));
  }
});

// @desc      Get personal timetable for logged-in faculty
// @route     GET /api/v1/timetable/faculty/me
// @access    Private (Faculty only)
export const getMyTimetable = asyncHandler(async (req, res, next) => {
  try {
    // Get facultyId/code from logged-in user (JWT token). Depending on how the token was issued
    // this may contain the college code (string) or the numeric PK. We'll handle both safely.
    const facultyCode = req.user.facultyId || req.user.faculty_id || req.user.id;

    console.log('[DEBUG] getMyTimetable - facultyCode from token:', facultyCode);

    if (!facultyCode) {
      console.log('[DEBUG] getMyTimetable - Faculty ID not found in token');
      return next(new ErrorResponse('Faculty ID not found in token', 400));
    }

    // Build an array of OR conditions, avoiding NaN values which can blow up the SQL query
    const orConditions = [{ faculty_college_code: String(facultyCode) }];
    const parsedId = parseInt(facultyCode, 10);
    if (!isNaN(parsedId)) {
      orConditions.push({ faculty_id: parsedId });
    }

    // Look up the actual faculty record to get integer faculty_id
    const faculty = await Faculty.findOne({
      where: {
        [Op.or]: orConditions
      }
    });

    if (!faculty) {
      return res.status(200).json({
        success: true,
        timetable: [],
        message: 'Faculty record not found'
      });
    }

    const facultyId = faculty.faculty_id; // Use integer ID for alterations

    // Determine string value to query timetable rows. Prefer the college code if present,
    // otherwise fall back to the numeric id (converted to string since TimetableSimple stores it as text).
    const timetableFacultyKey = faculty.faculty_college_code
      ? String(faculty.faculty_college_code)
      : String(facultyId);

    const timetable = await TimetableSimple.findAll({
      where: { facultyId: timetableFacultyKey },
      attributes: ['id', 'facultyId', 'day', 'hour', 'subject', 'section', 'department', 'year', 'academicYear'],
      order: [
        [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')"), 'ASC'],
        ['hour', 'ASC']
      ]
    });

    console.log('[DEBUG] getMyTimetable - Query result count:', timetable.length);
    console.log('[DEBUG] getMyTimetable - Faculty ID used:', facultyId);

    // Format response
    let formattedTimetable = timetable.map(record => ({
      id: record.id,
      facultyId: record.facultyId,
      day: record.day,
      hour: record.hour,
      subject: record.subject,
      section: record.section,
      department: record.department,
      year: record.year,
      academicYear: record.academicYear,
      isAltered: false,
      alteredAt: null,
      originalFacultyId: null,
      originalFacultyName: null
    }));

    // Apply any temporary alterations within last 24 hours
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const altRecords = await TimetableAlteration.findAll({
        where: {
          [Op.or]: [
            { old_faculty_id: facultyId },  // Faculty being substituted
            { new_faculty_id: facultyId }   // Faculty substituting
          ],
          created_at: { [Op.gte]: cutoff }
        }
      });

      const alts = altRecords.map(a => a.toJSON ? a.toJSON() : a);

      alts.forEach(alt => {
        const { day, hour, section, subject, year } = alt;

        // If this faculty is the replacement (new_faculty_id)
        if (alt.new_faculty_id === facultyId) {
          // Add the substituted class to their timetable
          const exists = formattedTimetable.some(s => s.day === day && s.hour === hour && s.section === section);
          if (!exists) {
            formattedTimetable.push({
              id: `alt-${alt.id}`,
              facultyId: faculty.faculty_college_code,
              day,
              hour,
              subject,
              section,
              department: null,
              year: year,
              academicYear: null,
              isAltered: true,
              alteredAt: alt.created_at,
              originalFacultyId: alt.old_faculty_id,
              originalFacultyName: null
            });
          }
        }

        // If this faculty is being substituted (old_faculty_id)
        if (alt.old_faculty_id === facultyId) {
          // Mark the slot as altered
          formattedTimetable = formattedTimetable.map(slot => {
            if (slot.day === day && slot.hour === hour && slot.section === section) {
              return {
                ...slot,
                isAltered: true,
                alteredAt: alt.created_at,
                originalFacultyId: slot.facultyId,
                originalFacultyName: slot.facultyId
              };
            }
            return slot;
          });
        }
      });
    } catch (err) {
      console.error('[TIMETABLE] error applying alterations to personal timetable', err);
    }

    // Sort altered entries to the end
    formattedTimetable.sort((a, b) => (a.isAltered ? 1 : 0) - (b.isAltered ? 1 : 0));

    console.log('[DEBUG] getMyTimetable - Returning timetable records:', formattedTimetable.length);

    res.status(200).json({
      success: true,
      timetable: formattedTimetable
    });
  } catch (err) {
    console.error('[TIMETABLE] getMyTimetable caught error:', err);
    // rethrow to be handled by asyncHandler
    throw err;
  }
});

// @desc      Get personal timetable for logged-in student
// @route     GET /api/v1/timetable/student/me
// @access    Private (Student only)
export const getMyStudentTimetable = asyncHandler(async (req, res, next) => {
  // Get student using primary key id from JWT token
  // DO NOT use userId or departmentId - these columns may not exist in the database
  // Exclude problematic fields from query
  const student = await models.Student.findByPk(req.user.id, {
    attributes: { exclude: ['userId', 'departmentId'] }
  });

  if (!student) {
    console.log('[DEBUG] getMyStudentTimetable - Student record not found');
    return next(new ErrorResponse('Student record not found', 404));
  }

  console.log('[DEBUG] getMyStudentTimetable - Student found:', student.id, student.studentId);

  // Use department from JWT token directly (already contains department short_name)
  // The JWT token includes department info from login time
  // Normalize department name to string
  const departmentName = req.user.department?.short_name ||
    (typeof req.user.department === 'string' ? req.user.department : null);

  // Normalize year to integer
  let yearValue = req.user.year || student.year;
  if (typeof yearValue === 'string') {
    const yearMatch = yearValue.match(/(\d+)/);
    if (yearMatch) yearValue = parseInt(yearMatch[1], 10);
    else if (yearValue.toLowerCase().includes('first')) yearValue = 1;
    else if (yearValue.toLowerCase().includes('second')) yearValue = 2;
    else if (yearValue.toLowerCase().includes('third')) yearValue = 3;
    else if (yearValue.toLowerCase().includes('fourth')) yearValue = 4;
  }

  const sectionValue = 'A';

  console.log('[DEBUG] getMyStudentTimetable - Using from JWT:', {
    studentId: student.id,
    departmentName,
    yearValue,
    sectionValue
  });

  if (!departmentName) {
    console.log('[DEBUG] getMyStudentTimetable - Department not found in JWT');
    return next(new ErrorResponse('Department not assigned to student', 400));
  }

  console.log('[DEBUG] getMyStudentTimetable - Student details:', {
    studentId: student.id,
    departmentName,
    yearValue,
    sectionValue,
    batch: student.batch
  });

  // Build query using department name, year (integer), and section
  const timetableQuery = {
    department: departmentName,
    year: yearValue
  };

  // Add section to query if available
  if (sectionValue) {
    timetableQuery.section = sectionValue;
  }

  const timetable = await TimetableSimple.findAll({
    where: timetableQuery,
    order: [
      [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')"), 'ASC'],
      ['hour', 'ASC']
    ]
  });

  console.log('[DEBUG] getMyStudentTimetable - Query result count:', timetable.length);

  if (!timetable || timetable.length === 0) {
    // Check if any data exists at all
    const totalCount = await TimetableSimple.count();
    console.log('[DEBUG] getMyStudentTimetable - Total timetable records in DB:', totalCount);

    return res.status(200).json({
      success: true,
      timetable: [],
      message: totalCount === 0 ? 'No timetable data in system' : 'No timetable found for your class'
    });
  }

  // Format response
  let formattedTimetable = timetable.map(record => ({
    day: record.day,
    hour: record.hour,
    subject: record.subject,
    section: record.section,
    facultyName: record.facultyName,
    department: record.department,
    year: record.year,
    academicYear: record.academicYear,
    isAltered: false,
    alteredAt: null,
    originalFacultyName: null
  }));

  // Apply any temporary alterations within last 24 hours
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // We used to restrict the query by year and section, but these values
    // can sometimes be missing from the JWT or student record which caused
    // legitimate alterations to be ignored.  Instead fetch all recent
    // alterations that fall on the same day/hour and then filter in JS.
    // fetch any recent alterations for these day/hour combinations
    const altRecords = await TimetableAlteration.findAll({
      where: {
        day: { [Op.in]: formattedTimetable.map(s => s.day) },
        hour: { [Op.in]: formattedTimetable.map(s => s.hour) },
        created_at: { [Op.gte]: cutoff }
      },
      include: [
        { model: Faculty, as: 'newFaculty', attributes: ['Name'] },
        { model: Faculty, as: 'oldFaculty', attributes: ['Name'] }
      ]
    });

    const alts = altRecords.map(a => a.toJSON ? a.toJSON() : a);

    console.log('[DEBUG] getMyStudentTimetable - raw alterations fetched', alts.length, 'entries', alts);

    // Apply alterations to student timetable, checking section/year explicitly
    formattedTimetable = formattedTimetable.map(slot => {
      const matching = alts.find(alt => {
        // normalize strings for robust matching
        const altDay = alt.day?.toLowerCase().trim();
        const slotDay = slot.day?.toLowerCase().trim();
        const altSection = alt.section ? alt.section.trim() : '';
        const slotSection = slot.section ? slot.section.trim() : '';
        const sameDay = altDay === slotDay;
        const sameHour = alt.hour === slot.hour;
        const sameSection = !slotSection || altSection === slotSection;
        const altYear = Number(alt.year || alt.semester);
        const slotYear = Number(slot.year);
        // if altYear is not available, ignore year when matching
        const sameYear = !altYear || (slotYear && altYear === slotYear);
        return sameDay && sameHour && sameSection && sameYear;
      });

      if (matching) {
        const replacementName = matching.newFaculty?.Name || matching.replacementFacultyName;
        if (replacementName && replacementName === slot.facultyName) {
          console.warn('[TIMETABLE] alteration matched but replacement equals original', matching, slot);
        }
        return {
          ...slot,
          facultyName: replacementName || slot.facultyName,
          isAltered: true,
          alteredAt: matching.created_at,
          originalFacultyName: slot.facultyName
        };
      }
      return slot;
    });
  } catch (err) {
    console.error('[TIMETABLE] error applying alterations to student timetable', err);
  }

  console.log('[DEBUG] getMyStudentTimetable - Returning timetable records:', formattedTimetable.length);
  // log if any replacements actually changed the faculty name
  const changed = formattedTimetable.filter(s => s.isAltered);
  console.log('[DEBUG] getMyStudentTimetable - slots marked altered after filter:', changed.length, changed);

  res.status(200).json({
    success: true,
    timetable: formattedTimetable
  });
});

// @desc      Get personal timetable for a faculty (by ID)
// @route     GET /api/v1/timetable/faculty/:facultyId
// @access    Private
export const getPersonalTimetable = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  if (!facultyId) {
    return next(new ErrorResponse('Please provide facultyId as parameter', 400));
  }

  const timetable = await TimetableSimple.findAll({
    where: { facultyId },
    attributes: ['day', 'hour', 'subject', 'section', 'department', 'year', 'academicYear'],
    order: [
      // Use literal query for FIELD function to order by day of week
      [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')"), 'ASC'],
      ['hour', 'ASC']
    ]
  });

  if (!timetable || timetable.length === 0) {
    return next(new ErrorResponse(`No timetable found for faculty ID: ${facultyId}`, 404));
  }

  // Format response
  const formattedTimetable = timetable.map(record => ({
    day: record.day,
    hour: record.hour,
    subject: record.subject,
    section: record.section,
    department: record.department,
    year: record.year,
    academicYear: record.academicYear
  }));

  res.status(200).json({
    success: true,
    count: formattedTimetable.length,
    data: formattedTimetable
  });
});
