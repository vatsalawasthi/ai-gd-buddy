# AI GD Buddy — AI-Powered Group Discussion Practice Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47a248)](https://www.mongodb.com/atlas)
[![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-8e75ff)](https://ai.google.dev/)

> **Practice Smarter. Speak Better. Lead Discussions.**  
> An EdTech platform built for college students, MBA aspirants, and job seekers preparing for campus placements, internships, and recruitment group discussions.

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
6. **Placement Topic Library**: 100+ topics covering 12 domains (Artificial Intelligence, Business, Economy, Education, Environment, Current Affairs, etc.) with arguments for and against.
7. **Personalized AI Coach**: Interactive placement coach answering strategy questions (how to initiate, how to disagree politely, how to summarize) contextualized with your performance history.
8. **Student Dashboard & Analytics**: Recharts trend graphs, category radar proficiency, practice time tracking, and chronological session logs.
9. **Role-Based Admin Console**: Comprehensive system monitoring, user metrics, and topic management.

---

## 🏗️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Glassmorphism
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JWT Sessions with secure HTTP-only cookies & bcrypt password hashing
- **AI Engine**: Google Gemini API (`@google/generative-ai`) with structured JSON parsing and intelligent contextual fallback engine

---

## 📁 Project Structure

```
ai-gd-buddy/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/page.tsx
│   ├── ai-coach/page.tsx
│   ├── api/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── coach/
│   │   ├── gd/
│   │   ├── recordings/
│   │   ├── topics/
│   │   └── user/
│   ├── dashboard/page.tsx
│   ├── gd-room/[id]/page.tsx
│   ├── history/page.tsx
│   ├── onboarding/page.tsx
│   ├── practice/page.tsx
│   ├── profile/page.tsx
│   ├── recording-analyzer/page.tsx
│   ├── reports/[id]/page.tsx
│   ├── topics/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/ (Navbar, Footer)
│   └── ui/ (Logo, Buttons)
├── lib/
│   ├── auth.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   ├── AIUsage.ts
│   ├── GDEvaluation.ts
│   ├── GDMessage.ts
│   ├── GDSession.ts
│   ├── GDTopic.ts
│   ├── Recording.ts
│   ├── User.ts
│   └── UserProgress.ts
├── services/
│   ├── ai/ (gemini, participantGenerator, discussionEngine, topicGenerator, coachService)
│   ├── evaluation/ (evaluator)
│   └── recording/ (recordingService)
├── scripts/
│   └── seed.mjs
├── types/
│   └── index.ts
├── middleware.ts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v25 / v20)
- npm or pnpm
- MongoDB Atlas cluster URI (or local MongoDB running on `mongodb://localhost:27017/ai_gd_buddy`)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai_gd_buddy?retryWrites=true&w=majority
MONGODB_DB_NAME=ai_gd_buddy
GEMINI_API_KEY=your_gemini_api_key_here
AUTH_SECRET=ai_gd_buddy_super_secure_jwt_secret_key_change_in_production_2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Verified Topics & Admin Account
```bash
npm run seed
```
This populates:
- **Default Admin Account**: `admin@aigdbuddy.com` / `AdminPass123!`
- **Demo Student Account**: `student@demo.com` / `StudentPass123!`
- 8 verified placement GD topics with detailed arguments for and against.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Core User Journeys

### Journey 1: Registration & Onboarding
1. Visit `/register`, enter Full Name, Email, and Password.
2. Complete the onboarding screen (College, Degree, Placement Goal, Confidence).
3. Land on your personalized Dashboard.

### Journey 2: Simulated GD Room
1. Click **START A NEW GD** or navigate to `/practice`.
2. Select a topic (or click *Generate AI Topic*), set 3 AI participants, 5 minutes.
3. In the live discussion room:
   - Click **Speak (Mic)** to talk through your microphone, or type an argument and press Enter.
   - Watch the active AI participant respond to your argument with voice playback and sound waves.
   - Click **End Discussion** to conclude.

### Journey 3: 7-Pillar Evaluation Report
1. After concluding, the AI assessor processes your contributions.
2. Review your 0-100 overall score and individual pillar breakdown.
3. Read the **What You Could Have Said Instead** section to see stronger executive formulations.
4. Note your **Next 3 Improvement Goals**.

---

## 🔒 Security & Privacy

- Passwords hashed with bcrypt (salt factor 10).
- HTTP-only secure cookies for JWT session management.
- Authorization checks on every protected API route: students can never read or mutate other students' sessions, transcripts, or recordings.
- Dedicated role guards on `/admin` restricting access to `user.role === 'admin'`.
