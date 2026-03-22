# Database Setup Guide - Faculty Leave Management System

## Problem

You may see this error when trying to access leave management endpoints:
```
Table 'eduvertex.leaves' doesn't exist
```

This happens because:
1. The `leaves` table hasn't been created yet
2. The migrations need to be run to add the new multi-level approval fields

## Solution - Quick Setup (Recommended)

### For Windows Users:
```bash
cd backend
.\setup.bat
```

### For Mac/Linux Users:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

The setup scripts will:
1. ✓ Install dependencies
2. ✓ Initialize the database tables
3. ✓ Run all migrations
4. ✓ Set up multi-level approval workflow columns

## Manual Setup (If scripts don't work)

### Step 1: Initialize Database Tables

```bash
cd backend
node init-db.js
```

Expected output:
```
Initializing database...
✓ Leaves table created successfully
✓ Database initialization completed
```

### Step 2: Run Migrations

```bash
node run-migration.js
```

Expected output:
```
Starting migrations...
📋 Running Migration 1: Add EMIS number to student profile...
✓ Migration 1 completed successfully

📋 Running Migration 2: Add multi-level approval to Leave...
✓ Migration 2 completed successfully

✓ All migrations completed successfully
```

### Step 3: Verify Setup

Connect to MySQL and verify the tables:

```sql
mysql> use eduvertex;
mysql> DESCRIBE leaves;
```

You should see columns including:
- `id` (Primary Key)
- `applicantId`
- `leaveType`
- `startDate`, `endDate`, `totalDays`
- `reason`, `status`
- **New fields**:
  - `overall_status`
  - `substitute_faculty_id`, `substitute_approval_status`, etc.
  - `timetable_incharge_id`, `timetable_incharge_approval_status`, etc.
  - `executive_admin_id`, `executive_admin_approval_status`, etc.
  - `dept_admin_notified`, `dept_admin_notified_at`

### Step 4: Start the Server

```bash
npm start
# OR
node server.js
```

## Troubleshooting

### Issue: Still getting "Table doesn't exist" after setup

**Solution 1**: Verify database connection
```bash
# Check .env file
cat .env

# Should have:
# MYSQL_HOST=localhost
# MYSQL_USER=root
# MYSQL_DATABASE=eduvertex
```

**Solution 2**: Clear and reinitialize
```bash
# Drop the table (if it exists but is corrupted)
mysql -u root -p eduvertex -e "DROP TABLE IF EXISTS leaves;"

# Reinitialize
node init-db.js
node run-migration.js
```

**Solution 3**: Check MySQL is running
```bash
# On Windows
net start MySQL80  # Or your MySQL service name

# On Mac
brew services start mysql

# On Linux
sudo systemctl start mysql
```

### Issue: Migration fails with "Cannot read property 'name' of undefined"

**Solution**: Make sure all models are initialized before running migrations
```bash
# This is handled by init-db.js, but if you're running migrations separately:
node init-db.js  # Always run this first!
node run-migration.js
```

### Issue: Permission denied on setup.sh

**Solution**:
```bash
chmod +x setup.sh
./setup.sh
```

## Files Added/Modified

**New Files**:
- `backend/init-db.js` - Database initialization script
- `backend/setup.sh` - Setup script for Mac/Linux
- `backend/setup.bat` - Setup script for Windows
- `backend/DATABASE_SETUP_GUIDE.md` - This file

**Modified Files**:
- `backend/run-migration.js` - Updated to run both migrations
- `backend/migrations/add_multilevel_approval_to_leave.js` - New migration

## Testing the Setup

After setup, test the endpoints:

```bash
# Get leave applications (should return empty array if no applications yet)
curl -X GET "http://localhost:5000/api/v1/faculty/leave-management/my-applications" \
  -H "Authorization: Bearer <your_jwt_token>"

# Expected response:
# {
#   "success": true,
#   "data": []
# }
```

## Next Steps

Once the database is set up:

1. **Test the workflow**: Follow the test guide in `LEAVE-API-TEST-GUIDE.md`
2. **Start the frontend**: 
   ```bash
   cd frontend
   npm run dev
   ```
3. **Access the leave management pages** in the faculty module

## Support

If issues persist:

1. Check `backend/LEAVE-API-TEST-GUIDE.md` for API reference
2. Check `IMPLEMENTATION_AND_DEPLOYMENT_GUIDE.md` section 10 (Troubleshooting)
3. Verify all dependencies are installed: `npm install` in both `backend` and `frontend`
4. Check that JWT authentication token is valid

---

**Last Updated**: 2024
**Version**: 1.0
