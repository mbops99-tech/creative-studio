"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Loader2,
  Music,
  Type,
  Monitor,
  Rocket,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import {
  getMusic,
  compileVideo,
  checkCompileStatus,
  exportFormats,
  checkExportStatus,
} from "@/lib/api";
import type {
  MusicTrack,
  CompileClip,
  CompileAudio,
  CompileCaptions,
  CompileStatus,
  ExportStatus,
} from "@/lib/api";

interface ExportPanelProps {
  clips: CompileClip[];
  scriptText?: string;
  voiceoverUrl?: string;
  onCompileComplete?: (videoUrl: string) => void;
}

const FORMAT_OPTIONS = [
  { id: "9:16", label: "9:16", desc: "TikTok / Reels" },
  { id: "1:1", label: "1:1", desc: "Feed Square" },
  { id: "4:5", label: "4:5", desc: "Instagram Feed" },
  { id: "16:9", label: "16:9", desc: "YouTube / Landscape" },
];

const CAPTION_STYLES = [
  { id: "tiktok-bold", label: "TikTok Bold", desc: "Bold white with outline" },
  { id: "minimal", label: "Minimal", desc: "Small white text" },
  { id: "karaoke", label: "Karaoke", desc: "Word-by-word highlight" },
  { id: "none", label: "None", desc: "No captions" },
];

