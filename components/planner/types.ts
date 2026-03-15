export type GoalFormValues = {
  name: string;
  presentCost: number;
  years: number;
  monthlySip: number;
  expectedAnnualReturn: number;
  inflationRate: number;
};

export type CustomerType = "regular" | "senior";

export type AiGeneratedGoal = GoalFormValues & {
  customerType?: CustomerType;
};

export type Milestone = {
  year: number;
  label: string;
};
