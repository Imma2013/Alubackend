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
- NanoBanana Pro / `gemini-3-pro-image-preview` (images — via Gemini API generateContent)
- Veo 3.1 / `veo-3.1-generate-preview` (shorts — via Gemini API generateVideos)
- Sora 2 via piapi.ai (long video clips — storyboard mode, falls back to Veo 3.1)
- Gemini Flash 2.0 as orchestrator/prompt cleaner + scene splitter (conductor.js)
- FFmpeg via ffmpeg-static (video stitching/concatenation)

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
    ├── icons.tsx             — SVG icon components (Home, Shorts, Videos, Shield, FileText, etc.)
    ├── Feed.tsx              — Original feed component (uses Dexie live query)
    ├── GenerationForm.tsx    — AI generation form (calls backend /generate)
    ├── MediaItem.tsx         — Displays media from OPFS + Cloudinary URLs
    ├── PrivacyPolicy.tsx     — Full-page privacy policy overlay
    ├── TermsConditions.tsx   — Full-page terms & conditions overlay
    └── tabs/
        ├── HomeTab.tsx       — Real Dexie feed with sync (no mock data)
        ├── ShortsTab.tsx     — TikTok-style vertical player (real Dexie data)
        ├── VideosTab.tsx     — YouTube-style grid (real Dexie data)
        ├── MessagesTab.tsx   — Empty state with search bar (post-launch feature)
        ├── CreateTab.tsx     — Upload + AI generate with AI self-label toggle
        ├── ProfileTab.tsx    — Real user profile + Privacy/Terms overlays
        └── NotificationsTab.tsx — Empty state (post-launch feature)
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

### 2026-02-10: Launch Polish — Session 5 (Claude Opus)
**AI Content Self-Label:**
- Added "AI Generated" toggle button in CreateTab upload mode (below file preview, before caption)
- isAI state defaults to false, resets on clearFile() and successful upload
- FormData sends is_ai: 'true'/'false' to backend
- Backend uploadRoutes.js now reads is_ai from req.body (was hardcoded false)

**Mock Data Removal — ALL fake usernames/data removed:**
- HomeTab: removed MOCK_STORIES array + entire stories row + divider
- ShortsTab: removed MOCK_SHORTS, now uses useLiveQuery from Dexie (mediaType=video, videoType=short)
- ShortsTab: removed white scroll indicator (the right-side dots)
- ShortsTab: shows real video content via MediaItem, empty state when no shorts
- VideosTab: removed MOCK_VIDEOS, now uses useLiveQuery from Dexie (videoType=long)
- VideosTab: shows real thumbnails via thumbnailUrl or MediaItem, empty state when no videos
- MessagesTab: removed MOCK_STORIES + MOCK_CONVERSATIONS, shows empty state with search bar (kept for future)
- NotificationsTab: removed MOCK_NOTIFICATIONS + NotifIcon helper, shows empty state

**Privacy Policy + Terms & Conditions:**
- NEW: PrivacyPolicy.tsx — full-page overlay with back button, scrollable content, user's drafted text
- NEW: TermsConditions.tsx — same pattern, user's Terms text including AI liability clauses
- ProfileTab settings dropdown: removed "Settings" text button, now shows Privacy / Terms & Conditions / Log Out
- Clicking Privacy or Terms opens the respective full-page overlay

**Sign-In Screen:**
- page.tsx: imports useUser + SignInButton from @clerk/nextjs
- If user not signed in: shows Alu logo + "Welcome to Alu" + sign-in button (modal mode)
- Prevents unauthenticated users from seeing the app shell

**New Icons:**
- ShieldIcon (privacy, shield outline) added to icons.tsx
- FileTextIcon (terms, document with lines) added to icons.tsx

**Build:** passes clean on Next.js 16 + TypeScript

### 2026-02-10: Fix Everything + Video Stitching — Session 6 (Antigravity)

**Phase 0 — Restored Missing Frontend Scaffolding:**
- 8 critical files were missing from git (never committed): package.json, layout.tsx, globals.css, syncService.ts, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs
- Copied from Claude worktree, added NEXT_PUBLIC_BACKEND_URL to .env.local
- npm install + npm run build passes

