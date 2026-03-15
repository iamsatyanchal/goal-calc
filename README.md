# GoalStack Financial Planner

GoalStack is a goal-based investment planning dashboard built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, and Recharts. It helps users model long-term goals (house, education, retirement, etc.) with SIP-based projections, inflation impact, scenario comparison, and AI-assisted goal generation.

This README is written for developers who need to understand and maintain the codebase end-to-end.

## Table of Contents

1. Product Overview
2. Tech Stack
3. Features
4. Architecture and Data Flow
5. Folder Structure
6. API Contracts
7. Financial Calculation Engine
8. Local Development
9. Environment Variables and Security Notes
10. Build, Lint, and Production Run
11. Deployment Guide
12. Testing and Validation Checklist
13. Known Gaps and Technical Debt
14. Suggested Next Improvements

## Product Overview

GoalStack provides a single-screen planner where users can:

- Manage multiple financial goals.
- Tune assumptions like timeline, return, inflation, and SIP.
- Switch scenarios (current, optimistic, conservative).
- Visualize corpus growth against inflation-adjusted goal cost.
- Review summary metrics and simple action guidance.
- Auto-generate goal assumptions from natural language using AI.
- Use a guided onboarding tour.

Primary page: app/page.tsx

## Tech Stack

### Runtime and Framework

- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5

### UI and Styling

- Tailwind CSS v4 via @tailwindcss/postcss
- Custom CSS tokens in app/globals.css
- Montserrat font via next/font/google
- Lucide icons
- Recharts for charting
- driver.js for guided tour/onboarding

### Forms and State

- React local state for planner interactions
- react-hook-form installed (currently not used in core planner screen)

### Tooling

- ESLint 9 + eslint-config-next
- Strict TypeScript configuration

Dependency source of truth: package.json

## Features

### 1) Multi-goal planning

- Seed goals from constants.
- Add goal via modal.
- Delete goal (at least one goal is always preserved).
- Switch active goal using tab-like chips with keyboard support.

Main files:

- components/planner/constants.ts
- components/planner/add-goal-modal.tsx
- components/planner/goal-controls-panel.tsx

### 2) Interactive assumption controls

- Goal name input with datalist suggestions.
- Customer type toggle (regular/senior).
- Sliders with inline numeric editing for:
	- Target amount
	- Monthly SIP
	- Investment period
	- Expected return
	- Inflation

Main file: components/planner/slider-field.tsx

### 3) Scenario analysis

Three scenarios are configured with deltas:

- current: no delta
- optimistic: +1.5% annual return, -0.5% inflation
- conservative: -1.5% annual return, +0.5% inflation

Defined in: lib/finance.ts

### 4) Projection visualization

Projection chart overlays:

- Investment growth (area + line)
- Goal inflation cost (line)
- Goal cost today (dashed line)
- Milestone reference markers

Main file: components/planner/projection-chart.tsx

### 5) Summary and analytics panel

- Overview and breakdown tabs
- Key metrics: projected corpus, invested amount, growth earned, funding gap, required SIP
- Allocation, progress, and assumption comparison charts
- Readable guidance message based on gap

Main file: components/planner/summary-panel.tsx

### 6) AI goal generation

- User submits free-text goal description.
- Backend route sends prompt + user text to Groq-compatible API.
- Response is parsed, sanitized, clamped, and applied to active goal.

Main files:

- components/planner/ai-goal-modal.tsx
- app/api/ai-goal/route.ts

### 7) API calculator endpoint

- Backend endpoint computes metrics server-side from posted goal payload.

Main file: app/api/calculator/route.ts

### 8) Guided onboarding

- driver.js tour steps across key dashboard areas
- Seen-state persisted in localStorage

Main file: components/onboarding/dashboard-tour.tsx

## Architecture and Data Flow

At a high level:

1. User interacts with controls in the planner page.
2. app/page.tsx updates local React state.
3. Derived values are recomputed with useMemo using lib/finance.ts helpers.
4. UI components receive computed data and render charts/metrics.
5. Optional AI flow calls /api/ai-goal, receives generated assumptions, then updates active goal.

Data flow is intentionally simple and mostly client-side for responsiveness.

## Folder Structure

Top-level map (important files only):

fincalc/
- app/
	- api/
		- ai-goal/route.ts
		- calculator/route.ts
	- globals.css
	- layout.tsx
	- page.tsx
- components/
	- onboarding/
		- dashboard-tour.tsx
	- planner/
		- add-goal-modal.tsx
		- ai-goal-modal.tsx
		- constants.ts
		- goal-controls-panel.tsx
		- metric-row.tsx
		- projection-chart.tsx
		- slider-field.tsx
		- summary-panel.tsx
		- types.ts
	- ui/
		- button.tsx
		- card.tsx
- lib/
	- finance.ts
	- utils.ts
- public/
- eslint.config.mjs
- next.config.ts
- package.json
- postcss.config.mjs
- tsconfig.json

## API Contracts

### POST /api/calculator

File: app/api/calculator/route.ts

Request body:

{
	"goal": {
		"id": "goal-house",
		"name": "Buy a House",
		"presentCost": 5000000,
		"years": 12,
		"monthlySip": 28000,
		"expectedAnnualReturn": 12,
		"inflationRate": 6
	},
	"scenario": "current",
	"extraSip": 0
}

Response 200:

