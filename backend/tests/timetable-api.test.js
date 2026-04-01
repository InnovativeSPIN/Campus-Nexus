/**
 * Timetable API Test Script
 * Tests all critical endpoints for timetable management and leave alteration workflow
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your-jwt-token-here';

async function request(method, path, payload = undefined) {
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  if (payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let jsonData = null;
  if (text) {
    try {
      jsonData = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response from ${url}: ${err.message}`);
    }
  }

  if (!response.ok) {
    const message = jsonData?.message || response.statusText || 'Request failed';
    throw new Error(`HTTP ${response.status} ${message}`);
  }

  return jsonData;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
};

// Test data
const testData = {
  timetableMaster: {
    class_id: 1,
    department_id: 1,
    academic_year: '2025-2026',
    semester: 1,
    semester_type: 'odd',
    batch: '2023-2027',
    room_no: 'CR-15',
    effective_from: '2026-03-01',
    revision_no: '05.01.2026/01',
    class_coordinator_id: 1,
    asst_coordinator_id: 2,
    timetable_incharge_id: 3,
    hod_id: 4,
  },
  slot: {
    day: 'Monday',
    period_slot_id: 1,
    subject_id: 1,
    faculty_id: 1,
    session_type: 'theory',
    is_lab_session: 0,
    room: 'CR-15',
    notes: 'Regular Lecture',
  },
  leaveRequest: {
    class_id: 1,
    leave_type_id: 1,
    start_date: '2026-03-18',
    end_date: '2026-03-19',
    total_days: 2,
    reason: 'Medical emergency',
    affected_periods: JSON.stringify([
      {
        date: '2026-03-18',
        period_slot_id: 1,
        class_id: 1,
        subject_id: 1,
        master_id: 1,
        requested_substitute_faculty_id: 2,
      },
    ]),
    substitute_faculty_id: 2,
  },
};

/**
 * Test Suite
 */
const tests = {
  /**
   * Test 1: Create Timetable Master
   */
  async createTimetableMaster() {
    console.log('\n📋 TEST 1: Create Timetable Master');
    console.log('━'.repeat(60));
    try {
      const response = await api.post('/timetable-master', testData.timetableMaster);
      console.log('✅ SUCCESS: Timetable Master Created');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data.data?.id;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Test 2: Get All Timetable Masters
   */
  async getTimetableMasters() {
    console.log('\n📋 TEST 2: Get All Timetable Masters');
    console.log('━'.repeat(60));
    try {
      const response = await api.get('/timetable-master');
      console.log('✅ SUCCESS: Retrieved Timetable Masters');
      console.log(`Found ${response.data.data?.length || 0} timetables`);
      return response.data.data;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Test 3: Add Slot to Timetable
   */
  async addSlotToTimetable(masterId) {
    console.log('\n📋 TEST 3: Add Slot to Timetable');
    console.log('━'.repeat(60));
    if (!masterId) {
      console.warn('⚠️  SKIPPED: No masterId provided');
      return null;
    }
    try {
      const response = await api.post(
        `/timetable-master/${masterId}/slots`,
        testData.slot
      );
      console.log('✅ SUCCESS: Slot Added');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data.data?.id;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Test 4: Get Slots for Timetable
   */
  async getSlotsForTimetable(masterId) {
    console.log('\n📋 TEST 4: Get Slots for Timetable');
    console.log('━'.repeat(60));
    if (!masterId) {
      console.warn('⚠️  SKIPPED: No masterId provided');
      return [];
    }
    try {
      const response = await api.get(`/timetable-master/${masterId}/slots`);
      console.log('✅ SUCCESS: Retrieved Slots');
      console.log(`Found ${response.data.data?.length || 0} slots`);
      return response.data.data;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Test 5: Activate Timetable
   */
  async activateTimetable(masterId) {
    console.log('\n📋 TEST 5: Activate Timetable');
    console.log('━'.repeat(60));
    if (!masterId) {
      console.warn('⚠️  SKIPPED: No masterId provided');
      return;
    }
    try {
      const response = await api.patch(`/timetable-master/${masterId}/activate`);
      console.log('✅ SUCCESS: Timetable Activated');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
    }
  },

  /**
   * Test 6: Submit Leave with Alteration
   */
  async submitLeaveWithAlteration() {
    console.log('\n📋 TEST 6: Submit Leave with Alteration');
    console.log('━'.repeat(60));
    try {
      const response = await api.post('/alteration/request', testData.leaveRequest);
      console.log('✅ SUCCESS: Leave Request Submitted');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data.data?.leave_id;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Test 7: Get Pending Alterations for Substitute
   */
  async getPendingAlterations(facultyId = 2) {
    console.log('\n📋 TEST 7: Get Pending Alterations for Substitute');
    console.log('━'.repeat(60));
    try {
      const response = await api.get(`/alteration/pending/${facultyId}`);
      console.log('✅ SUCCESS: Retrieved Pending Alterations');
      console.log(`Found ${response.data.data?.length || 0} pending requests`);
      return response.data.data;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Test 8: Accept Alteration
   */
  async acceptAlteration(substituteId) {
    console.log('\n📋 TEST 8: Accept Alteration');
    console.log('━'.repeat(60));
    if (!substituteId) {
      console.warn('⚠️  SKIPPED: No substituteId provided');
      return;
    }
    try {
      const response = await api.patch(`/alteration/${substituteId}/accept`);
      console.log('✅ SUCCESS: Alteration Accepted');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
    }
  },

  /**
   * Test 9: Get Alterations to Apply (for incharge)
   */
  async getAlterationsToApply(facultyId = 3) {
    console.log('\n📋 TEST 9: Get Alterations to Apply (for incharge)');
    console.log('━'.repeat(60));
    try {
      const response = await api.get(`/alteration/incharge/${facultyId}`);
      console.log('✅ SUCCESS: Retrieved Alterations for Incharge');
      console.log(`Found ${response.data.data?.length || 0} alterations`);
      return response.data.data;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Test 10: Apply Alteration (Create overlay)
   */
  async applyAlteration() {
    console.log('\n📋 TEST 10: Apply Alteration (Create Overlay)');
    console.log('━'.repeat(60));
    try {
      const response = await api.post('/alteration/apply', {
        leave_request_id: 1,
        overlay_date: '2026-03-18',
        period_slot_id: 1,
        original_faculty_id: 1,
        substitute_faculty_id: 2,
        original_subject_id: 1,
      });
      console.log('✅ SUCCESS: Alteration Applied (Overlay Created)');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data.data?.overlay_id;
    } catch (error) {
      console.error('❌ ERROR:', error.response?.data || error.message);
      return null;
    }
  },
};

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          TIMETABLE & ALTERATION API TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🔗 API Base URL: ${API_BASE_URL}`);
  console.log('📌 Note: Ensure backend server is running on port 5000\n');

  // Run tests in sequence
  const masterId = await tests.createTimetableMaster();
  await tests.getTimetableMasters();
  const slotId = await tests.addSlotToTimetable(masterId);
  await tests.getSlotsForTimetable(masterId);
  await tests.activateTimetable(masterId);
  const leaveId = await tests.submitLeaveWithAlteration();
  const pendingAlterations = await tests.getPendingAlterations();
  if (pendingAlterations.length > 0) {
    await tests.acceptAlteration(pendingAlterations[0].id);
  }
  await tests.getAlterationsToApply();
  await tests.applyAlteration();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUITE COMPLETED                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
