
# 🚀 TeamOrbit

> **AI-Powered Collaboration Platform for Student Teams**


🌐 Live Demo: [TeamOrbit](https://team-orbit.vercel.app)

TeamOrbit is a full-stack collaboration platform built to simplify project management for college teams, hackathons, and academic collaborations. It combines task management, team communication, analytics, and AI-powered productivity tools into a single platform.

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based authentication
- User registration and login
- Protected routes
- User profile management

### 👥 Team Management
- Create and manage teams
- Join teams using invite codes
- Team member management
- Role-based collaboration

### 📁 Project Management
- Create and manage projects
- Track project progress
- Assign members
- Deadline management

### ✅ Kanban Task Board
- Drag-and-drop task management
- Task priorities
- Due dates
- Task comments
- Task history

### 💬 Team Chat
- Project-specific conversations
- Message history
- Read status
- Notification support

### 📊 Analytics Dashboard
- Project progress tracking
- Team contribution analysis
- Productivity charts
- Task completion statistics

### 🤖 AI Studio

TeamOrbit includes an AI Studio that helps automate common project activities.

- 📝 Meeting Notes → Tasks
- 📄 Documentation Generator
- 📽 Presentation Generator
- 🎯 Smart Task Suggestions
- ⚠ Deadline Risk Prediction

---

# 🛠 Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## AI Service
- FastAPI
- Google Gemini API

---

# 🏗 Architecture

```
                React Frontend
                       │
                       ▼
            Node.js + Express API
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
     MongoDB Atlas           FastAPI AI Service
                                      │
                                      ▼
                              Google Gemini API
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/TeamOrbit.git
cd TeamOrbit
```

## 2. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../server
npm install
```

### AI Service

```bash
cd ../ai-service
pip install -r requirements.txt
```

---

# ▶️ Run the Project

### Start Backend

```bash
cd server
npm run dev
```

Runs at:

```
http://localhost:8002
```

### Start AI Service

```bash
cd ai-service
python -m uvicorn server:app --reload --port 8001
```

Runs at:

```
http://localhost:8001
```

### Start Frontend

```bash
cd frontend
npm start
```

Runs at:

```
http://localhost:3000
```

---

# 🔑 Environment Variables

### Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8002
```

### Backend (`server/.env`)

```env
PORT=8002
MONGO_URI=your_mongodb_connection
DB_NAME=teamorbit
JWT_SECRET=your_secret
```

### AI Service (`ai-service/.env`)

```env
NODE_BACKEND_URL=http://localhost:8002
GEMINI_API_KEY=your_api_key
```





If you like this project, consider giving it a ⭐..
