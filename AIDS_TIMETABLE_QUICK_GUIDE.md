# AIDS Department Timetable - Quick Reference Guide

## 📁 Files Created

### 1. **AIDS_Timetable_Sample_III_VI.csv**
Complete CSV template with 29 rows of actual timetable data for AIDS 3rd Year, Section A, Semester VI.

**Location**: `backend/public/Format/AIDS_Timetable_Sample_III_VI.csv`

**Usage**:
```bash
# Upload via API
POST /api/v1/timetable/bulk-upload
Content-Type: multipart/form-data
File: AIDS_Timetable_Sample_III_VI.csv
```

---

### 2. **setup_aids_timetable.sql**
Complete SQL script to set up all required data (department, class, room, labs, faculty, subjects, breaks).

**Location**: `backend/setup_aids_timetable.sql`

**Usage**:
```bash
# Run in MySQL/MariaDB
mysql -u root -p eduvertex < backend/setup_aids_timetable.sql

# Or via phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select 'eduvertex' database
# 3. Go to 'SQL' tab
# 4. Paste contents of setup_aids_timetable.sql
# 5. Click 'Go'
```

---

### 3. **AIDS_TIMETABLE_ANALYSIS.md**
Comprehensive documentation analyzing the timetable image with all details.

**Location**: `AIDS_TIMETABLE_ANALYSIS.md`

**Contents**:
- Period timings
- Subject details (theory & lab)
- Faculty mapping
- Weekly schedule breakdown
- Room & lab allocation
- Special activities
- CSV upload format notes
- Implementation checklist

---

## 🚀 Quick Setup Steps

### Step 1: Setup Database
```bash
# Navigate to backend directory
cd backend

# Run the SQL setup script
mysql -u root -p eduvertex < setup_aids_timetable.sql
```

**This creates**:
- ✅ AIDS Department (if needed)
- ✅ Class "AIDS A" (Year 3, Section A, Semester 6)
- ✅ Room CR-15
- ✅ 3 Labs (LAB-L1, LAB-MK, LAB-LAN)
- ✅ 6 Faculty members
- ✅ 6 Subjects with codes
- ✅ Break timings for Year 3

---

### Step 2: Upload Timetable CSV

**Option A: Via Frontend**
1. Login as department-admin
2. Navigate to "Create Timetable" page
3. Download template (optional)
4. Upload `AIDS_Timetable_Sample_III_VI.csv`
5. Review preview
6. Confirm upload

**Option B: Via API (Postman/curl)**
```bash
curl -X POST http://localhost:3005/api/v1/timetable/bulk-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backend/public/Format/AIDS_Timetable_Sample_III_VI.csv" \
  -F "departmentId=6" \
  -F "academicYear=2025-2026" \
  -F "semester=6"
```

---

### Step 3: Verify Upload

**Check via Frontend**:
1. Go to "View Timetable" page
2. Select: Year = 3, Section = A, Semester = 6
3. Verify all periods are displayed correctly
4. Check room allocations (CR-15)
5. Check lab sessions (LAB-L1, LAB-MK, LAB-LAN)

**Check via API**:
```bash
# Get timetable for AIDS A
GET /api/v1/timetable/class/21

# Get faculty timetable
GET /api/v1/timetable/faculty/CS10

# Get student timetable
GET /api/v1/timetable/student/STUDENT_ID
```

---

## 📊 Timetable Summary

### Basic Info
- **Department**: AI&DS (ID: 6)
- **Class**: AIDS A (ID: 21)
- **Year/Semester**: III/VI (3rd Year, 6th Semester)
- **Room**: CR-15
- **Academic Year**: 2025-2026 (Even Semester)
- **Effective Date**: 05.01.2026

### Faculty (6)
| Code | Name | Subjects |
|------|------|----------|
| CS10 | Dr. L.S. Vignesh | PPL (HOD) |
| NS80T01 | Ms. P. Nagajothi | DM, DM Lab |
| NS50T08 | Mr. J. Vinodkumar | APP, APP Lab |
| NS40T23 | Mrs. P. Gowthami | ESIOT, ESIOT Lab |
| NS60T15 | Dr. B. Mallikarjun | GT |
| NS70T09 | Ms. R. Malini | YAS (Yoga) |

### Subjects (6 Theory + 3 Labs)
| Code | Subject | Credits | Faculty |
|------|---------|---------|---------|
| CS3691 | Embedded Systems and IoT | 4 | Gowthami |
| CCW332 | Digital Marketing | 4 | Nagajothi |
| CCS358 | Principles of Programming Languages | 4 | Vignesh |
| CCS332 | App Development | 5 | Vinodkumar |
| OMA351 | Graph Theory | 5 | Mallikarjun |
| GE3451 | Yoga, Ayurveda & Siddha | 1 | Malini |

