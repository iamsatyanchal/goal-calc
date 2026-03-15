# 💰 GoalStack — Goal-Based Financial Planner

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

GoalStack is a **goal-based investment planning dashboard** that helps users plan long-term financial goals like **buying a house, education, or retirement** using SIP projections.

It visualizes **investment growth, inflation impact, and funding gaps** so users can understand how their investments evolve over time.

Built with **Next.js App Router, React, TypeScript, TailwindCSS v4, and Recharts**.

---

# 🚀 Features

### 🎯 Goal-Based Financial Planning
- Create and manage multiple financial goals.
- Configure:
  - Target amount
  - Investment timeline
  - Monthly SIP
  - Expected returns
  - Inflation assumptions

---

### 📊 Investment Projection Charts
Visualize:

- Investment growth
- Inflation-adjusted goal value
- Current goal value reference
- Future corpus projection

All rendered with **Recharts interactive charts**.

---

### 📈 Scenario Analysis

Compare outcomes under different market assumptions.

| Scenario | Return Change | Inflation Change |
|--------|--------|--------|
| Current | 0% | 0% |
| Optimistic | +1.5% | -0.5% |
| Conservative | -1.5% | +0.5% |

---

### 🧠 AI Goal Generation

Users can describe goals in natural language.

Example:

```

"I want to save for my child’s education in 12 years"

```

The AI converts it into a structured financial goal with:

- cost estimate
- SIP amount
- timeline
- inflation assumption

---

### 📊 Financial Insights

GoalStack automatically calculates:

- Future goal value (inflation adjusted)
- Projected corpus
- Investment growth
- Funding gap
- Required SIP

---

### 🧭 Guided Onboarding

A built-in **dashboard tour** helps new users understand the planner quickly.

Powered by **driver.js**.

---

# 🧱 Tech Stack

## Framework

- Next.js 16 (App Router)
- React 19
- TypeScript

## UI

- Tailwind CSS v4
- Lucide Icons
- Recharts

## Libraries

- driver.js (onboarding tour)
- react-hook-form (available for forms)

---

# 🏗 Architecture Overview

GoalStack uses a **client-heavy architecture** to ensure instant UI updates.

```

User Interaction
↓
React State Updates
↓
Financial Engine (lib/finance.ts)
↓
Derived Metrics + Projection Data
↓
Charts + Analytics UI

```

AI generation uses a **server API route**.

---

# 📂 Project Structure

```

fincalc/
│
├─ app/
│   ├─ api/
│   │   ├─ ai-goal/
│   │   │   └─ route.ts
│   │   └─ calculator/
│   │       └─ route.ts
│   │
│   ├─ globals.css
│   ├─ layout.tsx
│   └─ page.tsx
│
├─ components/
│   ├─ onboarding/
│   │   └─ dashboard-tour.tsx
│   │
│   ├─ planner/
│   │   ├─ add-goal-modal.tsx
│   │   ├─ ai-goal-modal.tsx
│   │   ├─ constants.ts
│   │   ├─ goal-controls-panel.tsx
│   │   ├─ projection-chart.tsx
│   │   ├─ slider-field.tsx
│   │   ├─ summary-panel.tsx
│   │   └─ types.ts
│   │
│   └─ ui/
│       ├─ button.tsx
│       └─ card.tsx
│
├─ lib/
│   ├─ finance.ts
│   └─ utils.ts
│
├─ public/
│
├─ package.json
├─ next.config.ts
└─ tsconfig.json

````

---

# ⚙️ API Endpoints

## `/api/calculator`

Performs financial calculations server-side.

### Request

```json
{
  "goal": {
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
````

### Response

```json
{
  "metrics": {
    "futureGoalValue": 10000000,
    "projectedCorpus": 8123456,
    "requiredSip": 35123.45,
    "fundingGap": 1876544
  }
}
```

---

## `/api/ai-goal`

Converts natural language goals into structured financial assumptions.

### Request

```json
{
  "description": "Save for child education in 12 years"
}
```

### Response

```json
{
  "goal": {
    "name": "Child Education",
    "presentCost": 2500000,
    "years": 12,
    "monthlySip": 15000,
    "expectedAnnualReturn": 11,
    "inflationRate": 7
  }
}
```

---

# 🧮 Financial Calculation Engine

Located in:

```
lib/finance.ts
```

Main calculations:

### Future Goal Value

```
Future Value = Present Cost × (1 + Inflation)^Years
```

### SIP Corpus

```
FV = SIP × [((1+r)^n − 1) / r] × (1+r)
```

Where:

* `r` = monthly return
* `n` = months

---

# 🛠 Local Development

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start dev server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create:

```
.env.local
```

Add:

```
GROQ_API_KEY=your_api_key
```

⚠️ Never commit API keys to the repository.

---

# 🧪 Scripts

| Script          | Description           |
| --------------- | --------------------- |
| `npm run dev`   | Start dev server      |
| `npm run build` | Production build      |
| `npm run start` | Run production server |
| `npm run lint`  | Run ESLint            |

---

# 🚀 Deployment

## Recommended: Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variable

```
GROQ_API_KEY
```

4. Deploy

---

# 🧩 Known Limitations

* No automated tests yet
* AI route needs stronger validation
* Goals are currently stored in memory
* API key handling should use environment variables only

---

# 📌 Future Improvements

* Unit tests for financial calculations
* Persistent goal storage
* Portfolio allocation modeling
* Tax-aware projections
* Multi-currency support

---

# 🤝 Contributing

Contributions are welcome.

If you're new to the project, start here:

```
app/page.tsx
lib/finance.ts
components/planner/
```
