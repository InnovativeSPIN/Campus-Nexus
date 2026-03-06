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
