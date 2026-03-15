"use client";

import { useCallback, useEffect, useRef } from "react";
import { HelpCircle } from "lucide-react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STORAGE_KEY = "goalstack-dashboard-tour-seen";

export function DashboardTour() {
  const driverRef = useRef<Driver | null>(null);

  const createDriver = useCallback(
    (markAsSeenOnClose: boolean) =>
      driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      overlayColor: "rgba(13, 27, 46, 0.72)",
      stagePadding: 8,
      stageRadius: 14,
      allowClose: true,
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Finish",
      showButtons: ["previous", "next", "close"],
      popoverClass: "goalstack-tour-popover",
      onDestroyed: () => {
        if (markAsSeenOnClose && typeof window !== "undefined") {
          window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
        }
      },
      steps: [
        {
          element: "#tour-header",
          popover: {
            title: "Welcome to GoalStack",
            description:
              "This is your planner dashboard. Here you define goals and see whether your investment plan can meet them.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-scenario-selector",
          popover: {
            title: "Scenario Selector",
            description:
              "Switch between market scenarios to compare outcomes. You can also use keyboard arrows to move between options.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-add-goal-button",
          popover: {
            title: "Add New Goal",
            description: "Create additional goals like retirement, education, or home purchase.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#tour-goal-controls",
          popover: {
            title: "Goal Controls",
            description:
              "This panel controls your goal assumptions: name, customer type, amount, SIP, period, return, and inflation.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-projection-chart",
          popover: {
            title: "Projection Chart",
            description:
              "See how your corpus is expected to grow over time versus your milestone checkpoints.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#tour-summary-panel",
          popover: {
            title: "Summary Insights",
            description:
              "Review projected corpus, funding gap, required SIP, and actionable guidance in one place.",
            side: "left",
            align: "start",
          },
        },
        // {
        //   element: "#tour-disclaimer",
        //   popover: {
        //     title: "Important Disclaimer",
        //     description:
        //       "Use this calculator for informational planning. Always validate assumptions before making investment decisions.",
        //     side: "top",
        //     align: "start",
        //   },
        // },
      ],
      }),
    [],
  );

  const startTour = useCallback(
    (markAsSeenOnClose: boolean) => {
      driverRef.current?.destroy();
      driverRef.current = createDriver(markAsSeenOnClose);
      driverRef.current.drive();
    },
    [createDriver],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenTour = window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    if (!hasSeenTour) {
      const timer = window.setTimeout(() => startTour(true), 240);
      return () => window.clearTimeout(timer);
    }

    return () => {
      driverRef.current?.destroy();
    };
  }, [startTour]);

  return (
    <button
      type="button"
      onClick={() => startTour(false)}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow-[0_10px_24px_rgba(20,41,71,0.14)] transition hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      aria-label="Open dashboard tour"
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" />
      Tour
    </button>
  );
}
