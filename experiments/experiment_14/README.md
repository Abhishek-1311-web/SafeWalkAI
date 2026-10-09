# Experiment No. 14: Implementing a Web Service that Interacts with a Database

## Aim
To implement a RESTful web service in Node.js/Express that stores and retrieves data from a database (MongoDB), completing a real client-service-database chain.

## Software / Tools Required
- Node.js
- Express.js
- Mongoose ODM
- MongoDB Database (Atlas / Local `mongod`)
- Postman / Automated Test Client

---

## Theory
A production web service rarely operates on in-memory data; it persists state in a database so that data survives server restarts and can be shared across multiple clients. This experiment connects the REST layer to the persistence layer (MongoDB) to form a complete backend chain.

---

## Procedure
1. Install dependencies: `npm install express mongoose`.
2. Connect to MongoDB using `mongoose.connect()` when the server starts.
3. Define a Mongoose schema & model for the `Student` resource (`name`, `department`, `cgpa`).
4. Implement REST endpoints (`GET`, `GET` by ID, `POST`, `PUT`, `DELETE`) calling Mongoose methods (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`).
5. Test each endpoint to verify full CRUD persistence.

---

## Code Implementation (`server.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/studentDB');

const studentSchema = new mongoose.Schema({
  name: String,
  department: String,
  cgpa: Number
});
const Student = mongoose.model('Student', studentSchema);

// GET ALL
app.get('/api/students', async (req, res) => res.json(await Student.find()));

// GET BY ID
app.get('/api/students/:id', async (req, res) => {
  const s = await Student.findById(req.params.id);
  s ? res.json(s) : res.status(404).json({ error: 'Not found' });
});

// CREATE (POST)
app.post('/api/students', async (req, res) => {
  const s = await Student.create(req.body);
  res.status(201).json(s);
});

// UPDATE (PUT)
app.put('/api/students/:id', async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});

// DELETE
app.delete('/api/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

app.listen(5000, () => console.log('Student service running on port 5000'));
```

---

## How to Run & Verify

1. Navigate to the experiment directory:
   ```bash
   cd experiments/experiment_14
   npm install
   ```

2. Run automated server and CRUD test suite:
   ```bash
   node run_exp14.js
   ```

---

## REST Endpoints Summary

| HTTP Method | Endpoint | Request Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/students` | `{ "name": "Edwin", "department": "CS", "cgpa": 9.2 }` | `201 Created` | Inserts a new student record |
| `GET` | `/api/students` | *None* | `200 OK` | Retrieves array of all students |
| `GET` | `/api/students/:id` | *None* | `200 OK` / `404` | Retrieves single student by ID |
| `PUT` | `/api/students/:id` | `{ "cgpa": 9.5 }` | `200 OK` | Updates student details by ID |
| `DELETE` | `/api/students/:id` | *None* | `204 No Content` | Removes student record by ID |

---

## Expected Output

```json
👉 STEP 1: Creating new student record (POST /api/students)...
Status Code: 201
Response Body: {
  "_id": "6ac841eedb54e99308fc36f8",
  "name": "Edwin Moses",
  "department": "Computer Science",
  "cgpa": 9.2
}

👉 STEP 2: Fetching all student records (GET /api/students)...
Status Code: 200

👉 STEP 4: Updating student CGPA to 9.5 (PUT /api/students/6ac841eedb54e99308fc36f8)...
Status Code: 200
Updated Record: {
  "_id": "6ac841eedb54e99308fc36f8",
  "name": "Edwin Moses",
  "department": "Computer Science",
  "cgpa": 9.5
}

👉 STEP 5: Deleting student record (DELETE /api/students/6ac841eedb54e99308fc36f8)...
Status Code: 204 No Content
```

---

## Result
A RESTful web service backed by a MongoDB database was implemented, and full CRUD persistence was verified.
