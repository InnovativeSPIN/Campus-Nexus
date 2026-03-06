import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import colors from 'colors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import fileupload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/error.js';
import connectDB from './config/db.js';
import seedSuperAdmin from './utils/initDB.js';

// Route files
import authRoutes from './routes/admin/auth.routes.js';
import userRoutes from './routes/admin/user.routes.js';
import departmentRoutes from './routes/admin/department.routes.js';
import adminSubjectRoutes from './routes/admin/subject.routes.js';
import facultyRoutes from './routes/faculty/faculty.routes.js';
import studentRoutes from './routes/student/student.routes.js';
import timetableRoutes from './routes/timetable/timetable.routes.js';
import timetableManagementAdminRoutes from './routes/admin/timetable-management.routes.js';
import leaveRoutes from './routes/leave-attendance/leave.routes.js';
import attendanceRoutes from './routes/leave-attendance/attendance.routes.js';
import announcementRoutes from './routes/admin/announcement.routes.js';
import timetableManagementRoutes from './routes/department-admin/timetable-management.routes.js';
import breakTimingRoutes from './routes/department-admin/break-timing.routes.js';
import facultyAllocationRoutes from './routes/department-admin/faculty-allocation.routes.js';
import timetableNotificationRoutes from './routes/faculty/timetable-notification.routes.js';
import timetableAlterationRoutes from './routes/faculty/timetable-alteration.routes.js';
import coordinatorRoutes from './routes/department-admin/coordinator.routes.js';
import subjectRoutes from './routes/department-admin/subject.routes.js';
import roomRoutes from './routes/department-admin/room.routes.js';
import labRoutes from './routes/department-admin/lab.routes.js';
import classInchargeRoutes from './routes/department-admin/class-incharge.routes.js';
import generalSubjectRoutes from './routes/subject.routes.js';
import classRoutes from './routes/class.routes.js';
import studentMarksRoutes from './routes/student/studentMarks.routes.js';
import studentProjectRoutes from './routes/student/studentProject.routes.js';
import studentCertificationRoutes from './routes/student/studentCertification.routes.js';
import studentExtracurricularRoutes from './routes/student/studentExtracurricular.routes.js';
import studentNotificationRoutes from './routes/student/studentNotification.routes.js';
import studentDisciplinaryRoutes from './routes/student/disciplinary.routes.js';
import studentLeaveRoutes from './routes/student/studentLeave.routes.js';

// Load env vars
dotenv.config();

// Initialize Sequelize models (associations)
import initModels from './models/index.js';
initModels();

// Connect to database
connectDB().then(() => {
  console.log('Database connected successfully');
  // Only run the seeder when explicitly requested. Set SEED_SUPERADMIN=true
  // (e.g. in development when you need to recreate credentials).
  if (process.env.SEED_SUPERADMIN === 'true') {
    seedSuperAdmin().then(() => {
      console.log('Seeding completed');
      startServer();
    }).catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
  } else {
    // skip seeding and just start
    startServer();
  }
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const startServer = () => {
  console.log('Starting server setup...');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();

  // Body parser with increased limits for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Cookie parser
  app.use(cookieParser());

  // Dev logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // File uploading - skip for routes using Multer to avoid conflicts
  app.use((req, res, next) => {
    const multerPaths = [
      '/api/v1/timetable/bulk-upload',
      '/api/v1/students/me/photo',
      '/api/v1/student-leaves',
      '/api/v1/student/certifications',
      '/api/v1/student/projects',
      '/api/v1/student/extracurricular',
      '/api/v1/student/sports'
    ];

    if (multerPaths.some(p => req.path.includes(p)) || req.path.includes('/photo')) {
      return next();
    }
    fileupload()(req, res, next);
  });

  // Sanitize data
  app.use(mongoSanitize());

  // Set security headers
  app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Rate limiting: enable only in production to avoid hitting limits during local development
  if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10 mins
      max: 100
    });
    app.use(limiter);
  }

  // Prevent http param pollution
  app.use(hpp());

  // Enable CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Set static folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle missing uploads - serve default image
  app.use('/uploads/', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', req.path);
    try {
      if (!fs.existsSync(filePath)) {
        // File doesn't exist, serve a default image
        return res.sendFile(path.join(__dirname, 'public/uploads/faculty/avatar_7.jpg'));
      }
    } catch (error) {
      console.error('Error checking file:', error);
    }
    next();
  });

  // Mount routers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/departments', departmentRoutes);
  app.use('/api/v1/admin/subjects', adminSubjectRoutes);
  app.use('/api/v1/faculty', facultyRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/subjects', generalSubjectRoutes);
  app.use('/api/v1/classes', classRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/timetable-management', timetableManagementAdminRoutes);
  app.use('/api/v1/leave', leaveRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/announcements', announcementRoutes);
  app.use('/api/v1/department-admin/timetable', timetableManagementRoutes);
  app.use('/api/v1/department-admin/break-timings', breakTimingRoutes);
  app.use('/api/v1/department-admin/allocation-faculty', facultyAllocationRoutes);
  app.use('/api/v1/department-admin/coordinators', coordinatorRoutes);
  app.use('/api/v1/department-admin/subjects', subjectRoutes);
  app.use('/api/v1/department-admin/rooms', roomRoutes);
  app.use('/api/v1/department-admin/labs', labRoutes);
  app.use('/api/v1/department-admin/class-incharges', classInchargeRoutes);
  app.use('/api/v1/faculty/notifications', timetableNotificationRoutes);
  app.use('/api/v1/faculty/timetable/alterations', timetableAlterationRoutes);
  app.use('/api/v1/student/marks', studentMarksRoutes);
  app.use('/api/v1/student/projects', studentProjectRoutes);
  app.use('/api/v1/student/certifications', studentCertificationRoutes);
  app.use('/api/v1/student/extracurricular', studentExtracurricularRoutes);
  app.use('/api/v1/student/notifications', studentNotificationRoutes);
  app.use('/api/v1/student/disciplinary', studentDisciplinaryRoutes);
  app.use('/api/v1/student-leaves', studentLeaveRoutes);

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Eduvertex ERP API is running' });
  });

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT)
    .on('listening', () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] Port ${PORT} is already in use.`.red.bold);
        console.error(`This usually happens when a previous server instance is still running.`.yellow);
        console.error(`Attempting to fix this for you...`.cyan);

        // On Windows, attempts to kill the process on that port
        import('child_process').then(cp => {
          cp.exec(`taskkill /F /IM node.exe /FI "WINDOWTITLE eq nodemon"`, (error) => {
            process.exit(1);
          });
        });
      } else {
        console.error(err);
        process.exit(1);
      }
    });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};
