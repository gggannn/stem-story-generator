# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

STEM Story Generator for Children - A Next.js web app that generates personalized STEM stories for kids in two modes: bedtime listening and reading/printing.

## Tech Stack

- Next.js 16 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Lucide React (icons)

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── story/generate/    # API route for story generation
│   ├── page.tsx              # Main home page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles + Print CSS
├── components/
│   ├── AgeCapsule.tsx        # Age selection (5-12)
│   ├── TopicCapsule.tsx      # STEM topic selection
│   ├── DurationCapsule.tsx   # Duration selection (5/8/10/12 min)
│   ├── ModeToggle.tsx         # Bedtime/Reading toggle
│   ├── PasswordDisplay.tsx   # Dynamic parameter display
│   └── HistoryList.tsx       # Recent history (max 3)
├── types/
│   └── index.ts              # TypeScript interfaces
└── lib/
    └──                       # Utilities (future)
```

## Key Features Implemented

- **Age Capsules**: 5-12 years old
- **Topic Capsules**: 4 STEM themes (恐龙, 宇宙, 飞机, 昆虫, 机器人, 海洋, 森林, 动物)
- **Duration Capsules**: 5/8/10/12 minutes (hidden in reading mode)
- **Mode Toggle**: 睡前听 (bedtime) / 阅读打印 (reading)
- **Dynamic Password Display**: Shows current parameter combination
- **LocalStorage Cache**: 24-hour cache with key format: `${mode}|${age}|${topic}|${minutes/A4}|zh`
- **API Rate Limiting**: 2 API calls per device per day
- **History**: Last 3 generated stories

## API Contract

POST `/api/story/generate`

Request:
```json
{
  "mode": "bedtime" | "reading",
  "age": 5-12,
  "topic": "dinosaur" | "space" | "airplane" | ...,
  "minutes": 5 | 8 | 10 | 12,
  "lang": "zh",
  "mood": "sleepy" | "curious",
  "level": "L1" | "L2" | "L3"
}
```

Response (bedtime):
```json
{
  "title": "...",
  "body": ["paragraph1", "paragraph2", ...],
  "recap": ["question1", "question2", "question3"],
  "parent_tip": "..."
}
```

Response (reading):
```json
{
  "title": "...",
  "reading_pack": {
    "intro": "...",
    "sections": [{"h": "heading", "p": "content"}],
    "vocab": [{"term": "...", "explain": "..."}],
    "quiz": [
      {"type": "mcq", "q": "...", "options": ["A","B","C"], "answer": "B"},
      {"type": "short", "q": "...", "answer_key": "..."}
    ]
  }
}
```

## Print CSS Requirements

- A4 size, single column
- Hide all navigation and buttons
- White background, black text
- Use `break-inside: avoid` for vocabulary boxes and quiz sections
