# Prayas AI — खेती साथी
Voice-first crop **incident-response system** for SIH 2026, Agriculture / FoodTech / Rural Development track.

Revised positioning: Prayas AI does **not** claim to invent AI crop diagnosis, voice assistants, WhatsApp bots, satellite monitoring, or market-price discovery — all of those already exist and are well-funded (see §2). What it claims is a **closed loop none of them run end-to-end**:

```
Report → Diagnose (with uncertainty) → Verify (human-in-the-loop) → Alert (threshold-gated) → Act (feasibility-aware) → Follow up
```

This folder is a working PWA prototype (`index.html` + `manifest.json` + `sw.js`) you can open directly or deploy in 2 minutes.

---

## 1. What the demo actually does (not just mockups)

- **Voice-first home screen** — real `SpeechRecognition` (hi-IN) captures a spoken question, a small intent router answers it, `SpeechSynthesis` speaks the reply back.
- **Crop scan with uncertainty handling** — real camera/file capture → canvas pixel sampling → maps to a small disease/advisory dataset that carries a confidence tier (high/medium), alternate-cause text, and an explicit "this is not a final diagnosis" warning. **Medium-confidence cases route to the Expert Dashboard instead of the community** — the community alert button is hidden until confidence is sufficient or an expert overrides.
- **Action planner, not just advice** — every result shows what to do, when, approximate cost, required input, a low-cost alternative, the nearest input source, and a re-inspect date, so the recommendation is actually feasible for a smallholder with limited cash and labor.
- **Threshold-gated community risk map** — Leaflet map with four tiers (green/yellow/orange/red per the spec), color escalates only once enough independent reports cluster in a time window, each popup explains *why* the tier changed ("6 similar reports in 48 hours"), and farm locations are jittered to a village/grid point rather than the exact plot (privacy-preserving).
- **Expert verification dashboard** — a KVK/agriculture-officer view of pending cases (from low-confidence scans or cluster escalation) with Confirm & Alert / Edit / Reject actions. Confirming is what actually pushes a case to red-tier and broadcasts — the system never auto-alerts a whole community off a single unverified AI guess.
- **Follow-up loop** — after reporting, the farmer gets a "better / same / worse" check-in; "worse" automatically re-routes the case to the expert dashboard.
- **Mandi price comparison** — nets out estimated transport cost by distance so ranking is by real payout, not sticker price ("highest price ≠ highest profit").
- **WhatsApp voice-note preview** — chat-UI mock of the WhatsApp Business flow: voice note in → transcript + spoken-style reply out → map updates live.
- **Installable PWA** — manifest + service worker, offline shell caching, Notification API demo, online/offline status strip.

Everything is genuinely interactive in a browser; the "AI" calls are mocked deterministically (no backend), clearly labeled in-app as demo mode, with a one-line note on what the real pipeline would call instead (see §5).

---

## 2. Competitive landscape — is this unique enough?

**Short answer: the individual pieces all exist and are well-funded already. Your differentiation has to be the *combination* + the *last-mile channel* (WhatsApp voice, farmer-to-farmer alerting) + *net-price intelligence*, not any single feature in isolation.**

