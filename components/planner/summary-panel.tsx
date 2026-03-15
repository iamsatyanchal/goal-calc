"use client";

import { KeyboardEventHandler, useMemo, useState } from "react";
import { CircleAlert, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { MetricRow } from "@/components/planner/metric-row";
import { SliderField } from "@/components/planner/slider-field";
import { EXTRA_SIP_OPTIONS, maturityDateFromYears } from "@/components/planner/constants";
import { Goal } from "@/lib/finance";
import { cn } from "@/lib/utils";

type SummaryTabKey = "overview" | "breakdown" | "action";

type SummaryPanelProps = {
  goal: Goal;
  goalHealth: number;
  projectedCorpus: string;
  projectedCorpusValue: number;
  projectedCorpusreturn: string;
  projectedCorpusReturnValue: number;
  futureGoalValue: string;
  futureGoalValueValue: number;
  inflatetextValue: string;
  fundingGap: string;
  fundingGapValue: number;
  totalmonthlySip: string;
  totalmonthlySipValue: number;
  requiredSip: string;
  requiredSipValue: number;
  annualReturnAssumption: number;
  inflationAssumption: number;
  simpleSuggestion: string;
  extraSip: number;
  onExtraSipChange: (value: number) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryPanel({
  goal,
  goalHealth,
  projectedCorpus,
  projectedCorpusValue,
  projectedCorpusreturn,
  projectedCorpusReturnValue,
  futureGoalValue,
  futureGoalValueValue,
  inflatetextValue,
  totalmonthlySip,
  totalmonthlySipValue,
  fundingGap,
  fundingGapValue,
  requiredSip,
  requiredSipValue,
  annualReturnAssumption,
  inflationAssumption,
  simpleSuggestion,
  extraSip,
  onExtraSipChange,
}: SummaryPanelProps) {
  const [activeTab, setActiveTab] = useState<SummaryTabKey>("overview");

  const tabs: { key: SummaryTabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "breakdown", label: "Breakdown" },
    // { key: "action", label: "Action" },
  ];
  const tabKeys = tabs.map((tab) => tab.key);

  const onTabsKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    if (event.key === "Home") {
      setActiveTab(tabKeys[0]);
      return;
    }

    if (event.key === "End") {
      setActiveTab(tabKeys[tabKeys.length - 1]);
      return;
    }

    const currentIndex = tabKeys.indexOf(activeTab);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + tabKeys.length) % tabKeys.length;
    setActiveTab(tabKeys[nextIndex]);
  };

  const allocationData = useMemo(() => {
    const data = [
      { name: "Your invested money", value: Math.max(0, totalmonthlySipValue), color: "#224c87" },
      { name: "Growth earned", value: Math.max(0, projectedCorpusReturnValue), color: "#47a881" },
    ];

    if (data.every((item) => item.value === 0)) {
      return [{ name: "No data yet", value: 1, color: "#d7e2ef" }];
    }

    return data;
  }, [projectedCorpusReturnValue, totalmonthlySipValue]);

  const assumptionData = useMemo(() => {
    const data = [
      { name: "Return assumption", value: Math.max(0, annualReturnAssumption), color: "#224c87" },
      { name: "Inflation assumption", value: Math.max(0, inflationAssumption), color: "#da3832" },
    ];

    if (data.every((item) => item.value === 0)) {
      return [{ name: "No assumptions", value: 1, color: "#d7e2ef" }];
    }

    return data;
  }, [annualReturnAssumption, inflationAssumption]);

  const progressData = useMemo(() => {
    const fundedValue = Math.min(projectedCorpusValue, futureGoalValueValue);
    const gapValue = Math.max(0, futureGoalValueValue - projectedCorpusValue);

    if (futureGoalValueValue <= 0) {
      return [{ name: "No target", value: 1, color: "#d7e2ef" }];
    }

    return [
      { name: "Covered", value: Math.max(0, fundedValue), color: "#224c87" },
      { name: "Still needed", value: gapValue, color: "#da3832" },
    ];
  }, [futureGoalValueValue, projectedCorpusValue]);

  const journeyData = useMemo(
    () => [
      { name: "Invested", value: Math.max(0, totalmonthlySipValue), color: "#224c87" },
      { name: "Growth", value: Math.max(0, projectedCorpusReturnValue), color: "#47a881" },
      { name: "Future goal cost", value: Math.max(0, futureGoalValueValue), color: "#da3832" },
    ],
    [futureGoalValueValue, projectedCorpusReturnValue, totalmonthlySipValue],
  );

  const monthlyPlanData = useMemo(
    () => [
      { name: "Current Monthly SIP Amount", value: Math.max(0, goal.monthlySip + extraSip), color: "#224c87" },
      { name: "Needed Monthly SIP Amount", value: Math.max(0, requiredSipValue), color: "#da3832" },
    ],
    [extraSip, goal.monthlySip, requiredSipValue],
  );

  return (
    <Card className="rounded-2xl bg-white p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-700)]">Summary</p>
          <h3 className="text-xl font-bold text-[var(--text-900)]">{goal.name}</h3>
          <p className="mt-1 text-sm font-medium text-[var(--text-700)]">Simple view of your target amount, monthly plan, and what to improve.</p>
        </div> */}
        <div className="grid w-full grid-cols-3 gap-2 md:w-auto" role="tablist" aria-label="Summary sections" onKeyDown={onTabsKeyDown}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] md:text-sm",
                activeTab === tab.key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border-strong)] text-[var(--text-700)] hover:bg-[var(--surface-soft)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="rounded-xl bg-[var(--highlight)] px-4 py-4 text-center">
            <p className="text-sm font-semibold text-[var(--primary)]">Estimated goal amount at target date</p>
            <p className="mt-1 inline-flex items-center gap-2 text-3xl font-bold text-[var(--primary)] md:text-4xl">
              <Wallet className="h-8 w-8" aria-hidden="true" /> {futureGoalValue}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--primary)] md:text-sm">Target + Inflation = {inflatetextValue}</p>
          </div>
            <Card className="mt-3 rounded-xl border-[var(--accent-soft)] bg-[var(--accent-bg)]">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--text-900)]">{simpleSuggestion}</p>
            </div>
          </Card>

          {/* <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className="rounded-xl border-[#d3def0] bg-[#eef4ff] p-4">
              <div className="mb-2 inline-flex items-center gap-2 text-[var(--primary)]">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-base font-bold">Return assumption</CardTitle>
              </div>
              <p className="text-3xl font-bold text-[var(--primary)]">{annualReturnAssumption.toFixed(2)}%</p>
              <p className="mt-1 text-xs font-medium text-[var(--text-700)]">This is the expected yearly growth of your investments.</p>
            </Card>

            <Card className="rounded-xl border-[var(--accent-soft)] bg-[var(--accent-bg)] p-4">
              <div className="mb-2 inline-flex items-center gap-2 text-[var(--accent)]">
                <PiggyBank className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-base font-bold">Inflation assumption</CardTitle>
              </div>
              <p className="text-3xl font-bold text-[var(--accent)]">{inflationAssumption.toFixed(2)}%</p>
              <p className="mt-1 text-xs font-medium text-[var(--text-700)]">This is the expected yearly rise in your goal cost.</p>
            </Card>
          </div> */}
   
          <div className="mt-4 space-y-3 px-1 text-sm mb-1">
            <MetricRow label="Money you may have by target date" value={projectedCorpus} />
            <MetricRow label="Total money you invest" value={totalmonthlySip} />
            <MetricRow label="Estimated growth earned" value={projectedCorpusreturn} />
            <MetricRow label="Amount still needed" value={fundingGap} />
            <MetricRow label="Required monthly SIP" value={requiredSip} />
            <MetricRow label="Target date" value={maturityDateFromYears(goal.years)} />
          </div>

            <Card className="rounded-xl mt-4.5">
            {/* <CardTitle className="mb-2 text-base font-bold">What is covered vs what is left</CardTitle> */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                 <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={progressData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} innerRadius={48}>
                      {progressData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
                <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={monthlyPlanData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf5" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value)).replace("₹", "")} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={112} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {monthlyPlanData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
    

          {/* <Card className="mt-3 rounded-xl bg-[var(--surface-soft)] p-4">
            <CardTitle className="mb-2 text-base font-bold">Plan health</CardTitle>
            <div
              className="h-2 rounded-full bg-white"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={goalHealth}
              aria-label="Goal health progress"
            >
              <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${goalHealth}%` }} />
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--text-700)]">{goalHealth}% of your goal is covered in this plan.</p>
          </Card> */}
        </>
      )}

      {activeTab === "breakdown" && (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className="rounded-xl">
              <CardTitle className="mb-1.5 text-base font-bold">Where the money comes from</CardTitle>
              <p className="text-xs font-medium text-[var(--text-700)]">This chart shows your own invested amount and expected growth.</p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={84} innerRadius={46}>
                      {allocationData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-xl">
              <CardTitle className="mb-1.5 text-base font-bold">Money journey at a glance</CardTitle>
              <p className="text-xs font-medium text-[var(--text-700)]">A comparison of invested amount, growth and final goal amount.</p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={journeyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value)).replace("₹", "")} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {journeyData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

            <Card className="mt-4 rounded-xl">
            <CardTitle className="mb-1.5 text-base font-bold">How these assumptions differ</CardTitle>
            <p className="text-xs font-medium text-[var(--text-700)]">Return helps your money grow. Inflation increases what you may need later.</p>
            <div className="mt-4 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assumptionData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {assumptionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {/* {activeTab === "action" && (
        <>
        

          <Card className="mt-3 rounded-xl border-[var(--accent-soft)] bg-[var(--accent-bg)] p-4">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--text-900)]">{simpleSuggestion}</p>
            </div>
          </Card>

          <Card className="mt-3 rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-bg)] p-4">
            <CardTitle className="mb-2 text-base font-bold">What if I invest more?</CardTitle>
            <p className="text-sm font-medium text-[var(--text-700)]">Adjust extra SIP and see your plan improve instantly.</p>

            <SliderField
              label="Extra SIP per month"
              value={extraSip}
              min={0}
              max={10000}
              step={500}
              onChange={onExtraSipChange}
              formatDisplay={(val) => `+ ${new Intl.NumberFormat("en-IN").format(val)}`}
              ariaLabel="Extra SIP per month"
              commitMode="instant"
            />

            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Extra SIP quick options">
              {EXTRA_SIP_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onExtraSipChange(amount)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                    extraSip === amount
                      ? "border-[var(--accent)] bg-white text-[var(--accent)]"
                      : "border-[var(--border-strong)] text-[var(--text-700)]",
                  )}
                  aria-label={`Increase SIP by rupees ${amount}`}
                >
                  + {new Intl.NumberFormat("en-IN").format(amount)}
                </button>
              ))}
            </div>
          </Card>
        </>
      )} */}
    </Card>
  );
}