export default function ExportPanel({
  clips,
  scriptText,
  voiceoverUrl,
  onCompileComplete,
}: ExportPanelProps) {
  // Music
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(0.15);

  // Captions
  const [captionStyle, setCaptionStyle] = useState("tiktok-bold");

  // Formats
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["9:16"]);

  // Compile state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<CompileStatus | null>(null);
  const [compiledVideoUrl, setCompiledVideoUrl] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [exportedUrls, setExportedUrls] = useState<Record<string, string>>({});

  // Load music tracks
  useEffect(() => {
    getMusic().then(setMusicTracks).catch(console.error);
  }, []);

  const toggleFormat = (fmt: string) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  // Poll compile status
  const pollCompile = useCallback(
    async (jobId: string) => {
      const poll = async () => {
        try {
          const status = await checkCompileStatus(jobId);
          setCompileStatus(status);

          if (status.status === "processing") {
            setTimeout(poll, 2000);
          } else if (status.status === "complete" && status.videoUrl) {
            setCompiledVideoUrl(status.videoUrl);
            setIsCompiling(false);
            onCompileComplete?.(status.videoUrl);
          } else if (status.status === "failed") {
            setIsCompiling(false);
          }
        } catch {
          setTimeout(poll, 3000);
        }
      };
      setTimeout(poll, 2000);
    },
    [onCompileComplete]
  );

  // Poll export status
  const pollExport = useCallback(async (jobId: string) => {
    const poll = async () => {
      try {
        const status = await checkExportStatus(jobId);
        setExportStatus(status);

        if (status.status === "processing") {
          setTimeout(poll, 2000);
        } else if (status.status === "complete" && status.formatUrls) {
          setExportedUrls(status.formatUrls);
          setIsExporting(false);
        } else if (status.status === "failed") {
          setIsExporting(false);
        }
      } catch {
        setTimeout(poll, 3000);
      }
    };
    setTimeout(poll, 2000);
  }, []);

  const handleCompile = async () => {
    if (clips.length === 0) return;

    setIsCompiling(true);
    setCompileStatus(null);
    setCompiledVideoUrl(null);
    setExportedUrls({});

    const audio: CompileAudio = {};
    if (voiceoverUrl) audio.voiceover = voiceoverUrl;
    if (selectedMusic) {
      audio.music = selectedMusic;
      audio.musicVolume = musicVolume;
    }

    const captions: CompileCaptions = {
      enabled: captionStyle !== "none",
      style: captionStyle as CompileCaptions["style"],
      text: scriptText || "",
    };

    try {
      const jobId = await compileVideo(clips, audio, captions, "9:16", "1080x1920");
      pollCompile(jobId);
    } catch (err) {
      setCompileStatus({
        status: "failed",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setIsCompiling(false);
    }
  };

  const handleExport = async () => {
    if (!compiledVideoUrl || selectedFormats.length === 0) return;

    setIsExporting(true);
    setExportStatus(null);

    try {
      const jobId = await exportFormats(compiledVideoUrl, selectedFormats);
      pollExport(jobId);
    } catch (err) {
      setExportStatus({
        status: "failed",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setIsExporting(false);
    }
  };

  const handleDownload = (url: string, label: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-${label.replace(":", "x")}.mp4`;
    a.click();
  };

  return (
    <div className="bg-[#141420] border border-[#1e1e3a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#1e1e3a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Export & Compile</h3>
            <p className="text-[11px] text-[#888]">
              Configure audio, captions, and export formats
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Background Music */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[12px] text-[#888] font-medium">
            <Music className="w-3.5 h-3.5" />
            Background Music
          </div>
          <select
            value={selectedMusic}
            onChange={(e) => setSelectedMusic(e.target.value)}
            className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white focus:border-[#6C5CE7] focus:outline-none"
          >
            <option value="">No background music</option>
            {musicTracks.map((t) => (
              <option key={t.id} value={t.filename}>
                {t.name} ({t.duration})
              </option>
            ))}
          </select>
          {selectedMusic && (
            <div className="flex items-center gap-3">
              <Volume2 className="w-3.5 h-3.5 text-[#888]" />
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#6C5CE7] [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-[11px] text-[#888] w-10 text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Caption Style */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[12px] text-[#888] font-medium">
            <Type className="w-3.5 h-3.5" />
            Caption Style
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CAPTION_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setCaptionStyle(style.id)}
                className={`px-3 py-2 rounded-lg text-left transition-all ${
                  captionStyle === style.id
                    ? "bg-[#6C5CE7]/20 border border-[#6C5CE7]/50"
                    : "bg-white/5 border border-transparent hover:bg-white/10"
                }`}
              >
                <span className="text-[12px] font-medium text-white block">
                  {style.label}
                </span>
                <span className="text-[10px] text-[#888]">{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Formats */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[12px] text-[#888] font-medium">
            <Monitor className="w-3.5 h-3.5" />
            Export Formats
          </div>
          <div className="flex gap-2 flex-wrap">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => toggleFormat(fmt.id)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  selectedFormats.includes(fmt.id)
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                    : "bg-white/5 border border-transparent text-[#888] hover:bg-white/10"
                }`}
              >
                <span className="text-[12px] font-semibold block">{fmt.label}</span>
                <span className="text-[10px] opacity-70">{fmt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compile Button */}
        <button
          onClick={handleCompile}
          disabled={isCompiling || clips.length === 0}
          className="w-full bg-[#6C5CE7] hover:bg-[#5A4BD1] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Compiling... {compileStatus?.progress || 0}%
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Compile Final Ad
            </>
          )}
        </button>

        {/* Compile Progress */}
        {compileStatus && compileStatus.status === "processing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#888]">{compileStatus.step}</span>
              <span className="text-[#6C5CE7] font-medium">{compileStatus.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6C5CE7] to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${compileStatus.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Compile Error */}
        {compileStatus?.status === "failed" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-[12px] text-red-400">
              Compilation failed: {compileStatus.error}
            </p>
          </div>
        )}

        {/* Compiled Video */}
        {compiledVideoUrl && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[13px] text-emerald-400 font-medium">
                Video compiled! ({compileStatus?.duration})
              </span>
            </div>
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={compiledVideoUrl}
                className="w-full max-h-[300px] object-contain"
                controls
              />
            </div>

            {/* Export in formats */}
            <button
              onClick={handleExport}
              disabled={isExporting || selectedFormats.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting... {exportStatus?.progress || 0}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export in {selectedFormats.length} Format
                  {selectedFormats.length !== 1 && "s"}
                </>
              )}
            </button>

            {/* Export Progress */}
            {exportStatus && exportStatus.status === "processing" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#888]">{exportStatus.step}</span>
                  <span className="text-emerald-400 font-medium">{exportStatus.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${exportStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Download links */}
            {Object.keys(exportedUrls).length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] text-[#888] font-medium">Downloads ready:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(exportedUrls).map(([fmt, url]) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(url, fmt)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
