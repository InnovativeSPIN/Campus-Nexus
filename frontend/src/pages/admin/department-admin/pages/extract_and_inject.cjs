const fs = require('fs');
const facultyFile = 'l:/GITS/ERP/Campus-Nexus_back_up_1.4/Campus-Nexus/frontend/src/pages/faculty/pages/Academics.tsx';
const deptAdminFile = 'l:/GITS/ERP/Campus-Nexus_back_up_1.4/Campus-Nexus/frontend/src/pages/admin/department-admin/pages/Academics.tsx';

let facultyContent = fs.readFileSync(facultyFile, 'utf-8');
let deptAdminContent = fs.readFileSync(deptAdminFile, 'utf-8');

// Extract the 'Course Plan Manual Entry States' block
const statesStart = facultyContent.indexOf('  // Course Plan Manual Entry States');
const statesEnd = facultyContent.indexOf('  const handleAddUnit = () => {');
const statesChunk = facultyContent.substring(statesStart, statesEnd);

// Extract the handler functions
const funcsStart = facultyContent.indexOf('  const getDefaultAcademicYear = () => {');
const funcsEnd = facultyContent.indexOf('  // Share to external platforms states');
const funcsChunk = facultyContent.substring(funcsStart, funcsEnd);

// Extract the 'Course Plan Section' UI block
const uiStart = facultyContent.indexOf('        <TabsContent value=\"courseplan\">');
const uiEnd = facultyContent.indexOf('        <TabsContent value=\"marks\">');
const uiChunk = facultyContent.substring(uiStart, uiEnd);

// Extract the 'Course Plan Manual Entry Section' UI block
const uploadStart = facultyContent.indexOf('        <TabsContent value=\"coursefile\">');
const uploadEnd = facultyContent.indexOf('        <TabsContent value=\"credits\">');
let uploadChunk = facultyContent.substring(uploadStart, uploadEnd);

// Map the value in uploadChunk to 'courseplan-upload' since 'coursefile' is already used by Dept Admin
uploadChunk = uploadChunk.replace('value=\"coursefile\"', 'value=\"courseplan-upload\"');

// Inject States and funcs into dept admin right before '  // Course file states'
const insertStatesAt = deptAdminContent.indexOf('  // Course file states');
deptAdminContent = deptAdminContent.substring(0, insertStatesAt) + statesChunk + '\n' + funcsChunk + '\n' + deptAdminContent.substring(insertStatesAt);

// Inject TabsTrigger
const insertTriggerAt = deptAdminContent.indexOf('          <TabsTrigger value=\"coursefile\" className=\"flex items-center gap-2\">');
const triggers = '          <TabsTrigger value=\"courseplan\" className=\"flex items-center gap-2\">\n            <ClipboardList className=\"w-4 h-4\" />\n            Course Plan\n          </TabsTrigger>\n          <TabsTrigger value=\"courseplan-upload\" className=\"flex items-center gap-2\">\n            <Upload className=\"w-4 h-4\" />\n            Course Plan Upload\n          </TabsTrigger>\n';
deptAdminContent = deptAdminContent.substring(0, insertTriggerAt) + triggers + deptAdminContent.substring(insertTriggerAt);

// Inject TabsContents before marks
const insertUiAt = deptAdminContent.indexOf('        <TabsContent value=\"marks\">');
deptAdminContent = deptAdminContent.substring(0, insertUiAt) + uiChunk + '\n' + uploadChunk + '\n' + deptAdminContent.substring(insertUiAt);

// Add missing imports: Download, Plus, useRef
if (!deptAdminContent.includes('useRef')) {
  deptAdminContent = deptAdminContent.replace('import { useEffect, useMemo, useState } from \"react\";', 'import { useEffect, useMemo, useState, useRef } from \"react\";');
}
if (!deptAdminContent.includes('Download,')) {
  deptAdminContent = deptAdminContent.replace('Upload,', 'Upload,\n  Download,\n  Plus,');
}

fs.writeFileSync(deptAdminFile, deptAdminContent);
console.log('Successfully injected Course Plan UI and logic.');
