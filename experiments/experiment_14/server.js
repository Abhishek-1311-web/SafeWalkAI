const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to bypass local ISP / mobile hotspot DNS SRV drop
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.log('Notice: Custom DNS resolver assignment bypassed.');
}

const app = express();
app.use(express.json());

// MongoDB Connection URIs (Atlas SRV + Direct Shard Carrier Bypass + Local Fallback)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://edwinmoses_db_user:EdwinTce@safewalkai.ii0phj7.mongodb.net/studentDB?appName=SafeWalkAI';
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI || 'mongodb://edwinmoses_db_user:EdwinTce@ac-pma7kkj-shard-00-00.ii0phj7.mongodb.net:27017,ac-pma7kkj-shard-00-01.ii0phj7.mongodb.net:27017,ac-pma7kkj-shard-00-02.ii0phj7.mongodb.net:27017/studentDB?ssl=true&replicaSet=atlas-mdo77n-shard-0&authSource=admin&appName=SafeWalkAI';

function printTerminalStatus(connectionType) {
  const readyState = mongoose.connection.readyState;
  const stateLabel = readyState === 1 ? 'CONNECTED 🟢' : 'DISCONNECTED 🔴';
  console.log('\n====================================================');
  console.log('         MONGODB CONNECTION TERMINAL STATUS         ');
  console.log('====================================================');
  console.log(`STATUS          : ${stateLabel}`);
  console.log(`DATABASE        : ${mongoose.connection.name}`);
  console.log(`HOST            : ${mongoose.connection.host}`);
  console.log(`CONNECTION TYPE : ${connectionType}`);
  console.log('====================================================\n');
}

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    printTerminalStatus('MongoDB Atlas Cloud (Primary SRV)');
  } catch (srvErr) {
    console.log('⚠️ Primary SRV connection failed, attempting Direct Shard connection...');
    try {
      await mongoose.connect(MONGODB_DIRECT_URI);
      printTerminalStatus('MongoDB Atlas Cloud (Direct Shard Bypass)');
    } catch (directErr) {
      console.log('⚠️ Direct Shard connection failed, trying local MongoDB...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/studentDB');
        printTerminalStatus('Local MongoDB (127.0.0.1:27017)');
      } catch (localErr) {
        console.error('❌ MONGODB CONNECTION FAILED:', localErr.message);
      }
    }
  }
}

connectToDatabase();

// DB Status API Endpoint
app.get('/api/db-status', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name,
    host: mongoose.connection.host
  });
});

// Student Schema & Model Definition
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  cgpa: { type: Number, required: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// 1. GET ALL STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET STUDENT BY ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Invalid Student ID format' });
  }
});

// 3. CREATE NEW STUDENT (POST)
app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. UPDATE STUDENT BY ID (PUT)
app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. DELETE STUDENT BY ID (DELETE)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Student service running on port ${PORT}`));
