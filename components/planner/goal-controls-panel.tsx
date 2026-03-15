"use client";

import { Sparkles, Trash2 } from "lucide-react";
import { KeyboardEventHandler, useId } from "react";
import { Card } from "@/components/ui/card";
import { SliderField } from "@/components/planner/slider-field";
import {
  GOAL_NAME_SUGGESTIONS,
  QUICK_AMOUNTS,
} from "@/components/planner/constants";
import { CustomerType, GoalFormValues } from "@/components/planner/types";
import { Goal } from "@/lib/finance";
import { cn } from "@/lib/utils";

type GoalControlsPanelProps = {
  goals: Goal[];
  activeGoalId: string;
  effectiveGoal: Goal;
  customerType: CustomerType;
  onSelectGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenAiGoalModal: () => void;
  onCustomerTypeChange: (value: CustomerType) => void;
  onUpdateGoal: (key: keyof GoalFormValues, value: string | number) => void;
};

export function GoalControlsPanel({
  goals,
  activeGoalId,
  effectiveGoal,
  customerType,
  onSelectGoal,
  onDeleteGoal,
  onOpenAiGoalModal,
  onCustomerTypeChange,
  onUpdateGoal,
}: GoalControlsPanelProps) {
  const goalNameInputId = useId();
  const customerTypeOptions: CustomerType[] = ["regular", "senior"];
  const goalIds = goals.map((goal) => goal.id);

  const onCustomerTypeKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    if (event.key === "Home") {
      onCustomerTypeChange(customerTypeOptions[0]);
      return;
    }

    if (event.key === "End") {
      onCustomerTypeChange(customerTypeOptions[customerTypeOptions.length - 1]);
      return;
    }

    const currentIndex = customerTypeOptions.indexOf(customerType);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + customerTypeOptions.length) % customerTypeOptions.length;
    onCustomerTypeChange(customerTypeOptions[nextIndex]);
  };

  const onGoalTabsKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    if (event.key === "Home") {
      onSelectGoal(goalIds[0]);
      return;
    }

    if (event.key === "End") {
      onSelectGoal(goalIds[goalIds.length - 1]);
      return;
    }

    const currentIndex = goalIds.indexOf(activeGoalId);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + goalIds.length) % goalIds.length;
    onSelectGoal(goalIds[nextIndex]);
  };

  return (
    <Card className="rounded-2xl bg-[var(--panel-left)] p-4 md:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--text-900)]">Choose your Goal</span>
        {/* <button
          type="button"
          onClick={onOpenAiGoalModal}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          aria-label="Open AI goal generator"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Auto Generate
        </button> */}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenAiGoalModal}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-white px-1.5 py-1.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          aria-label="Open AI goal generator"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Auto Generate
        </button>
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Goal tabs" onKeyDown={onGoalTabsKeyDown}>
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2 py-1",
              goal.id === activeGoalId
                ? "border-[var(--primary)] bg-white"
                : "border-[var(--border-strong)] bg-transparent",
            )}
          >
            <button
              type="button"
              onClick={() => onSelectGoal(goal.id)}
              className={cn(
                "px-1 py-0.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                goal.id === activeGoalId ? "text-[var(--primary)]" : "text-[var(--text-700)]",
              )}
              aria-pressed={goal.id === activeGoalId}
              role="tab"
              aria-selected={goal.id === activeGoalId}
              tabIndex={goal.id === activeGoalId ? 0 : -1}
              aria-label={`Select ${goal.name}`}
            >
              {goal.name}
            </button>
            <button
              type="button"
              onClick={() => onDeleteGoal(goal.id)}
              disabled={goals.length <= 1}
              className="rounded p-1 text-[var(--text-700)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-40"
              aria-label={`Delete ${goal.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block" htmlFor={goalNameInputId}>
          <span className="mb-1 block text-sm font-semibold text-[var(--text-900)]">Goal Name</span>
          <input
            id={goalNameInputId}
            list="goal-suggestion-list"
            value={effectiveGoal.name}
            onChange={(e) => onUpdateGoal("name", e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Goal name"
          />
          <datalist id="goal-suggestion-list">
            {GOAL_NAME_SUGGESTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </label>

        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--text-900)]">Customer Type</p>
          <div
            className="inline-flex rounded-xl border border-[var(--border-strong)] bg-white p-1"
            role="radiogroup"
            aria-label="Customer type"
            onKeyDown={onCustomerTypeKeyDown}
          >
            <button
              type="button"
              role="radio"
              aria-checked={customerType === "regular"}
              onClick={() => onCustomerTypeChange("regular")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                customerType === "regular"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text-700)]",
              )}
              aria-label="Regular customer"
            >
              Regular
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={customerType === "senior"}
              onClick={() => onCustomerTypeChange("senior")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                customerType === "senior"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text-700)]",
              )}
              aria-label="Senior citizen customer"
            >
              Senior Citizen
            </button>
          </div>
        </div>

        <SliderField
          label="Target Amount"
          value={effectiveGoal.presentCost}
          min={1000}
          max={150000000}
          step={500}
          quickItems={QUICK_AMOUNTS}
          onChange={(value) => onUpdateGoal("presentCost", value)}
          formatDisplay={(val) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(val)
          }
          ariaLabel="Target amount"
        />

        <SliderField
          label="Monthly SIP"
          value={effectiveGoal.monthlySip}
          min={100}
          max={5000000}
          step={1000}
          onChange={(value) => onUpdateGoal("monthlySip", value)}
          formatDisplay={(val) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(val)
          }
          ariaLabel="Monthly SIP"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SliderField
            label="Investment Period"
            value={effectiveGoal.years}
            min={1}
            max={60}
            step={1}
            onChange={(value) => onUpdateGoal("years", value)}
            formatDisplay={(val) => `${Math.round(val)} yrs`}
            ariaLabel="Investment period"
          />
          <SliderField
            label="Expected Return"
            value={effectiveGoal.expectedAnnualReturn}
            min={1}
            max={20}
            step={0.1}
            onChange={(value) => onUpdateGoal("expectedAnnualReturn", value)}
            formatDisplay={(val) => `${val.toFixed(2)}%`}
            ariaLabel="Expected annual return"
          />
        </div>

        <SliderField
          label="Inflation Rate"
          value={effectiveGoal.inflationRate}
          min={1}
          max={15}
          step={0.1}
          onChange={(value) => onUpdateGoal("inflationRate", value)}
          formatDisplay={(val) => `${val.toFixed(2)}%`}
          ariaLabel="Inflation rate"
        />
      </div>
    </Card>
  );
}
