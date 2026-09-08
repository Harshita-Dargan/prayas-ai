# Prayas AI — Open-Source AI Stack & Free Deployment Guide

This guide explains how to deploy **Prayas AI** completely free without relying on paid third-party APIs (Google Gemini or Sarvam Cloud API).

---

## 1. Overview of the Open-Source Architecture

| Component | Open-Source Technology | Cost | Description |
| :--- | :--- | :--- | :--- |
| **Crop Diagnosis (Vision)** | **Fine-tuned LLaVA-1.5-7B** / **SmolVLM** | **100% Free** | Trained on Kaggle Indian Crop Disease datasets via 4-bit QLoRA |
| **Conversational Agronomist** | **`sarvamai/sarvam-1`** (2B Indic LLM) | **100% Free** | Open-weights model on Hugging Face Hub optimized for 10 Indian languages |
| **Speech-to-Text (STT)** | **OpenAI Whisper** (Small/Base) | **100% Free** | Open-source speech transcription |
| **Text-to-Speech (TTS)** | **Edge-TTS** (Neural Voices) | **100% Free** | Natural Marathi (`mr-IN-AarohiNeural`) & Hindi (`hi-IN-MadhurNeural`) voices |
| **Backend Framework** | **FastAPI (Python 3.10+)** | **100% Free** | Unified API for AI reasoning + serving static PWA frontend |

---

## 2. Best Free Deployment Options

### Option A: Hugging Face Spaces (Recommended — 100% Free All-in-One)
Hugging Face Spaces provides **free Docker / FastAPI hosting** with 16 GB RAM and 2 vCPUs:

1. Create a free account at [huggingface.co](https://huggingface.co/).
2. Click **New Space** → Set Space Name (e.g. `prayas-ai`).
3. Select **Docker** as the Space SDK (Blank).
4. Under Space Hardware, leave the default **Free CPU (2 vCPU · 16 GB RAM)**.
5. In your local terminal, push this repository or connect your GitHub repository to the Space:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/prayas-ai
   git push space feature/open-source-stack:main
   ```
6. The included `backend/Dockerfile` will automatically build and launch both the FastAPI backend and the static PWA frontend on `https://your-username-prayas-ai.hf.space`.

---

### Option B: Render Free Web Service
1. Create a free account at [render.com](https://render.com/).
2. Click **New Web Service** → Connect your GitHub repo (`prayas-ai`).
3. Select branch: `feature/open-source-stack`.
4. Environment: **Python 3**.
5. Build Command:
   ```bash
   pip install -r backend/requirements.txt
   ```
6. Start Command:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
7. Click **Create Web Service**. Your app is live at `https://prayas-ai.onrender.com`.

---

### Option C: Decoupled (Frontend on GitHub Pages/Vercel + Backend on HF Space)
If you prefer hosting the PWA on GitHub Pages or Vercel:
1. **Frontend**: Deploy the `prayas-ai/` folder to GitHub Pages or Vercel (free unlimited bandwidth).
2. **Backend**: Host `backend/` on Hugging Face Spaces.
3. Configure the backend URL in the Prayas AI settings modal (⚙️) on your web app.

---

## 3. How to Run Locally (Zero Setup, No Cloud Required)

1. Clone and navigate to the project directory:
   ```bash
   git clone https://github.com/Harshita-Dargan/prayas-ai.git
   cd prayas-ai
   git checkout feature/open-source-stack
   ```

2. Install python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. (Optional) Set your Hugging Face User Access Token for live model queries:
   ```bash
   # Windows PowerShell
   $env:HF_API_TOKEN="hf_your_free_token"

   # Linux / macOS
   export HF_API_TOKEN="hf_your_free_token"
   ```

4. Launch the application:
   ```bash
   python backend/main.py
   ```

5. Open your browser at:
   ```
   http://localhost:8000
   ```
   The full PWA interface will load, connected directly to the open-source AI engine.

---

## 4. Fine-Tuning LLaVA on Your Own Kaggle Crop Dataset
Refer to [training/README.md](file:///c:/Users/harsh/OneDrive/Desktop/prayas-ai/training/README.md) for the complete step-by-step walkthrough to train LLaVA on 30+ Indian crop diseases using free Kaggle GPUs and push the weights to Hugging Face.
