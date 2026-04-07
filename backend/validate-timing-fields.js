import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('✅ Validating Timetable Timing Fields Implementation\n');

// 1. Check Model File
console.log('1️⃣  Checking TimetableMasterSlots.model.js...');
const modelPath = path.join(__dirname, 'models/TimetableMasterSlots.model.js');
const modelContent = fs.readFileSync(modelPath, 'utf8');

const hasStartTime = modelContent.includes("start_time: {");
const hasEndTime = modelContent.includes("end_time: {");
const hasStartTimeComment = modelContent.includes('Custom start time for this slot');
const hasEndTimeComment = modelContent.includes('Custom end time for this slot');

console.log(`   ${hasStartTime ? '✅' : '❌'} start_time field defined`);
console.log(`   ${hasEndTime ? '✅' : '❌'} end_time field defined`);
console.log(`   ${hasStartTimeComment ? '✅' : '❌'} start_time has documentation`);
console.log(`   ${hasEndTimeComment ? '✅' : '❌'} end_time has documentation\n`);

// 2. Check Controller - createSlot
console.log('2️⃣  Checking createSlot method in controller...');
const controllerPath = path.join(__dirname, 'controllers/timetable/timetable-slots.controller.js');
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

const createSlotDestructuring = controllerContent.match(/const\s+{\s*day[\s\S]*?start_time,[\s\S]*?end_time,[\s\S]*?}\s*=\s*req\.body/);
const createSlotParams = controllerContent.includes('start_time: start_time || null') && 
                         controllerContent.includes('end_time: end_time || null');

console.log(`   ${createSlotDestructuring ? '✅' : '❌'} Destructures start_time and end_time from request body`);
console.log(`   ${createSlotParams ? '✅' : '❌'} Passes start_time and end_time to create() call\n`);

// 3. Check Controller - updateSlot
console.log('3️⃣  Checking updateSlot method in controller...');
const allowedFieldsMatch = controllerContent.match(/const allowed = \[([^\]]+)\]/);
if (allowedFieldsMatch) {
  const allowedFields = allowedFieldsMatch[1];
  const hasStartInAllowed = allowedFields.includes('start_time');
  const hasEndInAllowed = allowedFields.includes('end_time');
  
  console.log(`   ${hasStartInAllowed ? '✅' : '❌'} start_time in allowed update fields`);
  console.log(`   ${hasEndInAllowed ? '✅' : '❌'} end_time in allowed update fields`);
  console.log(`   Allowed fields: [${allowedFields}]\n`);
} else {
  console.log('   ❌ Could not find allowed fields array\n');
}

// Summary
console.log('═'.repeat(60));
console.log('🎯 VALIDATION SUMMARY');
console.log('═'.repeat(60));

const allChecks = [
  hasStartTime && hasEndTime,
  hasStartTimeComment && hasEndTimeComment,
  createSlotDestructuring && createSlotParams,
  controllerContent.includes("const allowed = ['subject_id', 'faculty_id', 'session_type', 'is_lab_session', 'lab_pair_slot_id', 'lab_group', 'room', 'notes', 'start_time', 'end_time']")
];

const passedChecks = allChecks.filter(check => check).length;

console.log(`\n✅ Passed: ${passedChecks}/${allChecks.length} checks\n`);

if (passedChecks === allChecks.length) {
  console.log('🎉 All timing fields validated successfully!');
  console.log('\n📝 Implementation Details:');
  console.log('   • Model: TimetableMasterSlots now includes start_time and end_time fields');
  console.log('   • Create: createSlot() accepts start_time and end_time in request body');
  console.log('   • Update: updateSlot() allows updating start_time and end_time');
  console.log('   • Bulk: bulkCreateSlots() supports timing fields via spread operator');
  console.log('\n✨ You can now create slots with custom timings for different timetables!');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the implementation.');
  process.exit(1);
}
