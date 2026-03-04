import path from 'path';
import fs from 'fs';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyResearch } = models;

// @desc      Get current faculty research publications
// @route     GET /api/v1/faculty/research
// @access    Private/Faculty
export const getMyResearch = asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;
    
    let faculty = null;
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty_college_code = req.user.faculty_college_code;
        faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty) {
            return next(new ErrorResponse('Faculty profile not found', 404));
        }
    }

    let whereClause = {};
    if (faculty) {
        whereClause = { faculty_id: faculty.faculty_id };
    } else if (userRole === 'department-admin') {
        // Department admin can see research from all faculty in their department
        const deptId = req.user.departmentId || req.user.department_id || null;
        if (deptId) {
            const facRows = await Faculty.findAll({ where: { department_id: deptId }, attributes: ['faculty_id'] });
            const facultyIds = facRows.map(f => f.faculty_id);
            whereClause = { faculty_id: { [Op.in]: facultyIds } };
        }
    }

    const researchRows = await FacultyResearch.findAll({ 
        where: whereClause, 
        order: [['publication_date', 'DESC'], ['created_at', 'DESC']] 
    });

    // Normalize response
    const research = researchRows.map(r => {
        const plain = r.get ? r.get({ plain: true }) : r;
        return {
            ...plain,
            id: plain.research_id ?? null
        };
    });

    res.status(200).json({
        success: true,
        data: research
    });
});

