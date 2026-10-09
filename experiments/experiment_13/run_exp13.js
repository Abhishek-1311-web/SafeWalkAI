const { fork } = require('child_process');
const path = require('path');

console.log('🚀 Starting SOAP Server (port 8000)...');
const soapChild = fork(path.join(__dirname, 'soap_server.js'));

console.log('🚀 Starting REST Server (port 4000)...');
const restChild = fork(path.join(__dirname, 'rest_server.js'));

setTimeout(() => {
  console.log('\n🧪 Running Test Client...\n');
  const testChild = fork(path.join(__dirname, 'test_client.js'));

  testChild.on('exit', () => {
    console.log('🏁 Experiment 13 finished. Terminating servers...');
    soapChild.kill();
    restChild.kill();
    process.exit(0);
  });
}, 1500);
