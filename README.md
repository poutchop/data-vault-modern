# Carbon Clarity: Data Vault app + public website and learning platform

This repository holds two things:

1. **The Data Vault app** (Next.js, in `src/`, with an Android build in `android/`). This is the Phase 2 field-data app for sensors and audit-ready records. It is a separate product from the website.
2. **The Carbon Clarity public website and learning platform**, as plain static HTML in [`public/site/`](public/site/). This is what `carbon-clarity.vercel.app` serves.

## Where the learning platform is

| Live page | Source file | What it is |
|---|---|---|
| [carbon-clarity.vercel.app/learning.html](https://carbon-clarity.vercel.app/learning.html) | [`public/site/learning.html`](public/site/learning.html) | Carbon Clarity Learning: dashboard, 7 tracks × 4 lessons, knowledge checks, spaced revision, Simulation Lab, skills passport |
| [carbon-clarity.vercel.app/focus.html](https://carbon-clarity.vercel.app/focus.html) | [`public/site/focus.html`](public/site/focus.html) | Focus Day: 9-to-5 focus-block timer with breaks, wins, distraction list and daily report |
| [carbon-clarity.vercel.app/workplan.html](https://carbon-clarity.vercel.app/workplan.html) | [`public/site/workplan.html`](public/site/workplan.html) | Live project work plan (saves through `/api/tasks` on Vercel Blob, passcode-protected) |
| [carbon-clarity.vercel.app](https://carbon-clarity.vercel.app/) | [`public/site/index.html`](public/site/index.html) | Project website |
| [carbon-clarity.vercel.app/pilot.html](https://carbon-clarity.vercel.app/pilot.html) | [`public/site/pilot.html`](public/site/pilot.html) | Comparative stove pilot design |

Each file is self-contained: HTML, CSS, JavaScript and lesson data in one file, with no build step.

**Why a crawler sees "Loading Carbon Clarity…":** the Vercel project is not yet linked to this repository through Vercel's GitHub app. Until it is, each Vercel page is a small loader that fetches the matching file from this repository and renders it in the browser with JavaScript. People see the full page; tools that don't run JavaScript see only the loading message. To review the real content, read the source files above. Once the Vercel GitHub app is installed, Vercel will serve these files directly.

## Learning platform: what is in `learning.html`

- **Dashboard:** continue where you stopped, today's lesson, day streak, weekly target, completion vs mastery, revision due, weak topics, learning path by track, coming up, achievements.
- **7 tracks, 28 lessons:** Carbon markets & MRV; Carbon markets & policy; Stove technology; Stove design & development; Sensors, IoT & data; Research methods & data; Funding & the venture. Plus Saturday explain-aloud practice and Sunday reflection.
- **Each lesson in 5 steps:** objectives, video (embedded YouTube), reading with listen-aloud, 3-question knowledge check with feedback, 3-sentence reflection.
- **Spaced revision:** topics return after 1, 3, 7, 14 and 30 days; wrong answers return the next day.
- **Simulation Lab:** fish-smoking carbon simulator (AMS-II.G-style formula, fNRB sensitivity) and a stove test lab (Chorkor vs prototype, kg wood per kg fish).
- **Skills passport**, video library (62 checked videos), readings, glossary, notes.
- **Linked tools:** AI tutor (a claude.ai page), notes Google Doc, Focus Day.

**Current limits:** progress is stored in the learner's browser (`localStorage`), with no accounts yet; quizzes are multiple choice only; the AI tutor runs on claude.ai, not inside the platform; there are no certificates, project studio, community features or admin editor yet.

---

## Data Vault app (Next.js)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
