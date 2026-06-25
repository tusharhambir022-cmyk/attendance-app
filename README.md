# 📋 AttendanceIQ — Team Attendance Management System

A full-stack attendance tracking app for your startup.
**Backend:** Java Spring Boot + JWT | **Frontend:** React | **Deploy:** Render + Vercel (free)

---

## 🗂️ Project Structure

```
attendance-app/
├── backend/                    # Spring Boot (Java 17)
│   ├── src/main/java/com/attendance/
│   │   ├── config/             # Security, CORS, DataSeeder
│   │   ├── controller/         # REST API endpoints
│   │   ├── dto/                # Request/Response objects
│   │   ├── entity/             # User, Attendance, LeaveRequest
│   │   ├── repository/         # JPA repositories
│   │   ├── security/           # JWT filter & utils
│   │   └── service/            # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties         # Dev (H2 in-memory)
│   │   └── application-prod.properties    # Prod (PostgreSQL)
│   ├── pom.xml
│   └── render.yaml             # Render deployment config
│
└── frontend/                   # React 18
    ├── src/
    │   ├── pages/
    │   │   ├── admin/          # Dashboard, Developers, Attendance, Leaves
    │   │   └── developer/      # Dashboard, Attendance, Leaves
    │   ├── components/shared/  # Sidebar
    │   ├── services/api.js     # Axios API calls
    │   ├── context/AuthContext # JWT auth state
    │   └── hooks/useToast.js   # Notification hook
    ├── public/index.html
    ├── package.json
    └── .env.example
```

---

## ✨ Features

### Admin
- 📊 Dashboard with live today's attendance + pending leaves
- 👥 Add / activate / deactivate developers
- 📅 View all attendance records with date range filter
- ✅ Approve or reject leave requests with comments

### Developer
- 🕐 Live clock with one-click Check In / Check Out
- 📈 Monthly attendance summary (present, absent, hours)
- 🌴 Apply for Sick / Casual / Paid leave
- 📊 Visual leave balance bars

---

## 🚀 Local Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+

### Backend
```bash
cd attendance-app/backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`
H2 Console: `http://localhost:8080/h2-console` (JDBC: `jdbc:h2:mem:attendancedb`)

### Frontend
```bash
cd attendance-app/frontend
cp .env.example .env.local
npm install
npm start
```
Frontend runs at `http://localhost:3000`

---

## 🔑 Default Credentials

| Role      | Email                | Password |
|-----------|----------------------|----------|
| Admin     | admin@company.com    | admin123 |
| Developer | dev1@company.com     | dev123   |
| Developer | dev2@company.com     | dev123   |

**Change these before deploying to production!**

---

## 🌐 Free Deployment (Render + Vercel)

### Step 1 — Deploy Backend on Render

1. Push the `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Environment:** Java
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar -Dspring.profiles.active=prod target/attendance-backend-0.0.1-SNAPSHOT.jar`
5. Add a **PostgreSQL database** (free tier) → Render auto-sets `DATABASE_URL`
6. Add Environment Variables:
   - `JWT_SECRET` → any long random string (e.g. 64 chars)
   - `CORS_ORIGINS` → your Vercel URL (fill after Step 2)
7. Deploy → copy your backend URL: `https://attendance-backend-xxxx.onrender.com`

### Step 2 — Deploy Frontend on Vercel

1. Push the `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import repo
3. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy → copy your Vercel URL

### Step 3 — Update CORS on Render
- Go to Render → your backend → Environment
- Set `CORS_ORIGINS` = your Vercel URL
- Redeploy

✅ Done! Your app is live and free.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login → returns JWT |

### Attendance
| Method | Endpoint | Role |
|--------|----------|------|
| POST | /api/attendance/check-in | Dev |
| POST | /api/attendance/check-out | Dev |
| GET | /api/attendance/today | Dev |
| GET | /api/attendance/my | Dev |
| GET | /api/attendance/my/summary | Dev |
| GET | /api/attendance/admin/today | Admin |
| GET | /api/attendance/admin/all | Admin |

### Leaves
| Method | Endpoint | Role |
|--------|----------|------|
| POST | /api/leaves/apply | Dev |
| GET | /api/leaves/my | Dev |
| GET | /api/leaves/balance | Dev |
| GET | /api/admin/leaves | Admin |
| GET | /api/admin/leaves/pending | Admin |
| PATCH | /api/admin/leaves/{id}/review | Admin |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/users | Create developer |
| GET | /api/admin/developers | List all devs |
| PATCH | /api/admin/users/{id}/toggle | Activate/Deactivate |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security, JPA |
| Database | H2 (dev), PostgreSQL (prod) |
| Auth | JWT (jjwt 0.11.5) |
| Frontend | React 18, React Router 6 |
| HTTP Client | Axios |
| Dates | date-fns |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🔐 Leave Quota (per year)

| Type | Days |
|------|------|
| Sick Leave | 12 |
| Casual Leave | 12 |
| Paid Leave | 18 |
| **Total** | **42** |

To change quotas, edit `LeaveService.java`:
```java
private static final int SICK_LEAVE_QUOTA = 12;
private static final int CASUAL_LEAVE_QUOTA = 12;
private static final int PAID_LEAVE_QUOTA = 18;
```