| Existing solution | What it already does | Overlap with your idea |
|---|---|---|
| **Plantix** (PEAT/Bayer) — 780+ disease classes, 10M+ farmers, 20 languages | Photo-based disease ID, **district-level outbreak tracking**, community Q&A, and a paid B2B product ("Plantix Intelligence / Crop Insights") that already pushes **live pest-outbreak maps to agri-retailers over WhatsApp** <cite index="1-1,8-1">Plantix uses its deep learning models not only to analyse images and detect infections but also to track outbreaks up to district level, and pushes real-time talking points to field teams over WhatsApp</cite>. | This is your closest competitor. Disease scan + outbreak map + WhatsApp already ship in some form. Your farmer-to-farmer (not farmer-to-retailer) alert radius and hyperlocal (not district-level) heatmap are the gap. |
| **Farmer.CHAT** (Digital Green + Gooey.AI) | WhatsApp conversational bot, voice or text, Bhashini ASR, GPT-based answers, links to Digital Green advisory content. | Same WhatsApp-voice channel, but it's a Q&A bot, not a scan-triggered community alert system — no peer-to-peer heatmap. |
| **Krishi e-Mitra / PM-KISAN AI Chatbot** (Govt, with EKstep + Bhashini) | Scheme status, grievance, payment queries via chatbot, expanding to weather/soil. | Government-official channel; scheme-focused, not disease/price. |
| **SukhaRakshak AI** (drought advisory, AI4Bharat + Sarvam) | District-tailored drought advisory in 22 languages via voice/text, uses Sarvam + AI4Bharat — almost exactly the voice-stack you're proposing. | Confirms Sarvam/AI4Bharat is a validated, judge-recognizable choice for this problem. Not disease/price focused. |
| **Government National Pest Surveillance System** | AI/ML pest & disease detection across 61 crops, 400+ pests, used by **10,000+ extension workers** (not farmers directly) capturing field photos <cite index="33-1">the National Pest Surveillance System utilizes AI and Machine Learning to detect pest infestations and crop diseases, and over 10,000 extension workers are currently using this tool to capture images of pests for analysis</cite>. | Big one for SIH judges: this is the *exact* government initiative your problem statement is meant to support. It's extension-worker-facing, top-down, and has no farmer-facing peer alert layer. Positioning Prayas AI as the "last-mile, farmer-facing companion" to NPSS is a strong, judge-legible narrative. |
| **Krishi-DSS** (govt geospatial platform, launched Aug 2024) | Satellite/weather/soil/crop data fused into a national dashboard <cite index="34-1">Krishi-DSS integrates satellite imagery, crop survey outputs, soil indicators, weather data, and water resources information for near-real-time monitoring and advisory functions, but at present primarily delivers dashboards through government channels while public developer access remains limited</cite>. | This is your satellite-imagery data source to cite/integrate conceptually — don't claim you're building your own satellite pipeline from scratch; claim you *consume* Krishi-DSS / Sentinel-2 outputs. |
| **Agmarknet 2.0 / e-NAM** | Real-time prices from 4,367+ mandis, official app <cite index="52-1">4,367 mandis across India are linked to Agmarknet, and the e-NAM mobile app provides free price information for 247 notified commodities while helping farmers locate nearby e-NAM mandis and view prevailing rates</cite>. | Your job isn't to re-build this — it's to consume the Agmarknet API and add a net-payout ranking layer (distance + transport cost), which nobody in this list currently does farmer-side. |
| **SIH itself — "Smart Crop Advisory System for Small and Marginal Farmers" (PS ~SIH25010)** | This near-identical brief (multilingual AI advisory: crop selection, soil, pest via image, mandi prices, voice support) already produced **dozens of near-duplicate team projects** in SIH 2025 — "KrishiSahayak", "KrishiMitra", multiple Prezi/GitHub clones, at least one arXiv-adjacent paper. | **This is your biggest internal-competition risk**, not external market risk. If your college's internal round maps to this PS family, expect 5–15 teams pitching a "multilingual AI crop advisory app" with nearly the same feature checklist. |

