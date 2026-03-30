/**
 * Simple, Direct Class Incharge Detection
 * Fixed version with enhanced debugging
 */
import { Op } from 'sequelize';

const getAssignedClassIdForFaculty = async (facultyId, models) => {
    try {
        console.log(`\n[CI]╔════════════════════════════════════════╗`);
        console.log(`[CI]║ GET ASSIGNED CLASS ID FOR FACULTY       ║`);
        console.log(`[CI]╚════════════════════════════════════════╝`);
        console.log(`[CI] Input - Faculty ID: ${facultyId} (type: ${typeof facultyId})`);

        if (!facultyId || !models || !models.TimetableMaster) {
            console.log(`[CI] ❌ Invalid input - missing facultyId, models, or TimetableMaster`);
            console.log(`[CI] facultyId exists: ${!!facultyId}, models exists: ${!!models}, TimetableMaster exists: ${!!models?.TimetableMaster}\n`);
            return null;
        }

        // Convert to number to match database
        const numId = Number(facultyId);
        console.log(`[CI] Step 1: Converted facultyId to number: ${numId}`);

        // Query TimetableMaster with detailed logging
        console.log(`[CI] Step 2: Querying TimetableMaster for:`);
        console.log(`[CI]   - class_coordinator_id = ${numId}`);
        console.log(`[CI]   - asst_coordinator_id = ${numId}`);
        console.log(`[CI]   - timetable_incharge_id = ${numId}`);

        const tm = await models.TimetableMaster.findOne({
            where: {
                [Op.or]: [
                    { class_coordinator_id: numId },
                    { asst_coordinator_id: numId },
                    { timetable_incharge_id: numId }
                ],
                status: { [Op.in]: ['active', 'draft', 'pending_approval'] }
            },
            attributes: ['id', 'class_id', 'class_coordinator_id', 'asst_coordinator_id', 'timetable_incharge_id', 'status'],
            raw: true,
            order: [['updated_at', 'DESC']]
        });

        console.log(`[CI] Step 3: TimetableMaster query result:`, JSON.stringify(tm, null, 2));

        if (tm && tm.class_id) {
            console.log(`[CI] ✅ SUCCESS: Found class_id = ${tm.class_id}`);
            console.log(`[CI]    Coordinator Type: `,
                tm.class_coordinator_id === numId ? 'class_coordinator' :
                    tm.asst_coordinator_id === numId ? 'asst_coordinator' :
                        'timetable_incharge');
            console.log(`[CI]\n`);
            return tm.class_id;
        }

        // Fallback: Check ClassIncharge table if it exists
        console.log(`[CI] Step 4: TimetableMaster search failed, checking ClassIncharge table...`);
        if (models.ClassIncharge) {
            const ci = await models.ClassIncharge.findOne({
                where: {
                    faculty_id: numId,
                    status: { [Op.in]: ['active', 1, true] }
                },
                attributes: ['class_id'],
                raw: true
            });

            if (ci && ci.class_id) {
                console.log(`[CI] ✅ SUCCESS: Found in ClassIncharge - class_id = ${ci.class_id}\n`);
                return ci.class_id;
            }
        }

        console.log(`[CI] ❌ FAILED: No class incharge assignment found for faculty ${numId}`);
        console.log(`[CI] Please check:`)
        console.log(`[CI]   1. TimetableMaster has a record with this faculty as coordinator`)
        console.log(`[CI]   2. The status is 'active', 'draft', or 'pending_approval'`);
        console.log(`[CI]   3. Faculty ID ${numId} is correct\n`);
        return null;
    } catch (error) {
        console.error(`[CI] ❌ ERROR in getAssignedClassIdForFaculty:`, error.message);
        console.error(`[CI] Stack:`, error.stack);
        return null;
    }
};

export default getAssignedClassIdForFaculty;
