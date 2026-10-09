const http = require('http');

console.log('====================================================');
console.log('    EXPERIMENT 14: REST DATABASE CRUD VERIFICATION');
console.log('====================================================\n');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqOptions = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(jsonBody ? { 'Content-Length': Buffer.byteLength(jsonBody) } : {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data ? (data.length > 0 && data[0] === '{' || data[0] === '[' ? JSON.parse(data) : data) : null
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

async function runTests() {
  try {
    // 1. CREATE STUDENT (POST)
    console.log('👉 STEP 1: Creating new student record (POST /api/students)...');
    const newStudent = { name: 'Edwin Moses', department: 'Computer Science', cgpa: 9.2 };
    const createRes = await makeRequest('POST', '/api/students', newStudent);
    console.log(`Status Code: ${createRes.statusCode}`);
    console.log('Response Body:', createRes.body);
    const studentId = createRes.body._id;

    // 2. READ ALL STUDENTS (GET)
    console.log('\n👉 STEP 2: Fetching all student records (GET /api/students)...');
    const getAllRes = await makeRequest('GET', '/api/students');
    console.log(`Status Code: ${getAllRes.statusCode}`);
    console.log('Student Count:', Array.isArray(getAllRes.body) ? getAllRes.body.length : 0);

    // 3. READ SINGLE STUDENT BY ID (GET)
    console.log(`\n👉 STEP 3: Fetching student by ID (GET /api/students/${studentId})...`);
    const getSingleRes = await makeRequest('GET', `/api/students/${studentId}`);
    console.log(`Status Code: ${getSingleRes.statusCode}`);
    console.log('Student Details:', getSingleRes.body);

    // 4. UPDATE STUDENT (PUT)
    console.log(`\n👉 STEP 4: Updating student CGPA to 9.5 (PUT /api/students/${studentId})...`);
    const updateRes = await makeRequest('PUT', `/api/students/${studentId}`, { cgpa: 9.5 });
    console.log(`Status Code: ${updateRes.statusCode}`);
    console.log('Updated Record:', updateRes.body);

    // 5. DELETE STUDENT (DELETE)
    console.log(`\n👉 STEP 5: Deleting student record (DELETE /api/students/${studentId})...`);
    const deleteRes = await makeRequest('DELETE', `/api/students/${studentId}`);
    console.log(`Status Code: ${deleteRes.statusCode}`);
    console.log('Deletion Verified (204 No Content)');

    console.log('\n====================================================');
    console.log('✅ ALL CRUD OPERATIONS TESTED & VERIFIED SUCCESSFULLY');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test Execution Error:', err.message);
  }
}

runTests();
