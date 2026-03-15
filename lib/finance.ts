export type Goal = {
  id: string;
  name: string;
  presentCost: number;
  years: number;
  monthlySip: number;
  expectedAnnualReturn: number;
  inflationRate: number;
};

export type ScenarioKey = "current" | "optimistic" | "conservative";

export type ScenarioConfig = {
  label: string;
  annualReturnDelta: number;
  inflationDelta: number;
};

export type ProjectionPoint = {
  year: number;
  investmentGrowth: number;
  goalInflationCost: number;
  goalCostToday: number;
};

export const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  current: {
    label: "Current Plan",
    annualReturnDelta: 0,
    inflationDelta: 0,
  },
  optimistic: {
    label: "Optimistic",
    annualReturnDelta: 1.5,
    inflationDelta: -0.5,
  },
  conservative: {
    label: "Conservative",
    annualReturnDelta: -1.5,
    inflationDelta: 0.5,
  },
};

export function clampRate(rate: number) {
  return Math.max(0, rate);
}

export function inflateGoalValue(
  presentCost: number,
  inflationRatePct: number,
  years: number,
) {
  const inflationRate = clampRate(inflationRatePct) / 100;
  console.log(`inflation: ${presentCost * (1 + inflationRate) ** years}`);
  const myinflationRate = presentCost * (1 + inflationRate) ** years;
  const myinflationonly = myinflationRate - presentCost;
  //   return `${myinflationonly} inflation, total ${myinflationRate}`;
  return presentCost * (1 + inflationRate) ** years;
}

export function inflatetext(
  presentCost: number,
  inflationRatePct: number,
  years: number,
) {
  const inflationRate = clampRate(inflationRatePct) / 100;
  console.log(`inflation: ${presentCost * (1 + inflationRate) ** years}`);
  const myinflationRate = presentCost * (1 + inflationRate) ** years;
  const myinflationonly = myinflationRate - presentCost;

  return `${formatInr(myinflationRate - myinflationonly)} + ${formatInr(myinflationonly)}`;
  //   return `${formatInr(myinflationRate)} (${formatInr(myinflationRate-myinflationonly)} + ${formatInr(myinflationonly)}) `;
}

export function calculateRequiredSip(
  targetFutureValue: number,
  annualReturnPct: number,
  totalMonths: number,
) {
  if (totalMonths <= 0 || targetFutureValue <= 0) return 0;

  const monthlyRate = clampRate(annualReturnPct) / 12 / 100;

  if (monthlyRate === 0) {
    return targetFutureValue / totalMonths;
  }

  const numerator = targetFutureValue * monthlyRate;
  const denominator = ((1 + monthlyRate) ** totalMonths - 1) * (1 + monthlyRate);

  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function calculateProjectedCorpus(
  monthlySip: number,
  annualReturnPct: number,
  years: number,
) {
  const totalMonths = years * 12;
  if (totalMonths <= 0 || monthlySip <= 0) {
    return {
      totalmonthlySip: 0,
      finalvalue: 0,
      finalreturn: 0,
    };
  }

  const monthlyRate = clampRate(annualReturnPct) / (12 * 100);

  if (monthlyRate === 0) {
    return {
      totalmonthlySip: monthlySip * totalMonths,
      finalvalue: monthlySip * totalMonths,
      finalreturn: 0,
    };
  }

  const finalvalue = monthlySip * ((((1 + monthlyRate) ** totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const returnvalue = finalvalue - monthlySip * totalMonths;
  return (
    {
      totalmonthlySip: finalvalue - returnvalue,
      finalvalue: finalvalue,
      finalreturn: returnvalue
    }
  );
}

export function calculateGoalMetrics(
  goal: Goal,
  scenario: ScenarioKey,
  extraMonthlySip = 0,
) {
  const { annualReturnDelta, inflationDelta } = SCENARIOS[scenario];
  const annualReturn = clampRate(goal.expectedAnnualReturn + annualReturnDelta);
  const inflationRate = clampRate(goal.inflationRate + inflationDelta);
  const totalMonths = goal.years * 12;

  const futureGoalValue = inflateGoalValue(goal.presentCost, inflationRate, goal.years);
  const inflatetextValue = inflatetext(goal.presentCost, inflationRate, goal.years);
  console.log(inflatetextValue);
  const projectedCorpusinit = calculateProjectedCorpus(
    goal.monthlySip + extraMonthlySip,
    annualReturn,
    goal.years,
  );
  const projectedCorpus = projectedCorpusinit.finalvalue;
  const projectedCorpusreturn = formatInr(projectedCorpusinit.finalreturn);
  const projectedCorpusReturnAmount = projectedCorpusinit.finalreturn;
  const totalmonthlySip = projectedCorpusinit.totalmonthlySip;
  console.log(projectedCorpusreturn);
  const requiredSip = calculateRequiredSip(futureGoalValue, annualReturn, totalMonths);
  const fundingGap = Math.max(0, futureGoalValue - projectedCorpus);

  return {
    annualReturn,
    inflationRate,
    months: totalMonths,
    futureGoalValue,
    inflatetextValue,
    totalmonthlySip,
    projectedCorpus,
    projectedCorpusreturn,
    projectedCorpusReturnAmount,
    requiredSip,
    fundingGap,
    suggestedSipIncrease: Math.max(0, requiredSip - (goal.monthlySip + extraMonthlySip)),
  };
}

export function buildProjectionSeries(
  goal: Goal,
  scenario: ScenarioKey,
  extraMonthlySip = 0,
) {
  const { annualReturnDelta, inflationDelta } = SCENARIOS[scenario];
  const annualReturn = clampRate(goal.expectedAnnualReturn + annualReturnDelta);
  const inflationRate = clampRate(goal.inflationRate + inflationDelta);
  const monthlyRate = annualReturn / 12 / 100;
  const monthlySip = goal.monthlySip + extraMonthlySip;
  const result: ProjectionPoint[] = [];

  for (let year = 0; year <= goal.years; year += 1) {
    const months = year * 12;

    let investmentGrowth = 0;
    if (months > 0 && monthlySip > 0) {
      if (monthlyRate === 0) {
        investmentGrowth = monthlySip * months;
      } else {
        investmentGrowth =
          monthlySip * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
      }
    }

    const goalInflationCost = goal.presentCost * (1 + inflationRate / 100) ** year;

    result.push({
      year,
      investmentGrowth,
      goalInflationCost,
      goalCostToday: goal.presentCost,
    });
  }

  return result;
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
