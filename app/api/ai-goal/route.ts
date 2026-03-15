import { NextRequest, NextResponse } from "next/server";
import { AiGeneratedGoal, CustomerType } from "@/components/planner/types";

type GroqMessage = {
  role: "system" | "user";
  content: string;
};

type GroqRequestBody = {
  messages: GroqMessage[];
  model: string;
  temperature: number;
  max_completion_tokens: number;
  top_p: number;
  stream: boolean;
  reasoning_effort: "none";
  response_format: {
    type: "json_object";
  };
  stop: null;
};

type GroqResponseBody = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type RequestPayload = {
  description?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCustomerType(value: unknown): CustomerType | undefined {
  if (value === "regular" || value === "senior") return value;
  return undefined;
}

function sanitizeGoal(payload: Record<string, unknown>): AiGeneratedGoal {
  const name = typeof payload.name === "string" && payload.name.trim()
    ? payload.name.trim().slice(0, 60)
    : "AI Generated Goal";

  return {
    name,
    presentCost: Math.round(clamp(toNumber(payload.presentCost, 1500000), 200000, 30000000)),
    years: Math.round(clamp(toNumber(payload.years, 8), 1, 30)),
    monthlySip: Math.round(clamp(toNumber(payload.monthlySip, 12000), 100, 500000)),
    expectedAnnualReturn: clamp(toNumber(payload.expectedAnnualReturn, 11), 1, 18),
    inflationRate: clamp(toNumber(payload.inflationRate, 6), 1, 12),
    customerType: normalizeCustomerType(payload.customerType),
  };
}

const SYSTEM_PROMPT = [
  "You are a financial planning assistant for an Indian goal-based SIP investment planner.",
  "Your task is to convert the user's natural language goal description into a realistic financial planning configuration for an educational financial calculator.",
  "",
  "The calculator is designed to help everyday investors understand how systematic investments grow over time using SIPs (Systematic Investment Plans).",
  "The goal is educational clarity, not financial advice or product recommendation.",
  "",
  "Interpret the user's intent and estimate reasonable financial assumptions based on typical Indian market expectations. If user mentions some materialstic thing then you have to estimate the current cost to actually predict or set the goal amount if not mentioned..",
  "",
  "Return only valid JSON with this exact shape:",
  '{"name": string, "presentCost": number, "years": number, "monthlySip": number, "expectedAnnualReturn": number, "inflationRate": number, "customerType": "regular" | "senior"}',
  "",
  "Field meanings:",
  "- name: short readable name for the financial goal.",
  "- presentCost: estimated cost of the goal in today's INR value.",
  "- years: number of years until the goal occurs.",
  "- monthlySip: estimated SIP required to work toward the goal. {you have to calculate this or atleast be realistic}",
  "- expectedAnnualReturn: assumed annual investment return percentage.",
  "- inflationRate: annual inflation percentage affecting the goal cost.",
  "- customerType: 'regular' for general investors or 'senior' if the goal clearly relates to retirement age planning.",
  "",
  "Financial assumptions for India (use realistic ranges):",
  "- Expected equity mutual fund returns typically range from 10% to 13% annually.",
  "- Conservative balanced returns may range from 8% to 10%.",
  "- General inflation typically ranges from 5% to 7%.",
  "- Education inflation may range from 7% to 9%.",
  "- Healthcare inflation may range from 8% to 10%.",
  "",
  "Goal estimation guidelines:",
  "- If the user mentions buying a house, assume costs between ₹30L and ₹1Cr depending on context.",
  "- If the user mentions child education, estimate ₹20L–₹40L depending on years.",
  "- If the user mentions retirement planning, estimate corpus based on long-term expenses.",
  "- If the user mentions travel or vacation, estimate ₹2L–₹10L.",
  "",
  "SIP estimation rules:",
  "- monthlySip should be practical and realistic relative to the goal cost and years.",
  "- It must always be a positive number.",
  "- Avoid extremely unrealistic SIP values.",
  "",
  "Other rules:",
  "- presentCost must be the estimated goal cost today in INR.",
  "- years must be a whole number.",
  "- expectedAnnualReturn and inflationRate must be percentage numbers (not decimals).",
  "- customerType must be either 'regular' or 'senior'.",
  "",
  "Output rules:",
  "- Return JSON only.",
  "- Do not include markdown.",
  "- Do not include explanations.",
  "- Do not include extra keys.",
  "- The response must be a single JSON object matching the schema exactly."
].join("\n");

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestPayload;
    const description = body.description?.trim();

    if (!description) {
      return NextResponse.json({ error: "Goal description is required." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables." },
        { status: 500 },
      );
    }

    const groqPayload: GroqRequestBody = {
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: description,
        },
      ],
      model: "qwen/qwen3-32b",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: false,
      reasoning_effort: "none",
      response_format: {
        type: "json_object",
      },
      stop: null,
    };

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqPayload),
      cache: "no-store",
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json(
        { error: `Groq request failed: ${errorText || groqResponse.statusText}` },
        { status: 502 },
      );
    }

    const groqData = (await groqResponse.json()) as GroqResponseBody;
    const content = groqData.choices?.[0]?.message?.content;
    console.log("Groq raw response content:", content);

    if (!content) {
      return NextResponse.json({ error: "Groq returned an empty response." }, { status: 502 });
    }

    let parsedGoal: Record<string, unknown>;
    try {
      parsedGoal = JSON.parse(content) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Groq response was not valid JSON." }, { status: 502 });
    }

    const goal = sanitizeGoal(parsedGoal);
    return NextResponse.json({ goal }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to auto-generate a goal right now." },
      { status: 500 },
    );
  }
}