**Phase 1 — Fixed Broken UI Features:**
- Log Out: added `signOut()` handler via `useClerk()` in ProfileTab.tsx
- Edit Profile: NEW EditProfile.tsx overlay — edit display name, bio (stored in Clerk unsafeMetadata), profile photo upload
- Share Profile: copies profile link to clipboard with "Copied!" toast
- Removed 4 fake notification/message badges from page.tsx (mobile + desktop)
- Profile shows real bio from Clerk `unsafeMetadata.bio`

**Phase 2 — Fixed AI Generation (conductor.js rewrite):**
- Images: NanoBanana Pro (`gemini-3-pro-image-preview`) via `generateContent` with `responseModalities: ['IMAGE']` → base64 → Cloudinary upload
- Shorts: Veo 3.1 (`veo-3.1-generate-preview`) via `generateVideos` → async polling → Cloudinary upload
- Long videos: redirects to stitching pipeline (POST /generate/long-video)
- Added `visibility` field to PostSchema (everyone/followers/private)
- Added `caption`, `status` fields to PostSchema
- Privacy/visibility wired end-to-end: CreateTab → backend → database → feed filtering
- NEW: GET /usage endpoint — returns real daily usage counts + limits
- CreateTab shows real remaining counts (not hardcoded)
- Sync pull now filters by visibility: 'everyone' only
- Feed endpoint filters by visibility: 'everyone' only

**Phase 3 — 5-Minute Video Stitching Pipeline:**
- NEW: services/videoJobs.js — in-memory job queue with status tracking (queued → splitting_scenes → generating_clips → stitching → uploading → complete/failed)
- NEW: services/videoStitcher.js — full pipeline:
  1. Gemini Flash splits prompt into N scene descriptions
  2. Sora 2 (piapi.ai) generates each 8s clip (falls back to Veo 3.1)
  3. FFmpeg (via ffmpeg-static npm package) concatenates clips
  4. Cloudinary uploads final video
- NEW: POST /generate/long-video — creates background job, returns jobId
- NEW: GET /generate/status/:jobId — real-time progress polling (auth-protected)
- CreateTab: long video mode uses polling with visual progress bar (percentage + step label)
- Installed: uuid, ffmpeg-static

**New Files:**
- alu-frontend/src/app/components/EditProfile.tsx
- alu-backend/services/videoJobs.js
- alu-backend/services/videoStitcher.js

**Modified Files:**
- alu-backend/services/conductor.js (full rewrite — NanoBanana Pro + Veo 3.1)
- alu-backend/config/db.js (PostSchema: visibility, caption, status)
- alu-backend/server.js (usage endpoint, long-video endpoints, visibility filtering)
- alu-backend/routes/uploadRoutes.js (visibility + caption)
- alu-backend/routes/syncRoutes.js (visibility-filtered pull)
- alu-frontend/src/app/page.tsx (removed fake badges)
- alu-frontend/src/app/db.ts (Post interface: visibility, caption)
- alu-frontend/src/app/components/tabs/ProfileTab.tsx (signOut, edit profile, share, real bio)
- alu-frontend/src/app/components/tabs/CreateTab.tsx (visibility, usage, long video progress)

**Build:** Frontend passes `npm run build`, backend passes all syntax checks

### NEXT SESSION PRIORITIES:
1. **Follow/Friend system**: Follow schema in MongoDB, follow/unfollow endpoints, Follow button on profiles, real follower/following counts
2. **User profile viewing**: Tap someone's avatar in feed/shorts to see their profile + Follow button
3. **Search per section**: Feed search filters feed posts, Shorts search filters shorts (TikTok-style 2-column), Videos search filters videos, Messages search finds users
4. **Full messaging**: Chat interface when tapping a user, text + image upload in chats (normal + AI), same daily rate limits for AI images in chat
5. **Content sharing/links**: Copy link to share content anywhere on the platform and externally
6. **Stripe Pro upgrade**: $10/month, wire webhook to actually upgrade user isPro status
7. **Stories**: Upload photo stories (from camera roll), plus button on profile pic, swipe through
8. **PWA manifest + service worker**
9. **Likes/comments/share wired to backend**
