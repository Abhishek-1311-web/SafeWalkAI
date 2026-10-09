const assert = require('assert');
const { add, multiply, getAppInfo } = require('../app');

console.log('====================================================');
console.log('       RUNNING CI/CD UNIT TEST SUITE (CI JOB)       ');
console.log('====================================================\n');

try {
  // Test 1: Addition function
  console.log('👉 Test 1: Testing add(3, 5)...');
  const addResult = add(3, 5);
  assert.strictEqual(addResult, 8, 'add(3, 5) should equal 8');
  console.log('   ✅ PASS: add(3, 5) === 8');

  // Test 2: Multiplication function
  console.log('\n👉 Test 2: Testing multiply(4, 2)...');
  const multResult = multiply(4, 2);
  assert.strictEqual(multResult, 8, 'multiply(4, 2) should equal 8');
  console.log('   ✅ PASS: multiply(4, 2) === 8');

  // Test 3: App info health check
  console.log('\n👉 Test 3: Testing getAppInfo()...');
  const info = getAppInfo();
  assert.strictEqual(info.version, '1.0.0', 'version should be 1.0.0');
  console.log('   ✅ PASS: App health check passed');

  console.log('\n====================================================');
  console.log('  ✅ ALL TESTS PASSED SUCCESSFULLY! CI STAGE OK');
  console.log('====================================================\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ TEST FAILED:', err.message);
  console.log('\n====================================================');
  console.log('  ❌ CI STAGE FAILED! DEPLOYMENT BLOCKED');
  console.log('====================================================\n');
  process.exit(1);
}
