const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to bypass local ISP / mobile hotspot DNS SRV drop
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://edwinmoses_db_user:EdwinTce@safewalkai.ii0phj7.mongodb.net/studentDB?appName=SafeWalkAI';
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI || 'mongodb://edwinmoses_db_user:EdwinTce@ac-pma7kkj-shard-00-00.ii0phj7.mongodb.net:27017,ac-pma7kkj-shard-00-01.ii0phj7.mongodb.net:27017,ac-pma7kkj-shard-00-02.ii0phj7.mongodb.net:27017/studentDB?ssl=true&replicaSet=atlas-mdo77n-shard-0&authSource=admin&appName=SafeWalkAI';

console.log('====================================================');
console.log('       MONGODB CONNECTION STATUS TERMINAL CHECK     ');
console.log('====================================================\n');
console.log('🔄 Attempting connection to MongoDB Atlas...');

async function checkStatus() {
  const startTime = Date.now();
  let connectedUri = '';

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    connectedUri = 'MongoDB Atlas Cloud (Primary SRV)';
  } catch (err) {
    try {
      await mongoose.connect(MONGODB_DIRECT_URI, { serverSelectionTimeoutMS: 5000 });
      connectedUri = 'MongoDB Atlas Cloud (Direct Shard Bypass)';
    } catch (err2) {
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/studentDB', { serverSelectionTimeoutMS: 3000 });
        connectedUri = 'Local MongoDB (127.0.0.1:27017)';
      } catch (err3) {
        console.log('\n❌ MONGODB CONNECTION STATUS: DISCONNECTED');
        console.log('Error Details:', err3.message);
        process.exit(1);
      }
    }
  }

  const pingMs = Date.now() - startTime;
  const stateMap = { 0: 'Disconnected', 1: 'CONNECTED 🟢', 2: 'Connecting', 3: 'Disconnecting' };
  const readyState = mongoose.connection.readyState;
  const dbName = mongoose.connection.name;
  const host = mongoose.connection.host;

  console.log('\n====================================================');
  console.log(`STATUS         : ${stateMap[readyState]}`);
  console.log(`DATABASE NAME  : ${dbName}`);
  console.log(`TARGET HOST    : ${host}`);
  console.log(`CONNECTION TYPE: ${connectedUri}`);
  console.log(`RESPONSE TIME  : ${pingMs} ms`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

checkStatus();
