

## Functionality Audit & User Retention Plan

### Problem Summary
1. **AdherenceTracker + heatmap dropped from UI** — the component exists but is no longer rendered anywhere in the Dashboard. It was removed when the "injections" (Tracker) tab was simplified to only show `TodaysPlan` + `ActiveProtocols`.
2. **AdherenceSummary** is imported in Dashboard but only referenced in the overview — need to verify it's actually rendered.
3. **Adherence calculation logic** needs review for frequency-aware correctness (weekly peptide = 1 dose/week, not 7 missed).
4. **No real users yet** — need a concrete acquisition plan.

---

### Part 1: Restore Missing Adherence Components

**Tracker tab** (currently lines 1043-1047 in Dashboard.tsx):
- Re-add `AdherenceTracker` below `TodaysPlan` and `ActiveProtocols` in the "injections" TabsContent
- This restores the 90-day heatmap, per-peptide adherence bars, stat cards, and dose log

**Overview tab**:
- Verify `AdherenceSummary` is rendered (it's imported but may have been removed from JSX during refactors)

---

### Part 2: Fix Adherence Calculation Logic

Current issue: The backfill mechanism (`backfillMissingDays`) creates a `scheduled` injection log for every peptide every day, regardless of frequency. A user on weekly semaglutide gets 7 `scheduled` rows per week — 6 show as "missed", tanking adherence to ~14%.

**Fix in `use-injections.ts` `backfillMissingDays`**:
- Before inserting a backfill row, call `isDueToday()` (already exists at line 24) for each past date
- Only insert `scheduled` rows for dates the peptide was actually due
- This ensures: weekly peptide + 1 completion = 100% adherence

**Fix in `useTodayInjections` auto-generation**:
- Already uses `isDueToday` — confirmed correct. No change needed here.

**Fix in `AdherenceTracker` heatmap**:
- The heatmap marks days with zero injection_logs as "none" — this is correct behaviour (no dose scheduled = grey). No change needed.

---

### Part 3: Data Persistence & Storage Audit

Quick verification of core flows:
- Protocol creation → `protocols` + `protocol_peptides` tables (has RLS) ✓
- Injection logging → `injection_logs` table (has RLS) ✓  
- Supplement logging → `supplement_logs` table (has RLS, UNIQUE constraint) ✓
- Journal entries → `journal_entries` table (has RLS) ✓
- Bloodwork → `bloodwork_panels` + `bloodwork_markers` ✓
- Profile/onboarding → `profiles` table ✓
- Notifications → `nudge_log` deduplication ✓

No missing persistence identified.

---

### Part 4: User Acquisition — Getting to 100 Users

This is a strategy section, not code changes:

1. **Fix the product first** (Parts 1-3 above) — broken adherence tracking kills retention
2. **Simplify onboarding** — audit the signup-to-first-protocol flow for friction. Currently requires email verification + profile completion + protocol creation + first dose log. That's 4+ steps before any value.
3. **Share-worthy moments** — the Results tab with adherence rings and milestone cards is shareable. Add a "Share my progress" button that generates an image (you already have `html2canvas` + `jspdf` installed).
4. **Content-led SEO** — you have 25+ article pages. Ensure each has a clear CTA to sign up. The articles already exist; this is about conversion.
5. **Referral loop** — add a simple invite link (unique per user) that tracks signups. Even a basic `?ref=userId` parameter logged to a table.
6. **Reddit/forum seeding** — peptide communities on Reddit (r/Peptides, r/semaglutide) are highly active. Share the free tools (calculators, reconstitution guide) as value-first posts.
7. **PWA install prompt** — you already have PWA support. Make the install banner more prominent for mobile visitors.

---

### Implementation Summary

| Task | Type | Risk |
|------|------|------|
| Re-add AdherenceTracker to Tracker tab | UI restore | Low |
| Fix backfillMissingDays frequency awareness | Logic fix | Medium — core metric |
| Verify AdherenceSummary renders in overview | UI check | Low |
| Add "Share progress" button to Results tab | New feature | Low |

The code changes are focused on 2 files: `src/pages/Dashboard.tsx` (re-add component) and `src/hooks/use-injections.ts` (fix backfill logic). The adherence fix is the most critical — without it, any user on a non-daily protocol sees broken stats.

