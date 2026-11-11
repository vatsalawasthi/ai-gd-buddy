# AI GD Buddy — AI-Powered Group Discussion Practice Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47a248)](https://www.mongodb.com/atlas)
[![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-8e75ff)](https://ai.google.dev/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000)](https://vercel.com/)

> **Practice Smarter. Speak Better. Lead Discussions.**  
> An enterprise-grade AI EdTech platform built for college students, MBA aspirants, and job seekers preparing for campus placements, internships, and recruitment group discussions.

---

## 🌟 Core Features

1. **AI GD Simulator**: Multi-person simulated group discussions with 2 to 5 dynamic AI participants exhibiting distinct behavioral archetypes (*Analytical Speaker, Confident Initiator, Critical Thinker, Balanced Mediator, Strategic Observer*).
2. **Interactive Microphone & Voice Playback**: Real-time voice capture via browser Web Speech API, interim transcription, editable speech buffer, and text-to-speech audio synthesis.
3. **Transparent 7-Pillar Performance Evaluation**:
   - **Communication Skills** (20%)
   - **Content Quality** (20%)
   - **Confidence** (15%)
   - **Listening Skills** (15%)
   - **Leadership Skills** (10%)
   - **Participation** (10%)
   - **Language & Fluency** (10%)
4. **"What You Could Have Said Instead"**: Automatically extracts candidate quotes from the transcript and generates high-scoring executive rephrasings.
5. **Real GD Recording Analyzer**: Upload offline audio recordings (MP3, WAV, M4A, MP4) of college mock GDs for automated transcription, diarization, and speaker-isolated evaluation.
6. **Curated Placement Topic Library**: Rich domain coverage across Artificial Intelligence, Business, Economy, Education, Environment, and Current Affairs with arguments for and against.
7. **Personalized AI Coach**: Interactive placement coach answering strategy questions (how to initiate, how to disagree diplomatically, how to summarize) contextualized with your performance history.
8. **Student Dashboard & Analytics**: Recharts trend graphs, category radar proficiency, practice time tracking, and chronological session logs.
9. **Role-Based Admin Console**: Comprehensive system monitoring, user metrics, and topic management.

---

## 🏗️ Production Architecture

```
                  ┌───────────────────────────────┐
                  │       Vercel (Frontend)       │
                  │   Next.js UI, Pages, SSR/SSG  │
                  └───────────────┬───────────────┘
                                  │ (API Rewrites / CORS)
                                  ▼
                  ┌───────────────────────────────┐
                  │       Render (Backend)        │
                  │   Node Web Service, Next APIs │
                  │     AI Turn Engine & Scoring  │
                  └───────┬───────────────┬───────┘
                          │               │
                          ▼               ▼
           ┌──────────────────────┐   ┌───────────────────────┐
           │ MongoDB Atlas (Cloud)│   │   Google Gemini API   │
           │  8 Collections Mongoose   │   │  LLM Turn Generation  │
           └──────────────────────┘   └───────────────────────┘
```

---

## 🚀 Deployment Guide

### 1. Database: MongoDB Atlas Setup
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Deploy a free **M0 (Shared)** cluster.
3. In **Database Access**, create a database user (e.g. `gd_admin`) with a secure password.
4. In **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** and copy your URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ai_gd_buddy?retryWrites=true&w=majority
   ```
6. Seed curriculum GD topics directly into your cluster:
   ```bash
   npm run seed
   ```
7. *(Optional)* Create your initial admin user:
   ```bash
   node scripts/create-admin.mjs your-email@domain.com YourPassword123! "Your Name"
   ```

---

### 2. Backend: Render Deployment
1. Sign up / log in to [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `vatsalawasthi/ai-gd-buddy`.
4. Configure service settings:
   - **Name**: `ai-gd-buddy-backend`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables** in the Render Dashboard:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://...` (Your MongoDB Atlas connection string) |
   | `MONGODB_DB_NAME` | `ai_gd_buddy` |
   | `AUTH_SECRET` | `generate-a-strong-random-32-char-secret-string` |
   | `GEMINI_API_KEY` | *(Your Google Gemini API Key from Google AI Studio)* |
   | `NEXT_PUBLIC_APP_URL` | *(Your Vercel URL once deployed, e.g. `https://ai-gd-buddy.vercel.app`)* |
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g. `https://ai-gd-buddy-backend.onrender.com`).

---

### 3. Frontend: Vercel Deployment
1. Sign up / log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `vatsalawasthi/ai-gd-buddy`.
4. Framework Preset: **Next.js** (auto-detected).
5. Add **Environment Variables** in Vercel:
   | Key | Value | Description |
   |---|---|---|
   | `BACKEND_URL` | `https://ai-gd-buddy-backend.onrender.com` | Proxies `/api/*` requests to your Render backend |
   | `AUTH_SECRET` | *(Same secret as configured on Render)* | Used for JWT cookie verification in middleware |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Base client URL |
6. Click **Deploy**.
7. In ~60 seconds, your production frontend is live on Vercel!

---

## 💻 Running Locally

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/vatsalawasthi/ai-gd-buddy.git
   cd ai-gd-buddy
   npm install
   ```

2. **Configure `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ai_gd_buddy?retryWrites=true&w=majority
   MONGODB_DB_NAME=ai_gd_buddy
   AUTH_SECRET=local_development_jwt_secret_key_minimum_32_chars
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Seed Database Topics**:
   ```bash
   npm run seed
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## 🔒 Security Architecture

- **Password Hashing**: bcrypt with 10 salt rounds.
- **Session Security**: Stateless signed JWT stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Route Protection**: Next.js Edge Middleware guarding protected placement areas (`/dashboard`, `/practice`, `/gd-room`, `/reports`, `/history`, `/admin`).
- **Input Validation**: Strict schema-level validation via Mongoose ODM and sanitization across all API endpoints.

---

## 📄 License

MIT License © 2026 AI GD Buddy.
