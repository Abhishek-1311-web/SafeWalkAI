/**
 * Simple Node.js Application for Experiment 11 (CI/CD Pipeline)
 */

function add(a, b) {
  return Number(a) + Number(b);
}

function multiply(a, b) {
  return Number(a) * Number(b);
}

function getAppInfo() {
  return {
    name: 'CI/CD Demo Application',
    version: '1.0.0',
    status: 'Healthy & Operational'
  };
}

module.exports = { add, multiply, getAppInfo };

if (require.main === module) {
  console.log('🚀 Running CI/CD Demo App...');
  console.log('App Info:', getAppInfo());
}
