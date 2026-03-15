"use client";

import { FormEvent, KeyboardEventHandler, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AiGoalModal } from "@/components/planner/ai-goal-modal";
import { DashboardTour } from "@/components/onboarding/dashboard-tour";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddGoalModal } from "@/components/planner/add-goal-modal";
import { GoalControlsPanel } from "@/components/planner/goal-controls-panel";
import {
  GOAL_MILESTONES,
  INITIAL_GOALS,
} from "@/components/planner/constants";
import { ProjectionChart } from "@/components/planner/projection-chart";
import { SummaryPanel } from "@/components/planner/summary-panel";
import { AiGeneratedGoal, CustomerType, GoalFormValues } from "@/components/planner/types";
import {
  buildProjectionSeries,
  calculateGoalMetrics,
  formatInr,
  Goal,
  SCENARIOS,
  ScenarioKey,
} from "@/lib/finance";
import { cn } from "@/lib/utils";

type AiGoalResponse = {
  goal: AiGeneratedGoal;
};

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [activeGoalId, setActiveGoalId] = useState(INITIAL_GOALS[0].id);
  const [scenario, setScenario] = useState<ScenarioKey>("current");
  const [customerType, setCustomerType] = useState<CustomerType>("regular");
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAiGoalOpen, setIsAiGoalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGoalError, setAiGoalError] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [extraSip, setExtraSip] = useState(0);

  const activeGoal = goals.find((goal) => goal.id === activeGoalId) ?? INITIAL_GOALS[0];

  const effectiveGoal = useMemo(
    () => ({
      ...activeGoal,
      expectedAnnualReturn:
        activeGoal.expectedAnnualReturn + (customerType === "senior" ? 0.35 : 0),
    }),
    [activeGoal, customerType],
  );

  const goalMetrics = useMemo(
    () => calculateGoalMetrics(effectiveGoal, scenario, extraSip),
    [effectiveGoal, scenario, extraSip],
  );

  const projectionData = useMemo(
    () => buildProjectionSeries(effectiveGoal, scenario, extraSip),
    [effectiveGoal, scenario, extraSip],
  );

  const goalHealth = useMemo(() => {
    if (goalMetrics.futureGoalValue <= 0) return 0;
    return Math.min(100, Math.round((goalMetrics.projectedCorpus / goalMetrics.futureGoalValue) * 100));
  }, [goalMetrics.futureGoalValue, goalMetrics.projectedCorpus]);

  const updateGoal = (key: keyof GoalFormValues, value: string | number) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === activeGoalId ? { ...goal, [key]: value } : goal)),
    );
  };

  const addGoalWithName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const goalName = newGoalName.trim() || `New Goal ${goals.length + 1}`;

    const next: Goal = {
      id: `goal-${Date.now()}`,
      name: goalName,
      presentCost: 1500000,
      years: 8,
      monthlySip: 12000,
      expectedAnnualReturn: 11,
      inflationRate: 6,
    };

    setGoals((prev) => [...prev, next]);
    setActiveGoalId(next.id);
    setExtraSip(0);
    setNewGoalName("");
    setIsAddGoalOpen(false);
  };

  const closeAddGoalModal = () => {
    setIsAddGoalOpen(false);
    setNewGoalName("");
  };

  const applyGeneratedGoal = (goal: AiGeneratedGoal) => {
    setGoals((prev) =>
      prev.map((item) =>
        item.id === activeGoalId
          ? {
              ...item,
              name: goal.name,
              presentCost: goal.presentCost,
              years: goal.years,
              monthlySip: goal.monthlySip,
              expectedAnnualReturn: goal.expectedAnnualReturn,
              inflationRate: goal.inflationRate,
            }
          : item,
      ),
    );

    if (goal.customerType === "regular" || goal.customerType === "senior") {
      setCustomerType(goal.customerType);
    }
    setExtraSip(0);
  };

  const generateGoalFromAi = async (description: string) => {
    try {
      setAiGoalError("");
      setIsAiGenerating(true);

      const response = await fetch("/api/ai-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = (await response.json()) as AiGoalResponse | { error: string };

      if (!response.ok || !("goal" in data)) {
        const message = "error" in data ? data.error : "Unable to generate goal right now.";
        throw new Error(message);
      }

      applyGeneratedGoal(data.goal);
      setIsAiGoalOpen(false);
    } catch (error) {
      setAiGoalError(
        error instanceof Error ? error.message : "Unable to generate goal right now.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const deleteGoal = (goalId: string) => {
    if (goals.length <= 1) return;

    const updated = goals.filter((goal) => goal.id !== goalId);
    setGoals(updated);

    if (goalId === activeGoalId) {
      setActiveGoalId(updated[0].id);
      setExtraSip(0);
    }
  };

  const simpleSuggestion =
    goalMetrics.fundingGap > 0
      ? `Increase SIP by ${formatInr(goalMetrics.suggestedSipIncrease)} per month to stay on track.`
      : "Great progress. You are already on track for this goal.";

  const scenarioOptions = Object.keys(SCENARIOS) as ScenarioKey[];

  const onScenarioKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    if (event.key === "Home") {
      setScenario(scenarioOptions[0]);
      return;
    }

    if (event.key === "End") {
      setScenario(scenarioOptions[scenarioOptions.length - 1]);
      return;
    }

    const currentIndex = scenarioOptions.indexOf(scenario);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + scenarioOptions.length) % scenarioOptions.length;
    setScenario(scenarioOptions[nextIndex]);
  };

  return (
    <main className="min-h-screen py-6 md:px-6 md:py-8" aria-label="GoalStack financial planning dashboard">
      <div className="mx-auto max-w-[1220px] space-y-6">
        <header id="tour-header" className="space-y-2">
          <p className="text-center text-base font-semibold text-[var(--text-700)]">
            Plan smart. Invest better. Reach your goals with confidence.
          </p>
          <h1 className="text-center text-3xl font-bold tracking-tight text-[var(--text-900)] md:text-4xl">
            GoalStack Financial Planner
          </h1>
        </header>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-[0_12px_36px_rgba(20,41,71,0.08)] md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-900)]">Goal Investment Planner</h2>
              <p className="text-sm font-medium text-[var(--text-700)]">
                Edit assumptions and track your goal with live projections.
              </p>
            </div>
            <div className="flex items-center gap-2" id="tour-top-controls">
              <div
                id="tour-scenario-selector"
                className="inline-flex rounded-xl border border-[var(--border-strong)] bg-white p-1"
                role="tablist"
                aria-label="Scenario selector"
                onKeyDown={onScenarioKeyDown}
              >
                {scenarioOptions.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScenario(key)}
                    tabIndex={key === scenario ? 0 : -1}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                      key === scenario
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-700)]",
                    )}
                    aria-label={`Use ${SCENARIOS[key].label} scenario`}
                    role="tab"
                    aria-selected={key === scenario}
                  >
                    {SCENARIOS[key].label}
                  </button>
                ))}
              </div>
              <Button
                id="tour-add-goal-button"
                className="h-10 px-3"
                onClick={() => setIsAddGoalOpen(true)}
                aria-label="Open add goal modal"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Add Goal
              </Button>
            </div>
          </div>

          <Card id="tour-projection-chart" className="mb-4 rounded-2xl bg-white p-4 md:p-5">
            <ProjectionChart
              data={projectionData}
              goalName={effectiveGoal.name}
              projectedCorpus={goalMetrics.projectedCorpus}
              milestones={GOAL_MILESTONES}
            />
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div id="tour-goal-controls">
              <GoalControlsPanel
              goals={goals}
              activeGoalId={activeGoalId}
              effectiveGoal={effectiveGoal}
              customerType={customerType}
              onSelectGoal={(goalId) => {
                setActiveGoalId(goalId);
                setExtraSip(0);
              }}
              onDeleteGoal={deleteGoal}
              onOpenAiGoalModal={() => {
                setAiGoalError("");
                setIsAiGoalOpen(true);
              }}
              onCustomerTypeChange={setCustomerType}
              onUpdateGoal={updateGoal}
            />
            </div>

            <div id="tour-summary-panel">
              <SummaryPanel
              goal={effectiveGoal}
              goalHealth={goalHealth}
              projectedCorpus={formatInr(goalMetrics.projectedCorpus)}
              projectedCorpusValue={goalMetrics.projectedCorpus}
              futureGoalValue={formatInr(goalMetrics.futureGoalValue)}
              futureGoalValueValue={goalMetrics.futureGoalValue}
              projectedCorpusreturn={goalMetrics.projectedCorpusreturn}
              projectedCorpusReturnValue={goalMetrics.projectedCorpusReturnAmount}
              inflatetextValue={goalMetrics.inflatetextValue}
              totalmonthlySip={formatInr(goalMetrics.totalmonthlySip)}
              totalmonthlySipValue={goalMetrics.totalmonthlySip}
              fundingGap={formatInr(goalMetrics.fundingGap)}
              fundingGapValue={goalMetrics.fundingGap}
              requiredSip={formatInr(goalMetrics.requiredSip)}
              requiredSipValue={goalMetrics.requiredSip}
              annualReturnAssumption={goalMetrics.annualReturn}
              inflationAssumption={goalMetrics.inflationRate}
              simpleSuggestion={simpleSuggestion}
              extraSip={extraSip}
              onExtraSipChange={setExtraSip}
            />
            </div>
          </div>
        </section>

        <footer id="tour-disclaimer" className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-xs font-medium leading-relaxed text-[var(--text-700)] md:text-xs text-center">
          <p>
            Disclaimer: This tool has been designed for information purposes only. Actual
            results may vary depending on various factors involved in capital market. Investor
            should not consider above as a recommendation for any schemes of HDFC Mutual Fund.
            Past performance may or may not be sustained in future and is not a guarantee of any
            future returns.
          </p>
        </footer>
      </div>

      <DashboardTour />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        goalName={newGoalName}
        onGoalNameChange={setNewGoalName}
        onClose={closeAddGoalModal}
        onSubmit={addGoalWithName}
      />

      <AiGoalModal
        isOpen={isAiGoalOpen}
        isGenerating={isAiGenerating}
        errorMessage={aiGoalError}
        onClose={() => {
          if (isAiGenerating) return;
          setIsAiGoalOpen(false);
          setAiGoalError("");
        }}
        onGenerate={generateGoalFromAi}
      />
    </main>
  );
}
