import { models } from '../models/index.js';
const { ClassIncharge, PortfolioNotification, Student, Faculty } = models;

/**
 * Send a notification to the class incharge of a student
 * @param {number} studentId - The ID of the student
 * @param {Object} itemData - The item data (referenceId, referenceType, title)
 */
export const notifyClassIncharge = async (studentId, itemData) => {
    try {
        const student = await Student.findByPk(studentId);
        if (!student || !student.classId) return;

        // Find the active class incharge for this student's class
        const incharge = await ClassIncharge.findOne({
            where: { class_id: student.classId, status: 'active' }
        });

        if (!incharge) {
            console.log(`[Notification] No class incharge found for class ${student.classId}`);
            return;
        }

        const senderName = `${student.firstName} ${student.lastName}`;

        await PortfolioNotification.create({
            recipientId: incharge.faculty_id,
            senderId: student.id,
            senderName,
            referenceId: itemData.referenceId,
            referenceType: itemData.referenceType,
            type: 'submission',
            title: `New ${itemData.referenceType} for verification`,
            message: `${senderName} has submitted a new ${itemData.referenceType} (${itemData.itemTitle}) for verification.`
        });

        console.log(`[Notification] Sent to class incharge (Faculty ID: ${incharge.faculty_id}) for student ${studentId}`);
    } catch (error) {
        console.error('[Notification Error]', error);
    }
};
/**
 * Send a notification to the student about the approval/rejection of their portfolio item
 * @param {number} studentId - The ID of the student
 * @param {Object} itemData - The item data (referenceId, referenceType, title, status, remarks)
 */
export const notifyStudentPortfolioResult = async (studentId, itemData) => {
    try {
        const { StudentNotification } = models;
        const statusText = itemData.status === 'approved' ? 'Approved' : 'Rejected';

        await StudentNotification.create({
            studentId,
            title: `${itemData.referenceType.charAt(0).toUpperCase() + itemData.referenceType.slice(1)} ${statusText}`,
            message: `Your ${itemData.referenceType} "${itemData.itemTitle}" has been ${itemData.status}. ${itemData.remarks ? `Remarks: ${itemData.remarks}` : ''}`,
            type: 'approval',
            priority: itemData.status === 'approved' ? 'medium' : 'high',
            referenceId: itemData.referenceId,
            referenceType: itemData.referenceType,
            actionUrl: `/student/portfolio/${itemData.referenceType === 'sport' ? 'sports' : itemData.referenceType + 's'}`
        });

        console.log(`[Notification] Sent result to student ${studentId} for ${itemData.referenceType}`);
    } catch (error) {
        console.error('[Notification Error - Student Portfolio Result]', error);
    }
};
