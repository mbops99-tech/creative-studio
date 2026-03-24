import type { ScriptData, Shot, ImageVariation } from "./mock-data";

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

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-API-Key": API_KEY,
    },
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
  category?: string;
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

// --- Image Generation API ---

export interface Actor {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface ImageJobStatus {
  status: "pending" | "processing" | "complete" | "failed";
  images: { id: string; url: string; filename: string }[];
  progress: number;
  error?: string;
}

export async function generateImages(
  prompt: string,
  negativePrompt?: string,
  actorId?: string,
  count?: number
): Promise<string> {
  const data = await apiFetch("/api/image/generate", {
    prompt,
    negativePrompt,
    actorId,
    count: count || 4,
  });
  return data.jobId;
}

export async function checkImageStatus(jobId: string): Promise<ImageJobStatus> {
  const data = await apiGet(`/api/image/status/${jobId}`);
  // Convert relative URLs to absolute
  if (data.images) {
    data.images = data.images.map((img: { id: string; url: string; filename: string }) => ({
      ...img,
      url: img.url.startsWith("http") ? img.url : `${API_BASE}${img.url}`,
    }));
  }
  return data;
}

export async function editImage(
  imageUrl: string,
  prompt: string,
  negativePrompt?: string
): Promise<string> {
  const data = await apiFetch("/api/image/edit", {
    imageUrl,
    prompt,
    negativePrompt,
  });
  return data.jobId;
}

export async function getActors(): Promise<Actor[]> {
  const data = await apiGet("/api/actors");
  return data.actors.map((a: Actor) => ({
    ...a,
    imageUrl: a.imageUrl.startsWith("http") ? a.imageUrl : `${API_BASE}${a.imageUrl}`,
  }));
}

// --- Video Generation API ---

export interface VideoJobStatus {
  status: "pending" | "processing" | "complete" | "failed";
  progress: number;
  step?: string;
  videoUrl?: string;
  duration?: string;
  engine?: string;
  error?: string;
}

export interface VoicePreset {
  id: string;
  name: string;
  msVoice: string;
}

export async function generateVideo(
  imageUrl: string,
  script: string,
  action?: string,
  voice?: string,
  mode?: "easy" | "custom",
  engine?: "sadtalker" | "kling"
): Promise<string> {
  const data = await apiFetch("/api/video/generate", {
    imageUrl,
    script,
    action,
    voice: voice || "aria",
    mode: mode || "easy",
    engine: engine || "sadtalker",
  });
  return data.jobId;
}

export async function checkVideoStatus(jobId: string): Promise<VideoJobStatus> {
  const data = await apiGet(`/api/video/status/${jobId}`);
  if (data.videoUrl && !data.videoUrl.startsWith("http")) {
    data.videoUrl = `${API_BASE}${data.videoUrl}`;
  }
  return data;
}

export async function generateVoice(
  text: string,
  voice?: string
): Promise<{ audioUrl: string; audioId: string; voice: string }> {
  const data = await apiFetch("/api/voice/generate", {
    text,
    voice: voice || "aria",
  });
  return {
    audioUrl: data.audioUrl.startsWith("http") ? data.audioUrl : `${API_BASE}${data.audioUrl}`,
    audioId: data.audioId,
    voice: data.voice,
  };
}

export async function getVoices(): Promise<VoicePreset[]> {
  const data = await apiGet("/api/voices");
  return data.voices;
}

// --- Edit / Timeline API ---

export interface MusicTrack {
  id: string;
  name: string;
  filename: string;
  url: string;
  duration: string;
}

export interface CompileClip {
  type: "a-roll" | "b-roll";
  videoUrl: string;
  startTime: number;
  duration: number;
  overlay?: boolean;
}

export interface CompileAudio {
  voiceover?: string;
  music?: string;
  musicVolume?: number;
}

export interface CompileCaptions {
  enabled: boolean;
  style: "tiktok-bold" | "minimal" | "karaoke" | "none";
  text?: string;
}

export interface CompileStatus {
  status: "processing" | "complete" | "failed";
  progress: number;
  step?: string;
  videoUrl?: string;
  duration?: string;
  format?: string;
  error?: string;
}

export interface ExportStatus {
  status: "processing" | "complete" | "failed";
  progress: number;
  step?: string;
  formatUrls?: Record<string, string>;
  error?: string;
}

export async function getMusic(): Promise<MusicTrack[]> {
  const data = await apiGet("/api/music");
  return (data.tracks || []).map((t: MusicTrack) => ({
    ...t,
    url: t.url.startsWith("http") ? t.url : `${API_BASE}${t.url}`,
  }));
}

export async function compileVideo(
  clips: CompileClip[],
  audio: CompileAudio,
  captions: CompileCaptions,
  format: string = "9:16",
  resolution: string = "1080x1920"
): Promise<string> {
  const data = await apiFetch("/api/edit/compile", {
    clips,
    audio,
    captions,
    format,
    resolution,
  });
  return data.jobId;
}

export async function checkCompileStatus(jobId: string): Promise<CompileStatus> {
  const data = await apiGet(`/api/edit/status/${jobId}`);
  if (data.videoUrl && !data.videoUrl.startsWith("http")) {
    data.videoUrl = `${API_BASE}${data.videoUrl}`;
  }
  return data;
}

export async function generateCaptions(
  script: string,
  audioDuration: number,
  style: string
): Promise<string> {
  const data = await apiFetch("/api/edit/caption", {
    script,
    audioDuration,
    style,
  });
  return data.subtitleUrl.startsWith("http")
    ? data.subtitleUrl
    : `${API_BASE}${data.subtitleUrl}`;
}

export async function exportFormats(
  videoUrl: string,
  formats: string[]
): Promise<string> {
  const data = await apiFetch("/api/edit/export", { videoUrl, formats });
  return data.jobId;
}

export async function checkExportStatus(jobId: string): Promise<ExportStatus> {
  const data = await apiGet(`/api/edit/status/${jobId}`);
  if (data.formatUrls) {
    for (const key of Object.keys(data.formatUrls)) {
      if (!data.formatUrls[key].startsWith("http")) {
        data.formatUrls[key] = `${API_BASE}${data.formatUrls[key]}`;
      }
    }
  }
  return data;
}

// --- B-Roll (Motion Video) API ---

export interface BrollJobStatus {
  status: "pending" | "processing" | "complete" | "failed";
  progress: number;
  step?: string;
  videoUrl?: string;
  duration?: string;
  effect?: string;
  engine?: string;
  error?: string;
}

export async function generateBroll(
  imageUrl: string,
  actionPrompt: string,
  duration?: number,
  engine?: "kenburns" | "animatediff"
): Promise<string> {
  const data = await apiFetch("/api/broll/generate", {
    imageUrl,
    actionPrompt,
    duration: duration || 5,
    engine: engine || "kenburns",
  });
  return data.jobId;
}

export async function checkBrollStatus(jobId: string): Promise<BrollJobStatus> {
  const data = await apiGet(`/api/broll/status/${jobId}`);
  if (data.videoUrl && !data.videoUrl.startsWith("http")) {
    data.videoUrl = `${API_BASE}${data.videoUrl}`;
  }
  return data;
}

// --- Voice Unification API ---

export interface VoiceUnifyJobStatus {
  status: "pending" | "processing" | "complete" | "failed";
  progress: number;
  step?: string;
  audioUrl?: string;
  duration?: string;
  clipCount?: number;
  error?: string;
}

export async function unifyVoice(
  audioUrls: string[],
  targetVoice?: string
): Promise<string> {
  const data = await apiFetch("/api/voice/unify", {
    audioUrls,
    targetVoice,
  });
  return data.jobId;
}

export async function checkUnifyStatus(jobId: string): Promise<VoiceUnifyJobStatus> {
  const data = await apiGet(`/api/voice/unify/status/${jobId}`);
  if (data.audioUrl && !data.audioUrl.startsWith("http")) {
    data.audioUrl = `${API_BASE}${data.audioUrl}`;
  }
  return data;
}