### Where you're genuinely different (lead with these in the pitch)
1. **The closed loop itself.** Plantix diagnoses and (in its B2B product) maps outbreaks to district level for retailers. Farmer.CHAT answers questions. NPSS lets extension workers submit photos. None of them chain uncertainty-aware diagnosis → human verification → threshold-gated alert → feasibility-scoped action → outcome follow-up into one system. That chain — not any single AI call — is the product.
2. **Threshold-gated, human-verified alerts (this is what kills the "just another chatbot" critique).** A single farmer's low-confidence photo never broadcasts to a village. It takes a report cluster crossing a threshold *or* explicit KVK/expert confirmation before the tier goes orange/red and neighbors are notified. This directly answers the standard judge pushback: "how do you stop false-alert fatigue?"
3. **Feasibility-aware action planner, not generic advice.** Cost, required input, a low-cost substitute, and a named nearby source — this is the difference between "spray mancozeb" (useless if the farmer can't afford it or find it) and something a smallholder can actually execute this week.
4. **Follow-up as a data loop, not a courtesy message.** "Worse" outcomes auto-escalate to the expert queue, which is both a safety net and, over time, a way to check whether the AI's advice actually worked — something none of the existing chatbots claim to do.
5. **Net-price ranking, not raw price listing.** Nobody folds transport-cost-adjusted "real payout" into the mandi comparison.
6. **WhatsApp as the *entire* interface for zero-smartphone-literacy users**, not a companion channel — full parity between app and voice-note flow.
7. **Explicit last-mile bridge to NPSS** — citizen-sourced signal that *feeds into* and is cross-verified against the government's existing top-down system, not a rival to it. Strongest "real government need" framing for judges.

### Bottlenecks this version still has to be honest about (raise these yourself before a judge does)
- **Cold-start problem.** A threshold-gated alert system needs report density to work at all — a single-village pilot with low adoption will sit in "not enough reports yet" limbo. The MVP scope (§ below) exists specifically to make this demoable without needing real adoption data.
- **Expert bottleneck.** The verification step that makes alerts trustworthy also makes them dependent on KVK/officer bandwidth — if no one reviews the queue, cases stall. Worth having an answer ready for "what happens if the expert doesn't respond in time?" (e.g. auto-escalate purely on report-count after a longer window, clearly labeled as unverified).
- **Gaming/false-report risk.** Nothing in the MVP stops a bad-faith or mistaken report from entering a cluster count; expert review is the only backstop, which is a manual bottleneck at scale.
- **Confidence scoring is only as good as the underlying vision model** — on a hackathon timeline this will be a fine-tuned small model or a Gemini multimodal call with a prompted confidence estimate, not a calibrated probability. Say this plainly rather than overclaiming accuracy numbers.

### What to cut or downplay
- Don't pitch "we built satellite super-resolution" as a core feature unless you can demo it — judges in agri tracks have seen FASAL/Krishi-DSS and will ask what your model adds over Sentinel-2/Bhuvan. Reframe as "consuming and downscaling existing satellite layers for hyperlocal alerts," which is honest and still demoable.
- Don't compete head-on with Plantix's disease-classification accuracy claim (90%+, 800+ classes, years of labeled data) — you won't win that on a hackathon timeline. Emphasize the alerting/community/price layer instead, and treat detection as "good enough to trigger a community signal," not a diagnostic authority.

---

## 3. Government alignment (what to cite in your pitch deck)

- **Digital Agriculture Mission (₹2,817 cr, 2024–)** — umbrella scheme; your natural data partner. Components: Farmer Registry (**48M+ Farmer IDs issued** <cite index="33-1">A total of 4.8 crore Farmer IDs have been issued under the Digital Agriculture Mission, which aims to generate digital identities for 11 crore farmers by 2026-27</cite>), Digital Crop Survey, **Krishi-DSS** (satellite/soil/weather fusion), Soil Profile Mapping.
- **National Pest Surveillance System** — the single most relevant existing initiative; already AI-based, already using farmer/extension-worker photos, already covering 61 crops/400+ pests. Your pitch should say Prayas AI *extends* this to a farmer-facing, peer-alert layer.
- **Agmarknet 2.0 / e-NAM** — your price data backbone; both have public datasets/APIs (data.gov.in "Current daily price of various commodities from various markets") you can actually call in a real build.
- **BHASHINI** — govt's own ASR/translation stack, already used in Kisan e-Mitra and Farmer.CHAT; citing it (alongside or instead of Sarvam) shows you're building on approved government language infrastructure, which SIH judges weight heavily.

---

## 4. Research to cite for "why this is useful"

- Crowdsourced/citizen spatial disease-reporting has been shown to usefully approximate official surveillance for early-stage outbreak signal, with representativeness caveats — see the crowdsourced-data spatial disease surveillance study (Mitze & Rode, *Scientific Reports*, 2022, on VOC case reporting; methodology transfers directly to "citizen reports vs official case counts" argument, even though the disease domain is different).
- On the surveillance-design side: optimal early-detection strategy is *not* simply "watch the highest-risk sites hardest" — spatial correlation of risk means resources (and, by analogy, alert attention) need spreading, which supports a distributed farmer-reporting model over a small number of fixed sentinel sites (Plant pathogen early-detection surveillance-optimization study, *PLOS Biology*).
- Plantix's own published case studies are useful evidence of *feasibility at scale* — geo-time-tagged photo reporting reaching 90%+ accuracy on well-trained classes, with a live community feature already generating **~15,000 community messages/day and 20,000 image uploads/day** in an early India deployment <cite index="3-1">every day approximately 20,000 images are uploaded by users and the community feature has 15,000 messages, and live tracking of a recently introduced invasive pest was made possible using the app</cite> — cite this as proof that farmer-generated geotagged reports are a viable, high-volume signal.
- FAO's transboundary pest early-warning experience shows that **surveillance is most effective when hotspot-weighted but not hotspot-exclusive** — directly supports a design where alerts radiate outward from a report rather than only targeting known hotspots.

---

## 5. MVP scope (what to actually build if you go past this prototype)

Per the tightened spec: don't attempt all languages, all crops, or nationwide satellite prediction in v1.

- **One district, one regional language, one or two crops, 3 common disease/pest categories.**
- Simulated/sample village reports layered on top of a few real ones, so the map never looks empty in a demo.
- A simple farmer PWA (this prototype) + a basic expert dashboard (now included) + optional WhatsApp voice-note integration.

## 6. Production architecture note (for your slide, not the demo)

```
Frontend:      React PWA, large icon-based buttons          → Vercel
Map:           Leaflet / MapLibre
Backend:       FastAPI or Node.js                            → Render / Railway
Database:      Supabase (Postgres) — reports, clusters, expert queue, follow-ups
Image reasoning: Gemini multimodal API (image → likely issue,
                  confidence, alternate causes, in one call)
Speech (ASR+TTS): Sarvam AI or Bhashini — Indic language coverage
WhatsApp:      Meta WhatsApp Cloud API (webhook → same backend as the app)

Flow:
Farmer (app or WhatsApp voice note)
  │
  ├─ Photo → Gemini multimodal → {likely issue, confidence, alt causes}
  │           if confidence < threshold → Expert Dashboard queue (not community)
  │
  ├─ Voice → Sarvam/Bhashini ASR → intent router → Sarvam/Bhashini TTS → voice reply
  │
  ├─ Report → cluster by grid-cell + time window → tier (green/yellow/orange/red)
  │           orange/red → Expert Dashboard for confirm-before-broadcast
  │           confirmed or threshold-crossed → geofenced push to nearby farmers
  │           cross-checked against Krishi-DSS satellite/weather layer where available
  │
  ├─ Result → Action Planner (cost, input, low-cost alt, nearby source, re-inspect date)
  │           → 48hr/2-day follow-up prompt → "worse" auto-escalates to expert queue
  │
  └─ Mandi price: Agmarknet/e-NAM API → net-payout ranking (price − 
              distance × transport rate) → cached for offline (PWA)
```

Realistic hackathon-demo scope: show the flows above with the mock data already wired into `index.html` — judges care that the pipeline is *credible and correctly sequenced* and that you can explain the verification/threshold logic out loud, not that Gemini or Sarvam are actually called in a 36-hour build.

---

## 7. Deploy it (free, ~2 minutes)

**Option A — Netlify Drop (fastest, no account needed for a quick share link):**
1. Go to https://app.netlify.com/drop
2. Drag the whole `prayas-ai` folder onto the page.
3. You get a live HTTPS URL immediately — share it, it's installable as a PWA on any phone.

**Option B — GitHub Pages (best for a judge-visible repo + is genuinely free forever):**
```bash
cd prayas-ai
git init
git add .
git commit -m "Prayas AI SIH prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/prayas-ai.git
git push -u origin main
```
Then in the repo: Settings → Pages → Source: `main` branch, `/ (root)` → Save. Your app is live at `https://<your-username>.github.io/prayas-ai/`.

**Option C — Vercel:**
```bash
npm i -g vercel
cd prayas-ai
vercel
```
Follow the prompts (no config needed, it's a static site).

After deploying, open the URL on an Android phone in Chrome — you'll get the "Install app" prompt automatically (the `beforeinstallprompt` banner in the demo), and it'll behave like a native app icon on the home screen, offline shell included.

---

## 8. Suggested pitch narrative (60-second version)

*"Existing tools already diagnose crops, already run voice bots, already push outbreak dashboards. What none of them do is close the loop: one farmer's uncertain photo shouldn't spam a village, and one confident diagnosis shouldn't sit unverified either. Prayas AI turns a single report into a verified, threshold-gated community signal — a KVK officer confirms before red-tier alerts go out, every recommendation comes with real cost and a local source, and the system checks back in two days to see if it actually worked. It's built to plug into, not duplicate, Krishi-DSS, the National Pest Surveillance System, and Agmarknet — the missing layer is trustworthy, accountable, farmer-to-farmer alerting."*

## 9. Demo script (one realistic scenario, per the spec)

Run this exact sequence live — it exercises every new mechanic in under 3 minutes:
1. **Scan tab** → upload a leaf photo → get a high-confidence Late Blight result with the full action planner.
2. Tap **"समुदाय रिपोर्ट में जोड़ें"** → toast shows report count is below threshold → **follow-up card appears**.
3. Switch to **Map tab** → point out the same cluster is still yellow/green (not blindly red) — explain the gating logic from the popup text.
4. Go to **Expert Dashboard** (home tile) → find the pre-seeded pattix-blight case at 6 reports → tap **"पुष्टि करें व अलर्ट भेजें"** → toast confirms a red-tier alert fired, and the home feed + map both update live.
5. Back in **Scan**, upload a second photo to trigger the medium-confidence stem-borer result → show the **uncertainty box** routing to "भेजें विशेषज्ञ को" instead of the community — this is the strongest 10-second moment for judges.
6. Close on **Prices tab** to land the "highest price ≠ highest profit" line, then the **WhatsApp tab** to show the whole thing also works with zero app literacy.
