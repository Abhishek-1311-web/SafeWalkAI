const express = require('express');
const app = express();

app.use(express.json());

// REST POST Endpoint for Add operation
app.post('/api/add', (req, res) => {
  const { a, b } = req.body;
  console.log('[REST Server] Received POST /api/add body:', req.body);
  const result = Number(a) + Number(b);
  console.log(`[REST Server] Calculated ${a} + ${b} = ${result}`);
  res.json({ result: result });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ REST Service is running on http://localhost:${PORT}/api/add`);
});
