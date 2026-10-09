const { execSync } = require('child_process');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  EXPERIMENT 11: CI/CD PIPELINE AUTOMATED SIMULATOR ');
console.log('====================================================\n');

// SCENARIO A: SUCCESSFUL CI/CD PIPELINE PASS
console.log('--- [SCENARIO A: PASSING CODE PUSH TO MAIN BRANCH] ---');
console.log('1. [GitHub Event] Trigger: git push origin main');
console.log('2. [Job 1: CI] Checking out repository...');
console.log('3. [Job 1: CI] Setting up Node.js v20 environment...');
console.log('4. [Job 1: CI] Running "npm test"...');

try {
  const testOutput = execSync('node test/app.test.js', { cwd: __dirname, encoding: 'utf8' });
  console.log(testOutput.trim());
  console.log('\n🟢 [CI RESULT]: build-and-test job SUCCESSFUL (Green Checkmark ✅)');
  
  console.log('\n5. [Job 2: CD] Condition (needs: build-and-test && branch == main) MET');
  console.log('6. [Job 2: CD] Deploying to hosting platform (Render / Vercel)...');
  console.log('🚀 Deployment step executed successfully!');
  console.log('🟢 [CD RESULT]: Deployment COMPLETED (Green Checkmark ✅)');
} catch (err) {
  console.error('❌ Unexpected CI Failure:', err.message);
}

// SCENARIO B: FAILING TEST BLOCKS DEPLOYMENT (PROCEDURE STEP 5)
console.log('\n----------------------------------------------------');
console.log('--- [SCENARIO B: FAILING CODE PUSH - STEP 5 PROCEDURE] ---');
console.log('1. [GitHub Event] Developer pushes code with broken test: add(3, 5) === 9');
console.log('2. [Job 1: CI] Running "npm test"...');

try {
  // Simulate broken assertion
  assert.strictEqual(3 + 5, 9, 'Failing assertion simulation');
} catch (err) {
  console.log('❌ TEST FAILED: Assertion Error: add(3, 5) !== 9');
  console.log('🔴 [CI RESULT]: build-and-test job FAILED (Red Cross ❌)');
  console.log('🚫 [CD RESULT]: deploy job BLOCKED! Deployment did NOT run.');
  console.log('🔒 Merge blocked until test is fixed.');
}

console.log('\n====================================================');
console.log('  ✅ CI/CD PIPELINE WORKFLOW DEMONSTRATION COMPLETE');
console.log('====================================================\n');
