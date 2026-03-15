import { Goal } from "@/lib/finance";
import { Milestone } from "@/components/planner/types";

export const INITIAL_GOALS: Goal[] = [
  {
    id: "goal-house",
    name: "Buy a House",
    presentCost: 5000000,
    years: 12,
    monthlySip: 28000,
    expectedAnnualReturn: 12,
    inflationRate: 6,
  },
  {
    id: "goal-education",
    name: "Child Education",
    presentCost: 3000000,
    years: 10,
    monthlySip: 17000,
    expectedAnnualReturn: 11,
    inflationRate: 7,
  },
  // {
  //   id: "goal-vacation",
  //   name: "Dream Vacation",
  //   presentCost: 900000,
  //   years: 5,
  //   monthlySip: 11000,
  //   expectedAnnualReturn: 10,
  //   inflationRate: 5,
  // },
];

export const QUICK_AMOUNTS = [
  { label: "5L", value: 500000 },
  { label: "10L", value: 1000000 },
  { label: "25L", value: 2500000 },
  { label: "50L", value: 5000000 },
  { label: "1Cr", value: 10000000 },
  { label: "10Cr", value: 100000000 },
  { label: "15Cr", value: 150000000 },
];

export const GOAL_NAME_SUGGESTIONS = [
  "Buy a House",
  "Child Education",
  "Dream Vacation",
  "Retirement Corpus",
  "Emergency Fund",
  "Startup Capital",
];

export const EXTRA_SIP_OPTIONS = [1000, 2500, 5000, 8000, 10000];

export const GOAL_MILESTONES: Milestone[] = [
  { year: 5, label: "Halfway milestone" },
  { year: 10, label: "Education goal" },
  { year: 18, label: "House purchase" },
];

export function maturityDateFromYears(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toLocaleDateString("en-IN");
}