// @desc      Add new research publication
// @route     POST /api/v1/faculty/research
// @access    Private/Faculty
export const addResearch = asyncHandler(async (req, res, next) => {
    let faculty = null;
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty_college_code = req.user.faculty_college_code;
        faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty) {
            return next(new ErrorResponse('Faculty profile not found', 404));
        }
    }

    let facultyId = faculty ? faculty.faculty_id : null;
    if (!facultyId && req.user.role === 'department-admin') {
        if (req.body.faculty_id) {
            facultyId = req.body.faculty_id;
        } else if (req.body.faculty_college_code) {
            const f2 = await Faculty.findOne({ where: { faculty_college_code: req.body.faculty_college_code }, attributes: ['faculty_id'] });
            if (f2) {
                facultyId = f2.faculty_id;
            } else {
                return next(new ErrorResponse('Faculty profile not found', 404));
            }
        }
        if (!facultyId) {
            return next(new ErrorResponse('Faculty association is required for department-admin', 400));
        }
    }

    // Normalize research category
    const category = req.body.category || '';
    
    // Validate required fields
    if (!req.body.title || !category) {
        return next(new ErrorResponse('Title and category are required', 400));
    }

    const validCategories = ['Conference', 'Journal', 'Patent', 'Book Chapter'];
    if (!validCategories.includes(category)) {
        return next(new ErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400));
    }

    const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const roleFolder = (req.user.role === 'department-admin') ? 'department-admins' : 'faculty';

    const researchData = {
        title: req.body.title,
        category: category,
        faculty_id: facultyId,
        author_names: req.body.author_names || null,
        abstract: req.body.abstract || null,
        keywords: req.body.keywords || null,
        publication_date: req.body.publication_date || null,
        publisher_organizer: req.body.publisher_organizer || null,
        issn_isbn: req.body.issn_isbn || null,
        volume_issue: req.body.volume_issue || null,
        pages: req.body.pages || null,
        type: req.body.type || 'International',
        status: req.body.status || 'Published',
        research_type: req.body.research_type || null,
        impact_factor: req.body.impact_factor || null,
        citations: req.body.citations || 0,
        indexed_in: req.body.indexed_in || null,
        url: req.body.url || null,
        ORCID_ID: req.body.ORCID_ID || null
    };

    console.log('[research.addResearch] Incoming request body:', JSON.stringify(req.body, null, 2));
    console.log('[research.addResearch] final researchData:', JSON.stringify(researchData, null, 2));

    // Handle file upload
    try {
        const file = req.files && (req.files.file || req.files.document || req.files.documents);
        if (file) {
            const uploadFile = Array.isArray(file) ? file[0] : file;
            const ext = path.parse(uploadFile.name).ext || '';
            const cleanName = uploaderName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            const fileName = `research_${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const uploadDir = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', roleFolder, cleanName, 'research');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const uploadPath = path.resolve(uploadDir, fileName);
            await uploadFile.mv(uploadPath);
            researchData.document_url = `/uploads/${roleFolder}/${cleanName}/research/${fileName}`;
        }
    } catch (err) {
        console.error('File Upload Error:', err);
        return next(new ErrorResponse('Problem with file upload', 500));
    }

    let research;
    try {
        console.log('[research.addResearch] About to create research with data:', JSON.stringify(researchData, null, 2));
        research = await FacultyResearch.create(researchData);
        console.log('[research.addResearch] Research created successfully:', research.research_id);
    } catch (err) {
        console.error('[research.addResearch] ERROR - Sequelize create failed');
        console.error('[research.addResearch] Error Message:', err.message);
        console.error('[research.addResearch] Error Name:', err.name);
        if (err.original) {
            console.error('[research.addResearch] MySQL Error:', {
                errno: err.original.errno,
                code: err.original.code,
                sqlState: err.original.sqlState,
                sqlMessage: err.original.sqlMessage,
            });
        }
        
        if (err.name === 'SequelizeValidationError') {
            const messages = err.errors?.map((e) => e.message).join('; ') || err.message;
            return next(new ErrorResponse(`Validation error: ${messages}`, 400));
        }
        
        return next(new ErrorResponse('Database error when creating research record', 500));
    }

    const plain = research.get ? research.get({ plain: true }) : research;
    console.log('[research.addResearch] Research data being returned:', JSON.stringify(plain, null, 2));
    res.status(201).json({
        success: true,
        data: { ...plain, id: plain.research_id ?? null }
    });
});

// @desc      Update research publication
// @route     PUT /api/v1/faculty/research/:id
// @access    Private/Faculty
export const updateResearch = asyncHandler(async (req, res, next) => {
    let research = await FacultyResearch.findByPk(req.params.id);

    if (!research) {
        return next(new ErrorResponse(`Research record not found with id of ${req.params.id}`, 404));
    }

    // Authorization check
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty || research.faculty_id !== faculty.faculty_id) {
            return next(new ErrorResponse('Not authorized to update this record', 401));
        }
    } else if (req.user.role !== 'super-admin') {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    const updateData = { ...req.body };

    // Validate category if provided
    if (updateData.category) {
        const validCategories = ['Conference', 'Journal', 'Patent', 'Book Chapter'];
        if (!validCategories.includes(updateData.category)) {
            return next(new ErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400));
        }
    }

    // Handle file upload replacement
    try {
        const file = req.files && (req.files.file || req.files.document || req.files.documents);
        if (file) {
            // Delete old file if exists
            if (research.document_url) {
                try {
                    const oldPath = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', '..', research.document_url.replace(/^\//, ''));
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error('Error deleting old file:', err.message);
                }
            }

            // Upload new file
            const uploadFile = Array.isArray(file) ? file[0] : file;
            const ext = path.parse(uploadFile.name).ext || '';
            const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
            const cleanName = uploaderName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            const roleFolder = (req.user.role === 'department-admin') ? 'department-admins' : 'faculty';
            const fileName = `research_${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const uploadDir = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', roleFolder, cleanName, 'research');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const uploadPath = path.resolve(uploadDir, fileName);
            await uploadFile.mv(uploadPath);
            updateData.document_url = `/uploads/${roleFolder}/${cleanName}/research/${fileName}`;
        }
    } catch (err) {
        console.error('File Upload Error:', err);
        return next(new ErrorResponse('Problem with file upload', 500));
    }

    try {
        await research.update(updateData);
        const plain = research.get ? research.get({ plain: true }) : research;
        res.status(200).json({
            success: true,
            data: { ...plain, id: plain.research_id ?? null }
        });
    } catch (err) {
        console.error('[research.updateResearch] Error:', err.message);
        return next(new ErrorResponse('Error updating research record', 500));
    }
});

// @desc      Delete research publication
// @route     DELETE /api/v1/faculty/research/:id
// @access    Private/Faculty
export const deleteResearch = asyncHandler(async (req, res, next) => {
    const research = await FacultyResearch.findByPk(req.params.id);

    if (!research) {
        return next(new ErrorResponse(`Research record not found with id of ${req.params.id}`, 404));
    }

    // Authorization check
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty || research.faculty_id !== faculty.faculty_id) {
            return next(new ErrorResponse('Not authorized to delete this record', 401));
        }
    } else if (req.user.role !== 'super-admin') {
        return next(new ErrorResponse('Not authorized to delete this record', 401));
    }

    // Delete file if exists
    if (research.document_url) {
        try {
            const filePath = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', '..', research.document_url.replace(/^\//, ''));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Error deleting file:', err.message);
        }
    }

    try {
        await research.destroy();
        res.status(200).json({
            success: true,
            message: 'Research record deleted successfully'
        });
    } catch (err) {
        console.error('[research.deleteResearch] Error:', err.message);
        return next(new ErrorResponse('Error deleting research record', 500));
    }
});