{
	"metrics": {
		"annualReturn": 12,
		"inflationRate": 6,
		"months": 144,
		"futureGoalValue": 10000000,
		"inflatetextValue": "...",
		"totalmonthlySip": 4032000,
		"projectedCorpus": 8123456,
		"projectedCorpusreturn": "₹...",
		"projectedCorpusReturnAmount": 4091456,
		"requiredSip": 35123.45,
		"fundingGap": 1876544,
		"suggestedSipIncrease": 7123.45
	}
}

Errors:

- 400 if goal payload missing
- 500 for unhandled failures

### POST /api/ai-goal

File: app/api/ai-goal/route.ts

Request body:

{
	"description": "I want to save for my child's education in 12 years"
}

Response 200:

{
	"goal": {
		"name": "Child Education",
		"presentCost": 2500000,
		"years": 12,
		"monthlySip": 15000,
		"expectedAnnualReturn": 11,
		"inflationRate": 7,
		"customerType": "regular"
	}
}

Sanitization rules enforced server-side:

- name length <= 60 chars
- presentCost clamped to 200000..30000000
- years clamped to 1..30
- monthlySip clamped to 100..500000
- expectedAnnualReturn clamped to 1..18
- inflationRate clamped to 1..12
- customerType restricted to regular or senior

Common errors:

- 400 when description is empty
- 502 when upstream AI response fails or is malformed
- 500 for server-side unexpected errors

## Financial Calculation Engine

Core file: lib/finance.ts

Important helpers:

- inflateGoalValue(presentCost, inflationRatePct, years)
- calculateRequiredSip(targetFutureValue, annualReturnPct, totalMonths)
- calculateProjectedCorpus(monthlySip, annualReturnPct, years)
- calculateGoalMetrics(goal, scenario, extraMonthlySip)
- buildProjectionSeries(goal, scenario, extraMonthlySip)

Modeling logic:

- Future goal value uses compounded inflation.
- Corpus projection uses SIP future value style monthly compounding.
- Required SIP solves inverse SIP formula for target future value.
- Funding gap is max(0, futureGoalValue - projectedCorpus).
- Suggested SIP increase is max(0, requiredSip - currentEffectiveSip).

## Local Development

### Prerequisites

- Node.js 20 LTS or newer
- npm 10+ recommended

### Install

Run from project root:

npm install

### Start dev server

npm run dev

Open:

http://localhost:3000

### Lint

npm run lint

### Production build and run locally

npm run build
npm run start

## Environment Variables and Security Notes

The AI endpoint should use a server-side environment variable:

- GROQ_API_KEY

Recommended local file:

.env.local

Contents:

GROQ_API_KEY=your_real_key_here

Important security note:

- The current ai-goal route contains an inline API key string in code. Move it to process.env.GROQ_API_KEY before any shared deployment.
- Never commit real secrets to Git history.
- Rotate exposed keys immediately if previously committed.

## Build, Lint, and Production Run

Available npm scripts:

- dev: starts Next.js development server
- build: builds optimized production bundle
- start: serves built app
- lint: runs ESLint

These scripts are defined in package.json.

## Deployment Guide

### Option A: Vercel (recommended)

1. Push repository to GitHub/GitLab/Bitbucket.
2. Import project in Vercel.
3. Set Environment Variables in Vercel Project Settings:
	 - GROQ_API_KEY
4. Keep build settings default for Next.js:
	 - Install Command: npm install
	 - Build Command: npm run build
	 - Output: .next (managed automatically)
5. Deploy.

Post-deploy checks:

- Open homepage and verify planner renders.
- Test Add Goal and goal switching.
- Test scenario toggle and chart updates.
- Test AI modal flow end-to-end.
- Test /api/calculator and /api/ai-goal via UI.

### Option B: Self-host Node server

1. Set production env vars (at minimum GROQ_API_KEY).
2. Install dependencies: npm install
3. Build app: npm run build
4. Start server: npm run start
5. Put behind reverse proxy (Nginx/Caddy/IIS) and HTTPS.

Recommended operational settings:

- Health checks on main route
- Log aggregation for API errors
- Basic request rate limiting on AI endpoint

## Testing and Validation Checklist

Because there are currently no automated tests in the repo, use this manual checklist:

1. Functional UI checks
	 - Load page and confirm default goals render.
	 - Add/delete/select goals.
	 - Adjust sliders and verify metrics/charts update immediately.
2. Scenario checks
	 - Switch current/optimistic/conservative and validate expected directional changes.
3. Accessibility checks
	 - Keyboard navigation for tabs, toggles, and scenario selector.
	 - Focus ring visibility on interactive controls.
4. API checks
	 - Send invalid payload to /api/calculator and verify 400.
	 - Submit empty description to /api/ai-goal and verify 400.
5. Regression checks
	 - Dashboard tour appears first time only.
	 - Tour can be manually reopened.

## Known Gaps and Technical Debt

- AI key handling: inline key string currently present in route; must be replaced with env var usage.
- Console logging in finance calculations and AI route should be cleaned or guarded for production logs.
- No automated unit/integration tests yet.
- Some commented-out UI blocks remain in planner components.
- react-hook-form is installed but not leveraged in current planner forms.

## Suggested Next Improvements

1. Add unit tests for lib/finance.ts formula correctness.
2. Add API route tests for validation and error handling.
3. Move all secrets to environment variables and document env schema in .env.example.
4. Add end-to-end tests for planner interactions (Playwright/Cypress).
5. Introduce persistent storage for goals (database or local storage strategy).

---

If you are onboarding as a new contributor, start with:

1. app/page.tsx for orchestration logic.
2. lib/finance.ts for the business formulas.
3. components/planner/* for all interactive UX pieces.
4. app/api/* for server endpoints and AI integration.