### Labs (3)
| Code | Lab Name | Subjects |
|------|----------|----------|
| LAB-L1 | App Development Lab | APP Lab |
| LAB-MK | Embedded Systems & IoT Lab | ESIOT Lab |
| LAB-LAN | Digital Marketing Lab | DM Lab |

### Weekly Hours
- **Monday**: 7 periods (all theory)
- **Tuesday**: 6 periods (2 theory + 4 lab + library)
- **Wednesday**: 4 periods (4 theory) + Placement
- **Thursday**: 7 periods (5 theory + 2 lab)
- **Friday**: Full day - Naan Mudhalvan
- **Saturday**: 5 periods (5 theory) + Mini Hackathon

**Total Teaching Hours**: 29 hours/week

---

## 🔍 CSV Data Structure

### Sample Row (Theory Class)
```csv
CS10,Dr. L.S. Vignesh,Monday,1,GE3451,Well Being with Traditional Practices,21,AIDS A,3,A,6,CR-15,,FALSE,theory,2025-2026,2026-01-05
```

### Sample Row (Lab Session)
```csv
NS50T08,Mr. J. Vinodkumar,Tuesday,1,CCS332,App Development Laboratory,21,AIDS A,3,A,6,,LAB-L1,TRUE,lab,2025-2026,2026-01-05
```

### Field Descriptions
1. **facultyCollegeCode**: CS10, NS80T01, etc.
2. **facultyName**: Full name
3. **day**: Monday-Saturday
4. **period**: 1-7
5. **subjectCode**: CS3691, CCW332, etc.
6. **subjectName**: Full subject name
7. **classId**: 21 (AIDS A)
8. **className**: AIDS A
9. **year**: 3
10. **section**: A
11. **semester**: 6
12. **roomNumber**: CR-15 (theory), empty (lab)
13. **labName**: empty (theory), LAB-L1/MK/LAN (lab)
14. **isLabSession**: FALSE/TRUE
15. **sessionType**: theory/lab/tutorial
16. **academicYear**: 2025-2026
17. **effectiveDate**: 2026-01-05

---

## ⚠️ Important Notes

### Before Upload
1. ✅ Ensure all faculty exist in database with correct college codes
2. ✅ Ensure all subjects exist with exact subject codes
3. ✅ Ensure class ID 21 exists for AIDS A
4. ✅ Ensure room CR-15 is created
5. ✅ Ensure labs LAB-L1, LAB-MK, LAB-LAN are created
6. ✅ Run `setup_aids_timetable.sql` first to create all required data

### Lab Sessions
- Lab sessions span **2 consecutive periods**
- Create **2 separate CSV rows** for each lab (same subject, different periods)
- Example: APP Lab on Tuesday uses periods 1 and 2 → 2 rows in CSV

### Special Days
- **Friday**: Naan Mudhalvan (Government skill program) - may not need CSV entries
- **Saturday Period 6-7**: Mini Hackathon - may be marked as activity/event

### Room Allocation
- **Theory classes**: Always use `roomNumber = CR-15`, `labName = empty`
- **Lab sessions**: Always use `roomNumber = empty`, `labName = LAB-XX`

### Data Consistency
- All 29 CSV rows must have matching:
  - classId = 21
  - className = AIDS A
  - year = 3
  - section = A
  - semester = 6
  - academicYear = 2025-2026

---

## 🛠️ Troubleshooting

### Issue: "Faculty not found"
**Solution**: Run setup SQL script to create missing faculty

### Issue: "Subject not found"
**Solution**: Run setup SQL script to create all 6 subjects

### Issue: "Room not available"
**Solution**: Ensure CR-15 is created for department_id = 6

### Issue: "Lab not found"
**Solution**: Ensure all 3 labs (LAB-L1, LAB-MK, LAB-LAN) are created

### Issue: "Class not found"
**Solution**: Ensure class ID 21 exists with correct year/semester/section

### Issue: "Duplicate period"
**Solution**: Check for conflicts - same faculty/room at same day/period

---

## 📞 Support

For issues or questions:
1. Check [AIDS_TIMETABLE_ANALYSIS.md](AIDS_TIMETABLE_ANALYSIS.md) for detailed information
2. Review [FIXES_APPLIED.md](FIXES_APPLIED.md) for recent bug fixes
3. Check backend logs for specific error messages
4. Verify database setup using verification queries in SQL script

---

**Last Updated**: March 5, 2026  
**Version**: 1.0  
**Based on**: AIDS Department Timetable for Academic Year 2025-2026 (Even Semester)
