# Prayas AI — खेती साथी (Smart Crop Incident Response System)

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-site-id/deploy-status)](https://prayas-ai.netlify.app/)
[![Progressive Web App](https://img.shields.io/badge/PWA-Installable-success.svg)](https://prayas-ai.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Prayas AI** is a voice-first, community-driven Progressive Web App (PWA) designed for the early detection, forecasting, and localized management of crop diseases and pest infestations. 

Developed for **Problem Statement ID 26131** under the **Government of Maharashtra (Department of Skills, Employment, Entrepreneurship and Innovation)** for the *Agriculture, FoodTech & Rural Development* track.

---

## 1. Project Vision & Closed-Loop Architecture

While many tools exist for standalone disease diagnosis, they lack a unified action response system. **Prayas AI** closes the loop by connecting farmers, sensors, AI, and agricultural experts into a single, trust-gated system:

```
[Farmer Scan / IoT Sensor Input] 
               │
               ▼
   [Gemini Multimodal Vision] ──(Low Confidence)──► [KVK Expert Review Queue]
               │                                                │
       (High Confidence)                                    (Verified)
               │                                                │
               ▼                                                ▼
     [Community Geo-Grid Map] ◄────────────────────── [Red Alert Broadcast]
               │
               ▼
  [Feasibility Action Planner] (Transport-adjusted Mandi Prices & Nearest Store)
               │
               ▼
     [48-Hour Outcome Survey] ──(Condition Worse)──► [Escalate to Expert]
```

### Key Differentiators
1. **Human-in-the-Loop Validation**: To prevent false-alert fatigue, low-confidence AI scans and grid-level escalations are routed to the **Krishi Vigyan Kendra (KVK) Expert Dashboard** for verification before alerts are broadcast.
2. **Hyperlocal Threshold-Gated Alerts**: Risk tiers (Green → Yellow → Orange → Red) escalate dynamically on a Leaflet map only when clusters of reports occur within a 1.5km grid cell.
3. **Feasibility-Aware Action Planner**: Recommendations include safe/organic inputs (e.g. Neem oil), cost estimates per acre, specific application timings, and links to the nearest seed dealers (e.g. *Nashik Krishi Kendra*).
4. **Transport-Cost Adjusted Mandi Prices**: Free Agmarknet/e-NAM rates are adjusted for travel distance and freight cost (₹3.5/km/quintal) so farmers compare *net profit* rather than raw prices.

---

## 2. System Dataflow Diagram

The diagram below represents how agricultural data flows from the field, through AI processors and expert gates, to community alerts:

![Prayas AI Dataflow Diagram](prayas-ai/dataflow.png)

---

## 3. Core Features

### 🎙️ Multilingual Voice Assistant (Sarvam AI)
- **Speech-to-Text (STT)**: Uses Sarvam's `saaras:v3` model to transcribe spoken queries in **Hindi, Marathi (तुमचा आवाज, तुमची शेती)**, or English.
- **Text-to-Speech (TTS)**: Uses Sarvam's `bulbul:v3` model (featuring natural speaker voices like *Shubh* for Hindi and *Ananya* for Marathi) to read advisories out loud.
- **Accessibility**: Includes a manual text type-in search field for silent search.

### 📷 Smart Image Diagnosis (Gemini 1.5 Flash)
- Captures crop leaf photos directly from camera/gallery.
- Outputs structured diagnostic data (probable disease, confidence rate, alternative causes, and action plan) using Gemini's multimodal reasoning.

### 🛰️ IoT Sensors & Pest Traps Integration
- Real-time simulated widgets display data from **Yellow Sticky Traps** (insect activity), **Soil Moisture**, and **Leaf Wetness** sensors.
- Automatically updates risk thresholds and recommends preventative actions (e.g., irrigating when soil moisture drops below 35%).

### 🌦️ Weather-Based Disease Risk Forecast
- Fuses local temperature and humidity indicators to calculate disease-specific outbreak risks (e.g. wet leaves + humidity > 85% = High Late Blight risk).

### 🗺️ Community Risk Heatmap
- Geospatial Leaflet map indicating risk circles. Exact farm plots are jittered to a village/grid level to preserve farmer privacy.

---

## 4. Technical Architecture

- **Frontend**: Vanilla HTML5, CSS3, Javascript (PWA with Service Worker offline shell caching).
- **Backend Map**: Leaflet.js mapping library (OpenStreetMap tiles).
- **Serverless API Proxy**: Netlify Functions (Node.js) to keep API credentials secure.
- **Database**: Supabase (PostgreSQL / PostGIS for geospatial grid clustering) with an ephemeral in-memory storage fallback.
- **AI Integrations**: Gemini Multimodal API (Multimodal diagnostics) & Sarvam AI REST API (STT Saaras + TTS Bulbul).

---

## 5. Security & Credentials Setup

To keep API keys safe, the PWA uses a serverless proxy pattern. The keys are stored inside environment variables on Netlify and are never exposed to the client browser.

### A. Environment Variables
For local testing or production deployments, configure these environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### B. Local Developer settings Panel
For static offline development without Netlify CLI:
1. Open the app in browser.
2. Click the gear icon (**⚙️**) on the top bar.
3. Paste your API keys directly into the modal (stored securely in browser `localStorage`).
4. Toggle **"Use Local Offline Demo Data"** if you wish to run completely mock-based.

---

## 6. How to Run Locally

### Prerequisites
Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

### Step 1: Clone the Repository
```bash
git clone https://github.com/Harshita-Dargan/prayas-ai.git
cd prayas-ai
```

### Step 2: Configure Environment Keys
Create a `.env` file at the root of the workspace:
```bash
GEMINI_API_KEY=your_gemini_key
SARVAM_API_KEY=your_sarvam_key
```

### Step 3: Run the Local Dev Server
```bash
netlify dev
```
This launches a local server (typically at `http://localhost:8888`) that serves the static frontend inside the `prayas-ai` folder and hosts the serverless functions under `/api/` matching the `netlify.toml` rules.

---

## 7. License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
