/**
 * Comprehensive endpoint verification script
 * Tests all endpoints that were showing errors in the logs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3005/api/v1';

// Test credentials - update with actual department-admin credentials
const DEPARTMENT_ADMIN_CREDENTIALS = {
  email: 'admin@cse.edu', // Update with actual email
  password: 'admin123' // Update with actual password
};

let authToken = '';

const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)
};

/**
 * Login and get auth token
 */
async function login() {
  try {
    log.section('AUTHENTICATION');
    log.info('Attempting login as department-admin...');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEPARTMENT_ADMIN_CREDENTIALS)
    });

    const data = await response.json();

    if (response.ok && data.token) {
      authToken = data.token;
      log.success(`Login successful! Token: ${authToken.substring(0, 20)}...`);
      log.info(`User: ${data.user?.name || 'Unknown'}`);
      log.info(`Role: ${data.user?.role || 'Unknown'}`);
      log.info(`Department: ${data.user?.department?.short_name || 'Unknown'}`);
      return true;
    } else {
      log.error(`Login failed: ${data.message || 'Unknown error'}`);
      log.info('Please update DEPARTMENT_ADMIN_CREDENTIALS in this script with valid credentials');
      return false;
    }
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return false;
  }
}

/**
 * Test a GET endpoint
 */
async function testGet(name, endpoint, expectedStatus = 200) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (response.status === expectedStatus) {
      log.success(`${name}: ${response.status} ${response.statusText}`);
      if (data.data && Array.isArray(data.data)) {
        log.info(`  → Returned ${data.data.length} items`);
      } else if (data.count !== undefined) {
        log.info(`  → Count: ${data.count}`);
      }
      return { success: true, data };
    } else {
      log.error(`${name}: Expected ${expectedStatus}, got ${response.status}`);
      log.info(`  → ${data.message || JSON.stringify(data)}`);
      return { success: false, status: response.status, data };
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Run all endpoint tests
 */
async function runTests() {
  log.section('ENDPOINT VERIFICATION TESTS');
  
  const tests = [
    // Faculty endpoints
    {
      name: 'GET /api/v1/faculty (All faculty)',
      endpoint: '/faculty'
    },
    
    // Subjects endpoint
    {
      name: 'GET /api/v1/subjects (All subjects)',
      endpoint: '/subjects'
    },
    
    // Classes endpoint
    {
      name: 'GET /api/v1/classes (All classes)',
      endpoint: '/classes'
    },
    
    // Break timings endpoint
    {
      name: 'GET /api/v1/department-admin/break-timings/year/1st',
      endpoint: '/department-admin/break-timings/year/1st'
    },
    
    // Timetable endpoints
    {
      name: 'GET /api/v1/department-admin/timetable/department/1st',
      endpoint: '/department-admin/timetable/department/1st'
    },
    
    // Faculty by year endpoint
    {
      name: 'GET /api/v1/timetable/admin/faculty-by-year/1',
      endpoint: '/timetable/admin/faculty-by-year/1'
    },
    
    // Room endpoints (newly created)
    {
      name: 'GET /api/v1/department-admin/rooms (All rooms)',
      endpoint: '/department-admin/rooms'
    },
    
    // Lab endpoints (newly created)
    {
      name: 'GET /api/v1/department-admin/labs (All labs)',
      endpoint: '/department-admin/labs'
    },
    
    // Break timings (all)
    {
      name: 'GET /api/v1/department-admin/break-timings (All)',
      endpoint: '/department-admin/break-timings'
    },
    
    // Year group break timings
    {
      name: 'GET /api/v1/department-admin/break-timings/year-group/year_1',
      endpoint: '/department-admin/break-timings/year-group/year_1'
    }
  ];

  log.info(`Running ${tests.length} endpoint tests...\n`);

  const results = [];
  
  for (const test of tests) {
    const result = await testGet(test.name, test.endpoint);
    results.push({ ...test, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  log.section('TEST SUMMARY');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log.info(`Total Tests: ${results.length}`);
  log.success(`Passed: ${passed}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}`);
  }
  
  console.log('\n');
  
  if (failed > 0) {
    log.info('Failed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.status) {
        console.log(`    Status: ${r.status}`);
      }
      if (r.data?.message) {
        console.log(`    Message: ${r.data.message}`);
      }
    });
  }
  
  return { passed, failed, total: results.length };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Endpoint Verification Tests\n');
  
  // Step 1: Login
  const loginSuccess = await login();
  
  if (!loginSuccess) {
    log.error('Cannot proceed without authentication');
    log.info('\nTo fix this:');
    log.info('1. Make sure server is running on port 3005');
    log.info('2. Update DEPARTMENT_ADMIN_CREDENTIALS in this script');
    log.info('3. Ensure department-admin user exists in database');
    process.exit(1);
  }
  
  // Step 2: Run tests
  const summary = await runTests();
  
  // Step 3: Exit with appropriate code
  if (summary.failed === 0) {
    log.success('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    log.error(`\n⚠️  ${summary.failed} test(s) failed`);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
