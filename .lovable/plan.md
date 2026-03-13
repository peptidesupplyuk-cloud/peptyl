

# Mobile UX Improvements + Admin Feedback Categories

Four user-reported improvements across the dashboard and admin areas.

---

## 1. Peptide Info Tooltips in Protocols Tab

**Problem:** Users on the Protocols tab don't know what each peptide is without navigating back to the Peptides page.

**Solution:** Add a small (i) icon next to each peptide name in `RecommendationCard` and `ActiveProtocols`. Tapping it opens a tooltip/popover with a one-line description and category badge, sourced from the existing `peptides` data array.

- Create a reusable `PeptideInfoTooltip` component that looks up the peptide by name from `src/data/peptides.ts`
- Shows: name, category badge, and the `description` field (truncated to ~1 sentence)
- Uses the existing Popover component (touch-friendly, works on mobile)
- Integrate into `RecommendationCard` (next to each peptide name) and `ActiveProtocols` (next to each peptide in the list)

---

## 2. Mobile Dashboard Rendering Fixes

**Problem:** Dashboard tab layout breaks or feels cramped on mobile.

**Changes:**
- Fix the `TabsList` overflow -- ensure horizontal scroll works cleanly with proper padding and snap behaviour
- Make carousel items in the Overview and Protocols tabs `basis-full` on small screens (currently `basis-[85%]` which can clip awkwardly)
- Ensure `BiomarkerTrendChart` and `BiomarkerSummary` cards don't overflow on narrow viewports
- Add proper spacing/padding adjustments for mobile in the Overview tab's stacked cards
- Fix any text truncation issues in protocol cards on small screens

---

## 3. Mobile Bottom Navigation Bar

**Problem:** Users find it confusing navigating on mobile with the hamburger menu -- no clear persistent navigator.

**Solution:** Add a sticky bottom navigation bar (visible only on mobile) for the Dashboard page with the key tabs: Overview, Bloodwork, Protocols, Tracker, Profile.

- Create a `MobileTabNav` component that renders a fixed bottom bar with icons + labels
- Only visible on screens < 768px (uses `useIsMobile` hook)
- Syncs with the existing `activeTab` state in `Dashboard.tsx`
- Hides the existing `TabsList` on mobile since the bottom nav replaces it
- Uses the same icons already in the tab triggers (LayoutDashboard, Activity, FlaskConical, CalendarDays, User)

---

## 4. Feedback Categorisation in Admin Dashboard

**Problem:** No way to categorise feedback entries -- all appear as a flat list.

**Solution:** Add a `category` column to the feedback table and allow admins to tag each item.

**Database migration:**
- Add `category` column to the `feedback` table (text, nullable, default null)
- Allowed values: `ui_ux`, `error`, `feature_request`, `not_relevant`, `other`

**Admin UI changes (FeedbackTab):**
- Add category filter buttons at the top (All, UI/UX, Error, Feature Request, Not Relevant, Other)
- Add a small category selector dropdown on each feedback card so admins can tag items
- Show category as a colour-coded badge on each card
- Show count per category in the header

**Optionally update FeedbackBanner** to let users self-categorise when submitting (dropdown with: Bug/Error, Feature Request, UI/UX, Other).

---

## Technical Details

### New files
- `src/components/dashboard/PeptideInfoTooltip.tsx` -- reusable info popover
- `src/components/dashboard/MobileTabNav.tsx` -- bottom nav bar for dashboard

### Modified files
- `src/components/dashboard/RecommendationCard.tsx` -- add info tooltip next to peptide names
- `src/components/dashboard/ActiveProtocols.tsx` -- add info tooltip next to peptide names
- `src/pages/Dashboard.tsx` -- integrate MobileTabNav, hide TabsList on mobile, fix carousel responsive classes
- `src/pages/AdminDashboard.tsx` -- update FeedbackTab with category filter, tag selector, badges
- `src/components/FeedbackBanner.tsx` -- optionally add category dropdown to submission form

### Database migration
```sql
ALTER TABLE public.feedback ADD COLUMN category text DEFAULT null;
```

### Sequencing
1. Database migration (add category column)
2. PeptideInfoTooltip component
3. MobileTabNav component
4. Integrate tooltips into RecommendationCard + ActiveProtocols
5. Update Dashboard.tsx with mobile nav + responsive fixes
6. Update AdminDashboard FeedbackTab with categories
7. Optionally update FeedbackBanner with user-facing category picker

