# Project Alu - Context & Progress

## Project Overview
**Project Name:** Alu
**Vision:** YouTube + TikTok + Facebook + AI
**Goal:** A next-gen social network combining long-form video, short-form video, and photos with AI/Human content coexistence and local-first architecture.

## Current Structure
```
alu-backend/    (Node.js + Express)
alu-frontend/   (Next.js + Tailwind)
```

## Tech Stack

### Frontend
- Next.js 16 + Tailwind CSS
- Clerk Auth
- Dexie.js (IndexedDB for local-first)
- OPFS (local media storage)

### Backend
- Node.js + Express
- MongoDB Atlas
- Stripe (payments)
- PostHog (analytics)

### AI Services
- NanoBanana/Gemini (images)
- Veo (shorts/videos)

## Daily Limits (Freemium)
| Content Type | Free Tier |
|--------------|-----------|
| Images | 3/day |
| Shorts | 2/day |
| Videos | 1/day |

---

## Milestones

### Phase 1: Foundation (Completed)
- Backend scaffolded with Express
- Frontend scaffolded with Next.js
- Clerk authentication integrated
- Dexie.js and OPFS configured
- Basic AI Orchestra (conductor.js)

### Phase 2: Full Redesign (In Progress)
- Complete frontend redesign
- Navigation: Left sidebar + sticky header
- Home: Stories + Facebook-style feed
- Shorts: TikTok-style player
- Videos: YouTube-style player
- Messages: Conversations with stories
- Create: Upload + AI generation + editing
- Profile: Content tabs with AI/Human filter
- Notifications: Standard notifications

---

## Key Features
1. **AI/Human Toggle** - Filter content by AI-generated or Human-created
2. **Local-First** - Data stored locally (Dexie.js + OPFS) for speed and cost savings
3. **Sticky Header** - Search + AI/Human filter always visible
4. **Full Editing** - Crop, rotate, filters, text overlay for images and videos
5. **AI Generation** - Create images, shorts, and videos with AI

---

## Deployment
- **Hosting:** Render.com
- **Database:** MongoDB Atlas (free tier)
- **Target:** PWA for app store bypass
