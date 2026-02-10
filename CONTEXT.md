# Project Alu - Context & Progress

## Project Overview
**Project Name:** Alu
**Vision:** YouTube + TikTok + Facebook + AI
**Goal:** A next-gen social network combining long-form video, short-form video, and photos with AI/Human content coexistence and local-first architecture.

## Repos
- **Backend:** https://github.com/Imma2013/Alubackend.git (deployed on Render)
- **Frontend:** https://github.com/Imma2013/Alufrontend.git (deploy to Vercel)

## Current Structure
```
alu-backend/    (Node.js + Express) — ON RENDER, WORKING
alu-frontend/   (Next.js + Tailwind) — ON VERCEL, DEPLOYED (alu-teal-pi.vercel.app)
```

## Tech Stack

### Frontend
- Next.js 16 + Tailwind CSS 4
- Clerk Auth (@clerk/nextjs)
- Dexie.js (IndexedDB for local-first)
- OPFS (local media storage)
- Font: Plus Jakarta Sans
- Brand color: Amber/Gold (#D4A017)

### Backend
- Node.js + Express
- MongoDB Atlas
- Stripe (payments)
- PostHog (analytics)

### AI Services
- NanoBanana/Gemini (images)
- Veo (shorts/videos)
- Gemini Flash as orchestrator/prompt cleaner (conductor.js)

## Daily Limits (Freemium)
| Content Type | Free Tier |
|--------------|-----------|
| Images | 3/day |
| Shorts | 2/day |
| Videos | 1/day |

---

## Milestones

### Phase 1: Foundation (COMPLETED)
- Backend scaffolded with Express
- Frontend scaffolded with Next.js
- Clerk authentication integrated
- Dexie.js and OPFS configured
- Basic AI Orchestra (conductor.js)

### Phase 2: Full Frontend Redesign (IN PROGRESS — UI SHELL COMPLETE)
- [x] Complete app shell with tab-based navigation
- [x] Desktop: Left sidebar (240px) with nav items + Create button
- [x] Mobile: Bottom nav (Home | Shorts | + Create | Videos | Profile)
- [x] Mobile: Top bar (Logo | Search icon | AI/Normal | Notifications | Messages)
- [x] Desktop: Sticky header with Search icon + AI/Normal toggle
- [x] Search bar: Instagram-style — hidden by default, tap search icon to expand, X to close
- [x] Home tab: Stories row + Facebook-style feed with mock data
- [x] Shorts tab: TikTok-style fullscreen vertical video player
- [x] Videos tab: YouTube-style grid layout with thumbnails
- [x] Messages tab: Search + stories + conversation list
- [x] Create tab: Upload + AI generation with type selector (Image/Short/Video)
- [x] Profile tab: Avatar, stats, content tabs (Posts/Shorts/Videos/Likes/Favorites)
- [x] Notifications tab: Grouped by read/unread
- [x] Icons component library (SVG, line + filled variants)
- [x] CSS design system with custom properties
- [x] Build passes (Next.js 16 + TypeScript)

### Phase 2b: Polish & Backend Wiring (DONE 2026-02-09 session 2)
- [x] Removed ALL emojis — replaced with SVG icons (ImageIcon, ZapIcon, FilmIcon, UploadIcon, etc.)
- [x] AI/Normal toggle is now INDEPENDENT toggles (not radio buttons)
  - Both on = mixed feed (default)
  - AI only = tap Normal off
  - Normal only = tap AI off
  - At least one must stay on
- [x] Profile tab now has its own AI/Normal filter below content tabs
- [x] Create tab wired to REAL backend (calls POST /generate, saves to OPFS + Dexie)
- [x] Privacy selector uses clean icon buttons (Globe/Users/Lock) instead of emoji dropdown
- [x] Settings dropdown uses SVG icons (Settings, Lock, LogOut)
- [x] Notifications uses SVG icons (Heart, Profile, Comment, Share) instead of emoji

### Phase 2 — STILL TODO (Wire up real data):
- [ ] Connect HomeTab Feed to real Dexie data (Feed.tsx + db.ts exist, need integration)
- [ ] Pass showAI/showNormal from page.tsx down to feed tabs to actually filter content
- [ ] Connect search to actually search content
- [ ] Hook up Clerk UserButton to Profile tab (currently in sidebar only)
- [ ] Replace mock data with real Dexie queries in all tabs
- [ ] Add real image/video display using MediaItem.tsx + OPFS (code exists)
- [ ] Implement story upload/display
- [ ] Wire up like/comment/share/bookmark to backend
- [ ] Messages: Real-time messaging (not implemented yet)
- [ ] Image cropping on upload (keep it simple like Instagram)

### Phase 3: Polish & Ship
- [ ] Fix Stripe webhook (line 71 in alu-backend/routes/paymentRoutes.js needs uncommenting)
- [ ] Add referral system
- [ ] PWA manifest + service worker
- [ ] Test end-to-end
- [ ] Performance optimization

---

## File Structure (Frontend)

```
alu-frontend/src/app/
├── globals.css              — Design system (CSS vars, animations, scrollbar)
├── layout.tsx               — Root layout (ClerkProvider, Plus Jakarta Sans font)
├── page.tsx                 — MAIN APP SHELL (sidebar, bottom nav, tab routing)
├── db.ts                    — Dexie database schema (posts, syncState)
├── fileSystem.ts            — OPFS helpers (save/get files)
├── syncService.ts           — REST sync (pull/push to backend)
└── components/
    ├── icons.tsx             — SVG icon components (Home, Shorts, Videos, etc.)
    ├── Feed.tsx              — Original feed component (uses Dexie live query)
    ├── GenerationForm.tsx    — AI generation form (calls backend /generate)
    ├── MediaItem.tsx         — Displays media from OPFS blob URLs
    └── tabs/
        ├── HomeTab.tsx       — Stories + Facebook-style feed (MOCK DATA)
        ├── ShortsTab.tsx     — TikTok-style vertical player (MOCK DATA)
        ├── VideosTab.tsx     — YouTube-style grid (MOCK DATA)
        ├── MessagesTab.tsx   — Conversations list (MOCK DATA)
        ├── CreateTab.tsx     — Upload/AI generate (WIRED to backend POST /generate)
        ├── ProfileTab.tsx    — User profile + content grid (MOCK DATA)
        └── NotificationsTab.tsx — Notification list (MOCK DATA)
```

## Design System

### Brand
- **Logo:** "alu" — lowercase, extrabold, Plus Jakarta Sans
- **Primary color:** #D4A017 (amber/gold)
- **Primary light:** #F5D060
- **Primary dark:** #B8860B
- **Background:** #FFFFFF (pure white)
- **Text:** #1A1A1A
- **Text secondary:** #737373
- **Border:** #E8E8E8
- **Surface (cards/inputs):** #F5F5F5

### Layout
- Desktop sidebar: 240px fixed left
- Mobile header: 56px fixed top
- Mobile bottom nav: 64px fixed bottom (with iOS safe area)
- Sticky header: Shows on Home, Shorts, Videos, Profile tabs (NOT Messages, Create, Notifications)

### Key UI Patterns
- AI/Normal toggle: Pill-shaped toggle, active state = amber background + white text
- Create button: Gradient amber, pulse glow animation
- Stories: Horizontal scroll, gradient ring for unseen
- AI badge: Shows on the CONTENT itself (overlay on image/video), NOT next to usernames
- Search: Instagram-style — just an icon in the header, expands into full search bar on tap, X to collapse
- Content filter: AI badge on content thumbnails (dark pill with "AI" text, top-left corner)

---

## Existing Backend Logic (READY TO WIRE UP)
These files in the frontend already have working logic — they just need to be integrated into the new tab components:

1. **GenerationForm.tsx** — Full AI generation flow:
   - Calls `POST /generate` with prompt + type
   - Downloads result to OPFS
   - Saves to Dexie with `synced: 1`
   - Has loading state + error handling

2. **Feed.tsx** — Live feed from Dexie:
   - Uses `useLiveQuery` for real-time updates
   - Has AI/Human filter
   - Runs sync on mount (pull + push)
   - Polls every 60 seconds

3. **MediaItem.tsx** — Displays OPFS media:
   - Gets blob URL from OPFS file handle
   - Handles images + videos
   - Shows loading placeholder
   - Revokes blob URLs on unmount

4. **db.ts** — Dexie schema:
   - Posts table: id, mediaType, timestamp, userId, synced, updatedAt
   - SyncState table: tracks last pull timestamp

5. **syncService.ts** — REST sync:
   - `pullChanges()` — POST /sync/pull, bulk puts to Dexie
   - `pushChanges(token)` — POST /sync/push, marks as synced

---

## Environment Variables Needed
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk key>
CLERK_SECRET_KEY=<clerk secret>
NEXT_PUBLIC_BACKEND_URL=<render backend url>
```

## Deployment Notes
- Backend is on Render (working)
- Frontend is on Vercel (deployed at alu-teal-pi.vercel.app)
- `force-dynamic` is set in layout.tsx (required for Clerk + Next.js 16)
- Build command: `npm run build`
- Output: `.next` directory (standard Next.js)
- Env vars on Vercel: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_BACKEND_URL

---

## Business Model

### Freemium Tiers
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 3 img / 2 shorts / 1 vid per day |
| Pro | $5-10/mo | 10x or unlimited |

### Why Local-First Saves Money
- Users store media on THEIR device (OPFS)
- Backend only handles: metadata sync, AI API calls, hosting
- 10,000 users = minimal cloud storage costs

---

## Session Log

### 2026-02-08: Foundation Fixes (Claude)
- Fixed missing dexie and dexie-react-hooks dependencies
- Fixed imports (components-v2/Feed → components/Feed)
- Cleaned corrupted CONTEXT.md
- Build passes

### 2026-02-09: Full Frontend Redesign (Claude Opus)
- Built complete app shell with tab-based navigation
- Desktop: Left sidebar with all nav items + gradient Create button
- Mobile: Facebook-style top bar + TikTok-style bottom nav
- All 7 tabs built with mock data (Home, Shorts, Videos, Messages, Create, Profile, Notifications)
- Design system: Amber/gold brand color, Plus Jakarta Sans font, white bg
- Icons library: 14 SVG icons with active/inactive variants
- CSS: Custom properties, animations (fadeIn, slideUp, pulseGlow), scrollbar styling
- Build passes on Next.js 16 + TypeScript
- Pushed to https://github.com/Imma2013/Alufrontend.git

### 2026-02-09: Polish & Backend Wiring (Claude Opus, session 2)
- Removed all emojis from UI, replaced with SVG icon components
- AI/Normal toggle changed to independent toggles (both can be active)
- Profile tab gets its own AI/Normal filter for content grid
- Create tab now wired to real backend (POST /generate → OPFS → Dexie)
- Added 8 new SVG icons: ImageIcon, FilmIcon, ZapIcon, UploadIcon, GlobeIcon, LockIcon, UsersIcon, LogOutIcon
- Privacy options changed from emoji dropdown to icon buttons
- NotificationsTab uses SVG icons instead of emoji
- Cleaned emoji from all mock data strings
- Build passes

### 2026-02-09: UX Polish — Session 3 (Claude Opus)
- Search bar changed to Instagram-style: icon only, expands on tap, X to close (both mobile + desktop)
- AI badge REMOVED from next to usernames in feed (was next to profile name, users don't want that)
- AI badge now shows on the CONTENT itself (overlay on image/video, top-left corner, dark pill)
- Profile grid still has AI badge on thumbnails (unchanged, this is correct)
- CONTEXT.md fully updated with all changes
- User feedback: 6 positive reviews from testers, 2 people lined up to upload real videos
- Frontend deployed on Vercel at alu-teal-pi.vercel.app

### 2026-02-09: LAUNCH DAY — Session 4 (Claude Opus)
**Backend:**
- NEW: POST /upload endpoint (Cloudinary + Multer) — users can upload photos/videos up to 100MB
- Cloudinary: auto CDN delivery, video thumbnails via eager transform, 25GB free tier
- Simple rate limiter (10 req/min per IP) on upload endpoint
- Added thumbnailUrl to PostSchema
- Installed: multer, cloudinary

**Frontend — Real Data:**
- HomeTab: replaced ALL mock posts with real Dexie live queries (useLiveQuery)
- HomeTab: syncs on mount + every 60s (pullChanges + pushChanges)
- HomeTab: receives showAI/showNormal props from page.tsx — filtering works
- ProfileTab: shows user's OWN posts from Dexie, filtered by userId from Clerk
- ProfileTab: uses Clerk useUser() for real name, avatar, post count
- CreateTab: Upload mode fully wired — file picker, preview, FormData POST to /upload, saves to OPFS + Dexie
- MediaItem: handles both OPFS local files (own content) and Cloudinary URLs (synced content from others)
- Added saveFileFromBlob() to fileSystem.ts for direct File-to-OPFS save

**UX/Design:**
- SVG logo: AluLogo component (wordmark with spark accent) + AluMark (compact icon mark)
- ShortsTab: vertical swipe gestures (touch start/move/end) like TikTok + mouse wheel on desktop
- Profile tab: search bar + AI/Normal toggles hidden in header (Instagram behavior)
- Dexie schema v3: added videoType, thumbnailUrl, likes, originalPrompt to Post interface

**Deployed:**
- Frontend pushed to Alufrontend.git main → Vercel auto-deploy
- Backend pushed to Alubackend.git main → Render auto-deploy
- User needs to add Cloudinary env vars on Render: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

### NEXT SESSION PRIORITIES:
1. **Test end-to-end**: Upload a real photo, verify it appears in feed for other users
2. **Privacy statement**: User needs to draft before wide launch (REMIND THEM)
3. Connect search to actually work (search across posts, users)
4. Add image cropping on upload (simple, like Instagram)
5. PWA manifest + service worker (app store bypass)
6. Wire ShortsTab + VideosTab to real Dexie data (currently mock)
7. Long video async generation (Veo/Sora polling pattern for 10+ min videos)
8. Likes/comments/share wired to backend (currently local state only)
9. Real-time messaging (post-launch)
10. Stripe webhook completion (user upgrade to Pro on payment)
