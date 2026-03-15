import { NextRequest, NextResponse } from "next/server";
import { calculateGoalMetrics, Goal, ScenarioKey } from "@/lib/finance";

type CalculatorPayload = {
  goal: Goal;
  scenario?: ScenarioKey;
  extraSip?: number;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CalculatorPayload;

    if (!payload?.goal) {
      return NextResponse.json({ error: "Goal payload is required." }, { status: 400 });
    }

    const metrics = calculateGoalMetrics(
      payload.goal,
      payload.scenario ?? "current",
      payload.extraSip ?? 0,
    );

    return NextResponse.json({ metrics }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process calculator request." },
      { status: 500 },
    );
  }
}
