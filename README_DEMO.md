# 📝 Little Sprouts AI: Interviewer Demo Guide

Welcome to the Little Sprouts "Front Desk" Prototype. This guide walks through the key scenarios to demonstrate the AI's capabilities.

---

## 🌟 Scenario 1: Logged-In Parent
**Goal:** Personalized, context-aware responses with child data.

1. **Login:** Phone `555-0101` → Any 4-digit code
2. **Interact:** Type *"How is my son doing?"*
3. **What to look for:** AI addresses James by name, shows Leo's current activity, teacher, and mood.

---

## 🤒 Scenario 2: Sick Child Policy
**Goal:** Handbook compliance + action-oriented UI.

1. **Login:** Phone `555-0202` (Elena)
2. **Interact:** Click **Sick Policy** chip or type *"Maya has a fever"*
3. **What to look for:** AI quotes 24-hour fever-free policy, offers "Notify Teacher" button.

---

## 🥪 Scenario 3: Forgot Lunch
**Goal:** Revenue-generating feature (billing simulation).

1. **Login:** Phone `555-0303` (Sarah Chen)
2. **Interact:** Type *"I forgot Cooper's lunch!"*
3. **What to look for:** AI shows today's menu, quotes $5 fee, offers "Charge Account" button.

---

## 🏢 Scenario 4: Guest Parent
**Goal:** Privacy protection + enrollment conversion.

1. **Login:** Select **Continue as Guest**
2. **Interact:** Ask *"What is your infant tuition?"*
3. **What to look for:** AI provides pricing ($450/week) and suggests booking a tour.

---

## 👩‍💼 Scenario 5: Admin Dashboard
**Goal:** Human-in-the-loop triage + knowledge management.

1. **Navigate:** Click **👩‍💼 Admin** button in header (Password: `admin`)
2. **What to look for:**
   - **Triage Table** — Conversations with AI confidence scores (Green/Yellow/Red)
   - **Expandable Rows** — Click any row to see full transcript
   - **Topic Summaries** — AI-generated 2-5 word descriptions
   - **Policy Editor** — Edit knowledge base and see AI update instantly

---

## 🔴 Scenario 6: Live Triage (Side-by-Side)
**Goal:** Real-time connection between Parent and Admin.

1. **Setup:** Open two windows side-by-side:
   - Window 1: `/chat` (login as any parent)
   - Window 2: `/admin` (password: `admin`)

2. **Interact:**
   - In Chat: Type *"What activities do you offer?"*
   - Watch Admin update with new inquiry
   - In Chat: Type *"I need to speak to someone"*
   - Watch Admin show 🚨 **Priority Alert**

3. **What to look for:**
   - Dashboard updates every 3 seconds
   - Escalations trigger `needsHumanReview: true`
   - Click row to see full conversation transcript

---

## 💡 Key Technical Highlights

| Feature | How It Works |
|---------|--------------|
| **Self-Reflective AI** | LLM returns JSON with `confidenceScore` (0-1.0) and `needsHumanReview` flag |
| **Session Grouping** | All messages in a chat are stored as one inquiry with topic summary |
| **Live Updates** | Admin polls `/api/admin/inquiries` every 3 seconds |
| **Session Persistence** | Parent login survives page refresh (localStorage) |