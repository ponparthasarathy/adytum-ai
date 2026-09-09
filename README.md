# 🏛️ ADYTUM: Dynamic Multi-Agent 8-Bit Narrative Engine

> **IEEE 4-Agent Closed-Loop Interactive Fiction Architecture** powered by Google Gemini, Groq, and 15 GameBoy Pixel Portraits.

---

## 🌟 Features

- **🎮 Dynamic Story Generation**: Type a 1-line custom story premise or click **Surprise Me!**. Google Gemini dynamically selects 3–6 matching character cast members out of 15 GameBoy pixel portraits, generates personas, initial greetings, world flags ($W_t$), and opening cutscenes.
- **🤖 IEEE 4-Agent Closed-Loop Pipeline**:
  1. **Narrator Agent ($N_t$)**: Synthesizes scene graph nodes ($V_t, E_t$), branch transitions, and opening cutscenes.
  2. **Character Agent ($C_t$)**: Generates real-time dialogue turns, emotional states, and maintains private memory streams.
  3. **World State Agent ($W_t$)**: Tracks physical environment flags, door locks, and spatial causality.
  4. **Evaluator Agent ($R_t$)**: Computes social metrics (*Empathy, Assertiveness, Agency*) and real-time **Trust Delta ($\Delta T$)**.
- **🎨 GameBoy DMG-01 Aesthetics**: Authentic 4-color phosphor green retro CRT theme, crisp pixel-art scaling, color-coded trust meter thresholds, and a scrolling dialogue history log.
- **🔬 Live 4-Agent Inspector**: Toggle with `TAB` to inspect live agent deliberation traces, world flags, and model provider configurations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **LLM Engine Layer**: Google Gemini (`gemini-2.0-flash`), Groq (`openai/gpt-oss-120b`), Mistral AI, xAI Grok
- **Styling**: Vanilla CSS tokens (`app/globals.css`)
- **Sound**: Web Audio API Sound FX synthesizer (`lib/soundFx.js`)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ponparthasarathy/adytum-ai.git
cd adytum-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add your `GEMINI_API_KEY` and `GROQ_API_KEY` under project settings in Vercel.

---

## 📜 License
MIT License. Created for IEEE Multi-Agent Research & Dynamic Interactive Fiction.
