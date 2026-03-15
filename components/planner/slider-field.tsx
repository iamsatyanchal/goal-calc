"use client";

import { CSSProperties, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatDisplay: (value: number) => string;
  quickItems?: Array<{ label: string; value: number }>;
  ariaLabel?: string;
  commitMode?: "instant" | "lazy";
};

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatDisplay,
  quickItems,
  ariaLabel,
  commitMode = "lazy",
}: SliderFieldProps) {
  const sliderId = useId();
  const [localValue, setLocalValue] = useState(value);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!isEditingValue) {
      setLocalValue(value);
    }
  }, [isEditingValue, value]);

  const clampValue = (raw: number) => Math.max(min, Math.min(max, raw));

  const commitValue = (nextValue: number) => {
    const clamped = clampValue(nextValue);
    setLocalValue(clamped);
    onChange(clamped);
  };

  const submitInlineEdit = () => {
    const parsed = Number(editingText);
    if (Number.isFinite(parsed)) {
      commitValue(parsed);
    }
    setIsEditingValue(false);
  };

  const liveDisplay = formatDisplay(localValue);
  const progress = ((localValue - min) / (max - min || 1)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={sliderId} className="text-lg font-semibold text-[var(--text-900)]">
          {label}
        </label>
        {isEditingValue ? (
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={editingText}
            onChange={(event) => setEditingText(event.target.value)}
            onBlur={submitInlineEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitInlineEdit();
              }
              if (event.key === "Escape") {
                setIsEditingValue(false);
              }
            }}
            className="h-9 rounded-lg border border-[var(--border-strong)] bg-white px-3 text-right text-sm font-bold text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label={`${ariaLabel || label} inline value editor`}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingText(String(localValue));
              setIsEditingValue(true);
            }}
            className="inline-flex items-center justify-end rounded-lg border border-[var(--border-strong)] bg-white px-3 py-1.5 text-sm font-bold text-[var(--primary)] transition-colors hover:border-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label={`Edit ${ariaLabel || label} value`}
            title={`Click to edit ${label}`}
          >
            {liveDisplay}
          </button>
        )}
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          setLocalValue(nextValue);
          if (commitMode === "instant") {
            commitValue(nextValue);
          }
        }}
        onPointerUp={() => commitMode === "lazy" && commitValue(localValue)}
        onKeyUp={() => commitMode === "lazy" && commitValue(localValue)}
        onBlur={() => commitMode === "lazy" && commitValue(localValue)}
        className="gs-slider w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={ariaLabel || `${label} slider`}
        title={liveDisplay}
        style={{ "--slider-progress": `${progress}%` } as CSSProperties}
      />

      <div className="mt-1 flex items-center justify-between text-sm font-medium text-[var(--text-700)]">
        <span>{min.toLocaleString("en-IN")}</span>
        <span>{max.toLocaleString("en-IN")}</span>
      </div>

      {quickItems ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`${label} quick picks`}>
          {quickItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.value)}
              className={cn(
                "rounded-lg border px-3 py-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                value === item.value
                  ? "border-[var(--primary)] bg-white text-[var(--primary)]"
                  : "border-[var(--border-strong)] text-[var(--text-700)]",
              )}
              aria-label={`Set ${label} to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
