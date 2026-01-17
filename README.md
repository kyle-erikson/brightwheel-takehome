# Little Sprouts AI Front Desk

> An AI-powered assistant for childcare communication — built for the Brightwheel take-home.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui components |
| AI | OpenRouter API (Mistral Devstral) |
| Storage | File-based JSON (demo purposes) |

## 🎯 Approach

I built two connected experiences:

1. **Parent View** (`/chat`) — A conversational AI assistant that answers school questions, provides child updates, and seamlessly escalates to humans when needed.

2. **Admin View** (`/admin`) — A real-time triage dashboard where staff can monitor all conversations, see AI confidence scores, and review full transcripts.

The key insight: **the AI evaluates its own confidence**. Instead of simple keyword matching, the LLM returns structured JSON with a confidence score and a `needsHumanReview` flag. This creates intelligent escalation without brittle regex rules.

## ✨ Features

- **Contextual Responses** — Logged-in parents get personalized info about their child
- **Self-Reflective AI** — Confidence scoring (0-1.0) maps to Green/Yellow/Red triage
- **Live Triage** — Conversations appear on admin dashboard in real-time
- **Topic Summarization** — AI generates 2-5 word topic summaries
- **Full Transcripts** — Expandable rows show complete conversation history
- **Session Persistence** — Parent login survives page refresh

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Add your API key
cp .env.example .env.local
# Edit .env.local with your OPENROUTER_API_KEY

# Run development server
npm run dev
```

## 🎬 Demo Scenarios

### Scenario 1: Logged-In Parent
1. Login with phone `555-0101` (any 4-digit code)
2. Ask: *"How is my son doing?"* — See personalized child data
3. Ask: *"Maya has a fever"* — Get sick policy with action buttons

### Scenario 2: Guest Parent
1. Select "Continue as Guest"
2. Ask: *"What is your infant tuition?"* — Get pricing from knowledge base

### Scenario 3: Escalation
1. Type: *"I need to speak to someone"*
2. Watch AI set `needsHumanReview: true`
3. See 🚨 Priority Alert appear in Admin dashboard

### Scenario 4: Admin Dashboard
1. Click **👩‍💼 Admin** button (header) → Password: `admin`
2. View real-time inquiries with confidence scores
3. Click any row to expand full transcript
4. Edit **Policy Editor** to change AI's knowledge instantly

---

Built with ❤️ for Brightwheel
