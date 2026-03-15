"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AiGoalModalProps = {
  isOpen: boolean;
  isGenerating: boolean;
  errorMessage: string;
  onClose: () => void;
  onGenerate: (description: string) => Promise<void>;
};

export function AiGoalModal({
  isOpen,
  isGenerating,
  errorMessage,
  onClose,
  onGenerate,
}: AiGoalModalProps) {
  const goalDescriptionId = useId();
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = description.trim();
    if (!value || isGenerating) return;
    await onGenerate(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,33,58,0.45)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-goal-title"
    >
      <Card className="w-full max-w-xl rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="ai-goal-title" className="text-xl font-bold text-[var(--text-900)]">
            Auto Generate Goal with AI
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-lg p-1 text-[var(--text-700)] hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close AI goal modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mb-3 text-sm font-medium text-[var(--text-700)]">
          Describe your goal in plain text. For best results include target amount, timeline,
          monthly SIP comfort, and risk preference.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor={goalDescriptionId} className="block text-sm font-semibold text-[var(--text-900)]">
            Goal Description
          </label>
          <textarea
            id={goalDescriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: I want to build a retirement corpus of 2 crore in 18 years. I can invest around 22,000 monthly and prefer balanced risk."
            className="min-h-32 w-full rounded-xl border border-[var(--border-strong)] px-3 py-2 text-sm font-medium text-[var(--text-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Describe your goal"
            autoFocus
            disabled={isGenerating}
          />

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 px-4"
              aria-label="Cancel AI goal generation"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 gap-2 px-4"
              aria-label="Auto generate goal"
              disabled={isGenerating || !description.trim()}
            >
              {isGenerating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Auto Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
