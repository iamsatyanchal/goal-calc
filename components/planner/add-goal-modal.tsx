"use client";

import { FormEvent, useId } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AddGoalModalProps = {
  isOpen: boolean;
  goalName: string;
  onGoalNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddGoalModal({
  isOpen,
  goalName,
  onGoalNameChange,
  onClose,
  onSubmit,
}: AddGoalModalProps) {
  const goalNameInputId = useId();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,33,58,0.45)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-goal-title"
    >
      <Card className="w-full max-w-md rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="add-goal-title" className="text-xl font-bold text-[var(--text-900)]">
            Add New Goal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-700)] hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Close add goal modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-3 text-sm font-medium text-[var(--text-700)]">
          Enter a goal name. You can adjust amounts and timelines after creating it.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor={goalNameInputId} className="block text-sm font-semibold text-[var(--text-900)]">
            Goal Name
          </label>
          <input
            id={goalNameInputId}
            value={goalName}
            onChange={(event) => onGoalNameChange(event.target.value)}
            placeholder="Example: Retirement Corpus"
            className="h-11 w-full rounded-xl border border-[var(--border-strong)] px-3 text-sm font-medium text-[var(--text-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="New goal name"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="h-10 px-4" aria-label="Cancel add goal">
              Cancel
            </Button>
            <Button type="submit" className="h-10 px-4" aria-label="Create goal">
              Create Goal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
