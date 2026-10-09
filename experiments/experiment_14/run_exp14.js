const { fork } = require('child_process');
const path = require('path');

console.log('🚀 Starting Student REST CRUD Server (port 5000)...');
const serverChild = fork(path.join(__dirname, 'server.js'));

setTimeout(() => {
  console.log('\n🧪 Running CRUD Operations Test Client...\n');
  const testChild = fork(path.join(__dirname, 'test_crud.js'));

  testChild.on('exit', () => {
    console.log('🏁 Experiment 14 finished. Terminating server...');
    serverChild.kill();
    process.exit(0);
  });
}, 3000);
