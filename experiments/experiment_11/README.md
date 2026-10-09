# Experiment No. 11: Practicing with CI/CD (Continuous Integration and Continuous Deployment)

## Aim
To set up an automated CI/CD pipeline using GitHub Actions that runs tests on every push and deploys the application automatically.

## Software / Tools Required
- A GitHub account and repository
- Git
- Node.js project with a `test` script in `package.json`
- A deployment target (e.g., Render / Netlify / Vercel or a self-hosted server)

**Course Outcome**: CO5  
**Hours Allotted**: 4  

---

## Theory
- **Continuous Integration (CI)**: Automatically builds and tests every code change pushed to the repository, catching integration bugs early before they reach production.
- **Continuous Deployment (CD)**: Automatically ships a build that passes CI to a staging or production environment, eliminating manual release steps.
- **GitHub Actions**: Implements CI/CD using YAML workflow files stored under `.github/workflows/` that react to repository events such as a `push` or `pull_request`.

---

## Procedure
1. Push the Node.js project (with a `package.json` test script) to a GitHub repository.
2. Create the folder `.github/workflows/` in the project root.
3. Add a `ci.yml` workflow that checks out code, sets up Node.js, installs dependencies, and runs the test suite on every push and pull request.
4. Commit and push the workflow file; open the **Actions** tab on GitHub to watch the pipeline run automatically.
5. Introduce a failing test to confirm the workflow correctly fails and blocks merging.
6. Fix the test, then extend the workflow with a `deploy` job that runs only after the `build-and-test` job succeeds on the `main` branch.

---

## Program (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to hosting platform
        run: echo "Deployment step goes here (e.g., Render/Vercel CLI or SSH deploy script)"
```

---

## Code Files (`app.js` & `test/app.test.js`)

### `app.js`
```javascript
function add(a, b) {
  return Number(a) + Number(b);
}

function multiply(a, b) {
  return Number(a) * Number(b);
}

module.exports = { add, multiply };
```

### `test/app.test.js`
```javascript
const assert = require('assert');
const { add, multiply } = require('../app');

assert.strictEqual(add(3, 5), 8);
assert.strictEqual(multiply(4, 2), 8);
console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
```

---

## How to Run & Verify Locally

1. Navigate to the experiment directory:
   ```bash
   cd experiments/experiment_11
   node run_exp11.js
   ```

---

## Expected Output

```text
--- [SCENARIO A: PASSING CODE PUSH TO MAIN BRANCH] ---
1. [GitHub Event] Trigger: git push origin main
2. [Job 1: CI] Checking out repository...
3. [Job 1: CI] Setting up Node.js v20 environment...
4. [Job 1: CI] Running "npm test"...
   ✅ PASS: add(3, 5) === 8
   ✅ PASS: multiply(4, 2) === 8
🟢 [CI RESULT]: build-and-test job SUCCESSFUL (Green Checkmark ✅)

5. [Job 2: CD] Condition (needs: build-and-test && branch == main) MET
6. [Job 2: CD] Deploying to hosting platform (Render / Vercel)...
🟢 [CD RESULT]: Deployment COMPLETED (Green Checkmark ✅)

----------------------------------------------------
--- [SCENARIO B: FAILING CODE PUSH - STEP 5 PROCEDURE] ---
1. [GitHub Event] Developer pushes code with broken test
2. [Job 1: CI] Running "npm test"...
❌ TEST FAILED: Assertion Error: add(3, 5) !== 9
🔴 [CI RESULT]: build-and-test job FAILED (Red Cross ❌)
🚫 [CD RESULT]: deploy job BLOCKED! Deployment did NOT run.
```

---

## Result
A CI/CD pipeline that automatically tests and deploys the application on every push to the main branch was successfully configured using GitHub Actions.
