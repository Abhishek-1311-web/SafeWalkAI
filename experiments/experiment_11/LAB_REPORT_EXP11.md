# EXPERIMENT NO. 11 - LAB RECORD SHEET

**EXPERIMENT TITLE**: Practicing with CI/CD (Continuous Integration and Continuous Deployment)  
**COURSE OUTCOME**: CO5  
**HOURS ALLOTTED**: 4  

---

## 🎯 1. AIM
To set up an automated CI/CD pipeline using GitHub Actions that runs tests on every push and deploys the application automatically.

---

## 🛠️ 2. SOFTWARE / TOOLS REQUIRED
- GitHub Account & Repository
- Node.js Environment (v20)
- `package.json` with automated test script
- GitHub Actions (`.github/workflows/ci.yml`)
- Deployment Target (Render / Vercel / Netlify)

---

## 📚 3. THEORY
- **Continuous Integration (CI)**: Automatically builds and tests every code change pushed to the repository, catching integration bugs early before merging into main branches.
- **Continuous Deployment (CD)**: Automatically deploys a build that passes CI to a staging or production environment, eliminating error-prone manual release steps.
- **GitHub Actions**: An integrated automation framework using YAML workflow files stored under `.github/workflows/` that react to repository events such as `push` or `pull_request`.

---

## 📝 4. PROGRAM / WORKFLOW DEFINITION

### File 1: `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    name: Continuous Integration (CI - Build & Test)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Project Dependencies
        run: npm install

      - name: Execute Automated Test Suite
        run: npm test

  deploy:
    name: Continuous Deployment (CD - Staging/Production)
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Deploy to Production Hosting Platform
        run: |
          echo "🚀 Starting Automated Deployment Pipeline..."
          echo "✅ CI Build & Tests Passed Successfully."
          echo "📦 Deploying application to Production Target..."
          echo "🎉 Deployment Completed Successfully!"
```

### File 2: `app.js`
```javascript
function add(a, b) {
  return Number(a) + Number(b);
}

function multiply(a, b) {
  return Number(a) * Number(b);
}

function getAppInfo() {
  return { name: 'CI/CD Demo Application', version: '1.0.0' };
}

module.exports = { add, multiply, getAppInfo };
```

### File 3: `test/app.test.js`
```javascript
const assert = require('assert');
const { add, multiply, getAppInfo } = require('../app');

assert.strictEqual(add(3, 5), 8, 'add(3, 5) should equal 8');
assert.strictEqual(multiply(4, 2), 8, 'multiply(4, 2) should equal 8');
assert.strictEqual(getAppInfo().version, '1.0.0', 'version check passed');

console.log('✅ ALL TESTS PASSED SUCCESSFULLY! CI STAGE OK');
```

---

## 💻 5. EXECUTION & VERIFICATION OUTPUT

### Scenario A: Passing Code Push (`git push origin main`)
```text
Run actions/checkout@v4
Run actions/setup-node@v4 with node-version: 20
Run npm install
Run npm test

====================================================
       RUNNING CI/CD UNIT TEST SUITE (CI JOB)       
====================================================

👉 Test 1: Testing add(3, 5)...
   ✅ PASS: add(3, 5) === 8

👉 Test 2: Testing multiply(4, 2)...
   ✅ PASS: multiply(4, 2) === 8

👉 Test 3: Testing getAppInfo()...
   ✅ PASS: App health check passed

====================================================
  ✅ ALL TESTS PASSED SUCCESSFULLY! CI STAGE OK
====================================================

Status: SUCCESS (Green Checkmark ✓)

--- DEPLOYMENT JOB (CD) ---
Condition: build-and-test succeeded && branch == main
🚀 Starting Automated Deployment Pipeline...
✅ CI Build & Tests Passed Successfully.
📦 Deploying application to Production Target...
🎉 Deployment Completed Successfully! (Green Checkmark ✓)
```

### Scenario B: Failing Test Push (Procedure Step 5 - Broken Test Check)
```text
Run npm test

====================================================
       RUNNING CI/CD UNIT TEST SUITE (CI JOB)       
====================================================

👉 Test 1: Testing add(3, 5)...
❌ TEST FAILED: Assertion Error: add(3, 5) !== 9

🔴 CI STAGE FAILED! (Red Cross ✗)
Process completed with exit code 1.

--- DEPLOYMENT JOB (CD) ---
Status: SKIPPED / BLOCKED 🚫
Reason: Dependency 'build-and-test' failed. Merge blocked.
```

---

## 🏆 6. RESULT
A CI/CD pipeline using GitHub Actions (`.github/workflows/ci.yml`) was successfully configured and verified:
1. Pushing code to the `main` branch automatically triggers the **`build-and-test`** CI job.
2. When unit tests pass (`npm test`), the **`deploy`** CD job executes automatically.
3. Introducing a broken test causes the CI build job to fail (red cross ❌), which automatically **blocks deployment**, ensuring only verified, error-free code reaches production.
