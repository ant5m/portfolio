# Codex Handoff - Portfolio Website

## Project Snapshot

- Active app is `portfolio/` (Next.js App Router).
- Main experience:
  - Landing page (`/`) with particles and theme toggle.
  - 3D portfolio scene (`/home`) with wall navigation.
  - Music wall contains Spotify-based dashboard and vinyl interaction.
- Target deployment platform: Vercel.

## Current Architecture

- Routing:
  - `app/page.jsx` -> landing
  - `app/home/page.jsx` -> 3D scene
  - `app/api/spotify/route.js` -> Spotify stats endpoint
  - `app/api/preview/route.js` -> universal 30s preview lookup (iTunes search)

- 3D scene:
  - `src/components/3D/Canvas.jsx`
    - About Me hotspots (true 3D click areas)
    - About Me headshot mesh/texture
    - Music wall vinyl mesh/texture
    - Music dashboard visibility state tied to vinyl click

- Music dashboard:
  - `src/components/3D/SpotifyWidget.jsx`
    - 3 dashboard blocks:
      1. Background info
      2. Current featured track
      3. Stats panel
    - Universal preview audio button (no Spotify Premium required)
    - Range controls in both featured and stats sections
    - Independent range state between featured and stats sections
    - Stats view tabs: top songs, top artists, top genres

## What Was Completed In This Session

- Spotify API upgraded to return richer range data and leaderboards.
- Added `/api/preview` for cross-user preview playback.
- Removed regular Spotify SDK playback button from widget UI.
- Converted music widget into fixed 3-column dashboard.
- Added About Me 3D click popups.
- Added headshot frame to About Me wall.
- Added Music vinyl object (`public/matchavinyl.jpg`) with:
  - circular vinyl rendering
  - slow clockwise spin
  - click-to-open Music dashboard
  - hover glow/pointer feedback
- Moved Exit button to top-right in 3D view.
- Hid old About Me overlay panel while keeping other wall panel behavior.
- Added `.next` to `.gitignore` and removed several unused legacy files.

## Important Behavior Notes

- Music dashboard should only appear when:
  - user is on Music wall (`zoomedWall === 'Music'`)
  - zoom animation is complete
  - vinyl has been clicked (`isMusicDashboardOpen === true`)

- Clicking top nav "Music" should only zoom to Music wall, not auto-open dashboard.

- Featured track range and Stats range are intentionally independent:
  - featured uses `featuredRange`
  - stats uses `statsRange`

## Known Technical Debt / Follow-Ups

- `src/components/3D/SpotifyPlayer.jsx` is now effectively unused and can be removed if desired.
- Spotify stats are currently computed from live API pulls per request.
  - Long-term accuracy plan: persist listening events in DB + scheduled sync (Vercel cron).
- Music dashboard styling is functional but can be further polished for responsive breakpoints.

## Environment Variables (Do Not Commit)

Set in `.env.local` and Vercel project env:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## Quick Start Commands

From `portfolio/`:

- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Recommended First Steps Next Session

1. Verify current Music wall behavior in browser:
   - vinyl visible, spinning, hover glow
   - click vinyl opens dashboard only on click
2. Fine-tune vinyl placement/size if needed in `Canvas.jsx`.
3. Optional cleanup:
   - remove unused `SpotifyPlayer.jsx`
   - prune dead imports/files if any remain
4. If proceeding with production data integrity:
   - implement DB-backed Spotify sync + aggregation.

## Files Most Relevant Next Session

- `src/components/3D/Canvas.jsx`
- `src/components/3D/SpotifyWidget.jsx`
- `app/api/spotify/route.js`
- `app/api/preview/route.js`
- `next.config.js`

## Session Update (Latest Conversation)

### High-Level Changes Added

- Reworked multiple wall interactions in `src/components/3D/Canvas.jsx`:
  - Vending wall now opens on vending-machine mesh click (with hover feedback), not automatically from nav zoom.
  - Experience & Skills wall now uses click-to-open behavior via hotspot.
  - Hover accents across major interactive 3D items were unified to green (`#34d399`).
- Added dynamic Photography experience for Vending popup:
  - New API route: `app/api/photography/route.js`.
  - Reads images from `public/film_photos` and `public/favorite_memories` dynamically.
  - Photography panel includes section toggles and image modal/lightbox behavior.
- Added Experience icon system + links:
  - New API route: `app/api/experience-icons/route.js` (kept in repo).
  - Current icon rendering in `Canvas.jsx` is stabilized to local static paths:
    - `/experience_icons/email.jpg`
    - `/experience_icons/linkedin.png`
    - `/experience_icons/github.jpg`
  - Email icon opens in-app email popup (school + personal emails), while LinkedIn/GitHub open external links.
