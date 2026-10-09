# SafeWalk AI - Walk with Confidence, Powered by AI 🛡️

SafeWalk AI is a comprehensive personal safety and intelligent navigation web application designed to protect pedestrians, women, and vulnerable travelers with real-time risk assessment, emergency SOS broadcasts, safe route navigation, and guardian telemetry.

---

## 🚀 Architecture Overview

1. **Node.js & Express Gateway & Analytical Engine (`WEB APPLICATION`)**:
   - Built on Express.js with a **fail-closed connection to MongoDB Atlas**.
   - Password hashing via `bcryptjs` and token signing via `jsonwebtoken` (JWT).
   - **Native Spatial Analytics**: Multi-criteria spatial routing (`/api/analytics/safe-route`), risk and lighting heatmaps (`/api/analytics/heatmap`), and zone metrics (`/api/analytics/zones`).
   - **Role-Based Access Control (RBAC)**:
     - **Admin**: User lifecycle management (`/api/admin/users`), incident verification (`/api/admin/crimes/:id/verify`), cluster metrics.
     - **Standard User**: Emergency SOS alerts (`/api/sos`), incident reporting (`/api/crimes`), emergency contacts (`/api/contacts`).
   - Serves the Single Page Application frontend with standard hash-bang (`#!`) routing.

2. **AngularJS Single Page Application Frontend (`WEB APPLICATION/pages/index.html`)**:
   - Standard hash-bang routing (`$locationProvider.hashPrefix('!')`) with route guards.
   - JWT HTTP Interceptor automatically passing `Authorization: Bearer <token>`.
   - Direct `$scope` form bindings and dynamic view filters (`roleBadge`, `roleLabel`, `phoneFormat`, `severityBadge`).
   - Dedicated **Admin Operations Center** (`#!/admin`).

---

## 🛠️ How to Run the Application on Any Machine

### Step 1: MongoDB Atlas IP Access (One-Time Check)
Ensure your current IP address (or `0.0.0.0/0` for universal development access) is added to your MongoDB Atlas cluster:
- Log in to [cloud.mongodb.com](https://cloud.mongodb.com) -> **Security** -> **Network Access** -> Ensure **Allow Access from Anywhere (`0.0.0.0/0`)** is active.

### Step 2: Start Node.js Express Gateway
Open a terminal and run:
```bash
cd "WEB APPLICATION"
npm install
node js/server.js
```
*The server will start on **`http://localhost:8000`**.*

---

## 🌐 Accessing the Application

Open your browser and navigate to:
👉 **`http://localhost:8000/`** (or **`http://localhost:8000/#!/landing`**)

### Pre-Configured Demo Accounts (Stored in MongoDB Atlas)

| Role | Email | Password | Available Features |
|---|---|---|---|
| **Administrator** | `admin@safewalk.ai` | `Admin@123` | User lifecycle management, toggle user roles, delete accounts, verify crime reports |
| **Standard User** | `edwinmoses@student.tce.edu` | `Edwin@123` | Dashboard, safe route planning, emergency SOS trigger, report incidents, contacts |

---

## 📁 Clean Sharing / Zipping Guidelines

When creating a zip archive to share with another user, **DO NOT include**:
- `WEB APPLICATION/node_modules/` *(Recipient runs `npm install`)*

*A `.gitignore` and `.env.example` are provided in the repository.*
