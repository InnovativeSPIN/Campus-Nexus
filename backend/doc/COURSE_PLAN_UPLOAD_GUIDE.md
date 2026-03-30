# Course Plan Upload - Fixed & Guide

## 🔧 What Was Fixed

### **Root Cause of 500 Error**
The original course plan upload was failing because of **incorrect department admin query** in `uploadCoursePlan` function. 

**The Problem:**
```javascript
// ❌ WRONG - Looking for admins via FacultySubjectAssignment
const departmentAdminsAssignments = await FacultySubjectAssignment.findAll({
  where: { subject_id: assignment.subject_id },
  include: [{ model: Faculty, as: 'faculty', required: true, where: { role_id: [7], department_id: departmentId } }]
});
```

This query tried to find department admins (role_id 7) through subject assignments, which often returns no results or causes database errors.

**The Fix:**
```javascript
// ✅ CORRECT - Query Faculty directly
const departmentAdmins = await Faculty.findAll({
  where: {
    role_id: 7,
    department_id: departmentId,
    is_active: true
  },
  attributes: ['faculty_id'],
  raw: true
});
```

### **Improvements Made:**
1. ✅ Direct Faculty table query for department admins
2. ✅ Better error logging to track exact failure point
3. ✅ Non-blocking notifications (if notification fails, upload still succeeds)
4. ✅ Template download endpoint added
5. ✅ Frontend UI with clear instructions

---

## 📋 How to Upload Course Plan

### **Step 1: Download Template**
- Go to Academics tab → Course Plan Upload section
- Click **"Download Course Plan Template"** button
- File saves as `Course-Plan-Template.txt`

### **Step 2: Fill the Template**
Use a Word processor (Word, Google Docs, LibreOffice):
- Open the downloaded template
- Fill in all fields:
  - Faculty name, subject name, code
  - Academic year, semester, class
  - For each unit: topics, CO numbers, periods, reference books

### **Step 3: Save as PDF**
**From Microsoft Word:**
- File → Save As → Select "PDF" format → Save

**From Google Docs:**
- File → Download → PDF Document

**From any application:**
- File → Print → Select "Save as PDF" → Save

### **Step 4: Upload to System**
1. In Course Plan Upload section, click file upload area
2. Select your PDF file (must be PDF, max 50MB)
3. Review PDF preview in the dialog
4. Click **"Send to HOD"** button
5. Wait for confirmation message

---

## 📊 File Format Requirements

| Property | Requirements |
|----------|--------------|
| **Format** | PDF only |
| **Maximum Size** | 50 MB |
| **File Name** | Any (will be renamed with timestamp) |
| **Template** | Available for download in the system |

---

## 🔍 What Happens After Upload

| Status | Description |
|--------|-------------|
| **Submitted** | File received, waiting for HOD approval |
| **Approved** | HOD approved, course plan is active |
| **Revision Requested** | HOD requested changes, you can resubmit |
| **Rejected** | HOD rejected, please modify and resubmit |

---

## ⚠️ Troubleshooting

### **Error: File format not supported**
- Ensure file is actually PDF (not Word doc or image)
- Try re-saving with "Print to PDF" option

### **Error: This course plan was already uploaded**
- You uploaded the exact same file twice
- Make a change (add a note, edit a topic) and save as new PDF

### **Error: Not assigned to this subject/class combination**
- Verify the subject and class are correctly assigned to you
- Contact HOD if assignment is missing

### **Upload takes too long**
- Check your internet connection
- If file is large (>30MB), it may take a minute
- Don't close browser or navigate away during upload

---

## 📁 Where Files Are Stored

Your uploaded course plans are stored on the server at:
```
backend/public/uploads/course-plans/{subject_id}/{filename}
```

Files are:
- ✅ Encrypted with SHA256 hash for duplicate detection
- ✅ Backed up in database records
- ✅ Only accessible to you and department admins
- ✅ Kept for 1 academic year (then archived)

---

## 💡 Tips

1. **Save drafts locally** - Always keep a local copy before uploading
2. **Check assignment** - Confirm subject/class in dropdown before uploading
3. **Use descriptive names** - Name PDF like "DM_Courseplan_Sem4_2025-26.pdf"
4. **Resubmit immediately** - If rejected, fix and resubmit within 24 hours
5. **Download template first** - Always use the system template for consistency

---

## 🎯 Expected Outcome

✅ Successfully uploaded course plan → Sent for HOD approval → HOD reviews and approves → Status changes to "Approved" → Course plan is now active for students

---

## 📞 Support

If you still encounter issues:
1. Check backend logs: `npm run dev` and look for `[uploadCoursePlan]` messages
2. Verify network request in browser DevTools (F12 → Network tab)
3. Contact HOD/Admin with error message screenshot