- Added mode-aware environment visuals:
  - Day sky uses `public/sky_texture.jpg`.
  - Night sky uses `public/night_sky.jpg`.
  - Removed old Day/Night floating sky objects (sun/clouds/moon/stars meshes no longer rendered).
  - Floor texture switches by mode:
    - day: `public/flooring.jpg`
    - night: `public/night_floor.jpg`
- Added day/night toggle directly on `/home` in `app/home/page.jsx` (top-left responsive wrapper).

### Camera / Navigation Behavior Updates

- Zoom transitions between walls now follow a smoother arc/eased motion instead of cutting through.
- Added zoom distance caps in OrbitControls for both default and zoom views.
- Tightened vertical orbit limits so users cannot easily get under the map/platform.
- Added wall recenter behavior:
  - User can move camera slightly on a wall.
  - Camera gently recenters after idle.
- Wall-specific camera framing values were introduced (radius/height/look target/azimuth window), especially for About Me.

### Experience Popup Overhaul (In Progress, Active Area)

- Generic Experience bullet popup was replaced with custom `ExperienceShowcasePanel` (centered in UI):
  - Skills bubbles section (larger bubbles + hover grow).
  - Projects section.
  - Experiences section.
  - Resume section with modal PDF preview + Exit + Download.
  - Resume file path:
    - `/experience_icons/Anthony%20Sevilla%20Meza%20Resume%20(6)%20copy.pdf`
- GSAP-based scroll behavior was introduced for section reveal/progression.
- Resume data was used to populate Projects/Experiences content.
- Skills list was expanded to include resume languages/tools/technologies.

### Known Current Risks / Next Debug Targets

- Experience popup animation/polish is still actively evolving and may need refinement:
  - Validate GSAP timing/locking behavior on repeated open/close cycles.
  - Verify visual consistency across screen sizes and dark/light themes.
  - Confirm all expected skills bubbles visibly render in the final panel state.
- `app/api/experience-icons/route.js` is currently present but icon rendering is effectively static-path driven in `Canvas.jsx`; can be kept for future dynamic icon mapping or cleaned up later.

### Additional Files Touched This Session

- `src/components/3D/NightEnvironment.jsx` (now returns `null`).
- `src/components/3D/DayEnvironment.jsx` (now returns `null`).
- `src/toggleButton.jsx` (added `floating` prop to support embedded toggle placement).
- `app/home/page.jsx` (home-level mode toggle placement/styling).

## Session Update (2026-07-10 Evening)

### Interaction + UX fixes

- Improved clickability and hover consistency for top nav controls in `src/components/3D/Canvas.jsx`.
  - Fixed hover styling targeting (`currentTarget`) so the full button surface responds.
  - Resolved overlap issue from `/home` top toggle wrapper by setting wrapper `pointer-events: none` and toggle card `pointer-events: auto` in `app/home/page.jsx`.
- Added top-nav dropdown behavior in `Canvas.jsx`:
  - `Ant's Matcha` dropdown: About Me, Why Matcha, Favorite Matcha Shops.
  - `Experience & Skills` dropdown: Experience & Skills, LinkedIn, GitHub, Email.
  - `Gallery` and `Music` changed to direct click auto-open (no dropdown).
  - Dropdown width matches parent button width.
- Updated nav labels:
  - `About Me` button label -> `Ant's Matcha` (same wall key/behavior under the hood).
  - `Vending` button label -> `Gallery` (same wall key/behavior under the hood).

### Camera + wall behavior

- Refactored zoom camera logic in `ZoomView` to interpolate per-wall camera position + look target, rather than orbiting around global center.
- Updated wall-specific focus values to improve landing angle/framing and recentering.
- Set wall interaction materials to front-facing for key hotspots/icons/vinyl (prevents backside click-through).

### Experience/Projects panel updates

- Major edits to `ExperienceShowcasePanel` in `Canvas.jsx`:
  - Added project links:
    - NBA repo: `https://github.com/ant5m/NBA_pred_model`
    - P-Block repo: `https://github.com/ant5m/Boston-Hacks-F25`
    - P-Block Devpost: `https://devpost.com/software/p-block`
    - Boston Bus repo: `https://github.com/ant5m/506-data-analysis`
  - Added project visuals:
    - Boston Bus image: `public/projects/boston-bus-equity.png`
    - P-Block image: `public/projects/p-block-boston-hacks.png`
  - Experiences now support same card capabilities as projects (optional image + links), and images are positioned to the right of text.
- Added experience images:
  - BU Orientation: `public/projects/bu-orientation.png`
  - KTP President: `public/projects/ktp-lambda-chapter-v2.png`
  - FSA Treasurer: `public/projects/fsa-bu.png`
- Removed progressive "appear on scroll" reveal behavior for Skills/Projects/Experiences/Resume; all sections now render immediately without staged scroll reveal.

