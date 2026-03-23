import type { ScriptData, Shot } from "./mock-data";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://151.247.196.131:5010";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "446f4600296a067c93db24b2a8817a8c7fc82c3354554ad8e54fa769a559bc8a";

async function apiFetch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

interface ApiShotlistItem {
  name: string;
  type: string;
  timeRange: string;
  script: string;
  action: string;
  rollType: string;
}

interface ApiScriptResponse {
  jobId: string;
  script: string;
  shotlist: ApiShotlistItem[];
}

/**
 * Parse the full script text into hook / body / cta sections.
 * Uses the shotlist to split: first shot script = hook, last shot = cta, middle = body.
 */
function parseScriptSections(
  fullScript: string,
  shotlist: ApiShotlistItem[]
): { hook: string; body: string; cta: string } {
  if (shotlist.length === 0) {
    return { hook: fullScript, body: "", cta: "" };
  }

  // Use shotlist scripts to extract sections
  const hookShot = shotlist.find(
    (s) => s.name.toLowerCase() === "hook"
  );
  const ctaShot = shotlist.find(
    (s) => s.name.toLowerCase() === "cta"
  );
  const bodyShots = shotlist.filter(
    (s) =>
      s.name.toLowerCase() !== "hook" && s.name.toLowerCase() !== "cta"
  );

  const hook = hookShot?.script || shotlist[0].script;
  const cta = ctaShot?.script || shotlist[shotlist.length - 1].script;
  const body = bodyShots.map((s) => s.script).filter(Boolean).join(" ");

  return { hook, body, cta };
}

function mapShotlist(shotlist: ApiShotlistItem[]): Shot[] {
  return shotlist.map((s, i) => ({
    id: `s${i + 1}`,
    name: s.name,
    type: (s.rollType === "A-roll" ? "A-roll" : "B-roll") as "A-roll" | "B-roll",
    script: s.script,
    action: s.action,
    cost: "$0.50",
  }));
}

export async function generateScript(params: {
  product: string;
  audience: string;
  outcome: string;
  differentiator: string;
  proof: string;
  speed: string;
}): Promise<ScriptData> {
  const data: ApiScriptResponse = await apiFetch("/api/script/generate", params);

  const { hook, body, cta } = parseScriptSections(data.script, data.shotlist);
  const shots = mapShotlist(data.shotlist);
  const totalCost = `$${(shots.length * 0.5).toFixed(2)}`;

  return {
    title: `${params.product} — UGC Ad Script`,
    product: params.product,
    target: params.audience,
    hook,
    body,
    cta,
    shots,
    totalCost,
  };
}

export async function generateInspired(params: {
  transcript: string;
  productInfo: string;
}): Promise<ScriptData> {
  const data: ApiScriptResponse = await apiFetch(
    "/api/script/generate-inspired",
    params
  );

  const { hook, body, cta } = parseScriptSections(data.script, data.shotlist);
  const shots = mapShotlist(data.shotlist);
  const totalCost = `$${(shots.length * 0.5).toFixed(2)}`;

  return {
    title: `Inspired Script`,
    product: params.productInfo,
    target: "",
    hook,
    body,
    cta,
    shots,
    totalCost,
  };
}