### About Me popup content updates

- About Me paragraph consolidated into one paragraph.
- Why Matcha text rewritten and grammar-corrected.
- Favorite Matcha Shops popup switched from static paragraph text to a dynamic list panel component.

### Favorite Matcha Shops data integration

- Added Google Places route:
  - `app/api/google-places/route.js`
  - Supports query payloads per place (`place`, `location`, `area`) and maps results to UI fields.
  - Includes resilient fallback behavior so list still renders even if API key is missing or individual lookups fail.
- Added (and currently still present) Yelp route:
  - `app/api/yelp-places/route.js`
  - No longer used by UI after migration to Google Places.
- Favorite shops list in `Canvas.jsx` now includes:
  - Boston: Matcha Cafe Maiko, Phin Coffee House, Faro, Verveine Cafe, Phinista
  - NJ: Cheongsu NJ
  - NYC: Silence Please
  - Connecticut: Zen Cha Matcha
- UI grouped by area with headings (`Boston`, `NJ`, `NYC`, `Connecticut`) and removed "No rating yet" placeholder text.

### Resume update

- Replaced existing resume asset with:
  - `/Users/anthonysevilla/Downloads/Anthony_Sevilla_Meza_Resume.pdf`
  - Overwrote file at `public/experience_icons/Anthony Sevilla Meza Resume (6) copy.pdf`
- Removed resume intro sentence ("Open the embedded resume preview and download directly from the modal.").

### Performance pass

- Added safe performance tweaks in `Canvas.jsx`:
  - Canvas `dpr={[1, 1.5]}`
  - Canvas `gl={{ antialias: false, powerPreference: 'high-performance' }}`
  - Reduced vinyl geometry segment counts (circle/ring/circle center) to lower GPU work with minimal visual impact.

### New/updated env vars to track

- Existing Spotify vars remain required:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `SPOTIFY_REFRESH_TOKEN`
- New for matcha shops Google metadata:
  - `GOOGLE_MAPS_API_KEY`

### Files touched in this session (new or substantially changed)

- `src/components/3D/Canvas.jsx`
- `app/home/page.jsx`
- `app/api/google-places/route.js` (new)
- `app/api/yelp-places/route.js` (added during transition; currently unused by UI)
- `public/projects/boston-bus-equity.png` (new)
- `public/projects/p-block-boston-hacks.png` (new)
- `public/projects/ktp-lambda-chapter.png` (replaced)
- `public/projects/ktp-lambda-chapter-v2.png` (new, active)
- `public/projects/bu-orientation.png` (new)
- `public/projects/fsa-bu.png` (new)

## Session Update (2026-07-11 Late Night)

### UI/theme updates

- Applied broad retro UI styling pass across app overlays/panels with:
  - light mode: layered green shades
  - dark mode: layered purple shades
- Updated multiple panel/button styles in:
  - `src/components/3D/Canvas.jsx`
  - `src/components/3D/SpotifyWidget.jsx`
  - `app/page.jsx`
  - `app/home/page.jsx`
  - `src/App.css`
- Added/adjusted global typography and icon branding:
  - tab title updated to `Ant's Matcha` in `app/layout.jsx`
  - browser tab icon set via `app/icon.png`
  - custom font wired through `src/App.css` (`public/fonts/Seona-DEMO.otf`)

### Music dashboard content updates

- Updated Music dashboard background copy for grammar/content in `src/components/3D/SpotifyWidget.jsx`.
- Added Spotify profile link in dashboard background info section:
  - `https://open.spotify.com/user/awesometony1234?si=297edd3fe99944e4`
- Removed link underline per UI request.

### API/data cleanup

- Removed Google Places dependency from active UI flow:
  - deleted `app/api/google-places/route.js`
  - `FavoriteMatchaShopsPanel` now uses static local list data
- `GOOGLE_MAPS_API_KEY` is no longer required for current app behavior.

### Deploy/build fixes

- Resolved Vercel install failure caused by React Three peer mismatch:
  - downgraded `@react-three/drei` to `^9.122.0` to match `@react-three/fiber@^8.16.0`
- Verified `next build` succeeds after dependency alignment.

### 3D floor work (active tuning area)

- Floor texture rendering logic in `CustomFloor` was iterated several times for reliability/quality:
  - loader/caching adjustments
  - plane sizing changes
  - texture filtering/anisotropy tuning
- If floor rendering appears inconsistent in local dev after edits, reset dev cache first:
  1. stop dev server
  2. delete `.next`
  3. restart dev (`npm run dev`)

### Dev-server stability notes

- Encountered repeated local Next dev watcher issues (`EMFILE: too many open files`) when multiple dev servers were running.
- More stable local startup used during troubleshooting:
  - `WATCHPACK_POLLING=true npm run dev --prefix "portfolio"`
