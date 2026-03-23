"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Mic,
  Upload,
  AudioWaveform,
  Play,
  Pause,
  Square,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";

type AudioTab = "tts" | "upload" | "record" | "change-voice";

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: "female" | "male" | "neutral";
  age: "young" | "middle-aged" | "old";
  accent?: string;
}

const MOCK_VOICES: Voice[] = [
  { id: "v1", name: "Adam", description: "Dominant, Firm", gender: "male", age: "middle-aged", accent: "American" },
  { id: "v2", name: "Adina", description: "French Young Female", gender: "female", age: "young", accent: "Standard" },
  { id: "v3", name: "Adina", description: "Teen Girl", gender: "female", age: "young", accent: "Canadian" },
  { id: "v4", name: "Aimee", description: "ASMR And Meditation", gender: "female", age: "young", accent: "British" },
  { id: "v5", name: "Aimee", description: "ASMR Whisper Edition", gender: "female", age: "young", accent: "British" },
  { id: "v6", name: "Alex", description: "Warm Narrator", gender: "male", age: "middle-aged", accent: "American" },
  { id: "v7", name: "Aria", description: "Professional Clear", gender: "female", age: "middle-aged", accent: "American" },
  { id: "v8", name: "Brian", description: "Deep Voice", gender: "male", age: "old", accent: "British" },
  { id: "v9", name: "Clara", description: "Soft Friendly", gender: "female", age: "young", accent: "Australian" },
  { id: "v10", name: "Daniel", description: "Authoritative", gender: "male", age: "middle-aged", accent: "American" },
  { id: "v11", name: "Elena", description: "Warm European", gender: "female", age: "middle-aged", accent: "Italian" },
  { id: "v12", name: "Felix", description: "Upbeat Casual", gender: "neutral", age: "young", accent: "American" },
];

interface AudioSourceModalProps {
  onClose: () => void;
  onConfirm: (audioSource: {
    type: "tts" | "upload" | "record" | "change-voice";
    script?: string;
    voiceId?: string;
    voiceName?: string;
    audioFile?: File;
  }) => void;
}

export default function AudioSourceModal({ onClose, onConfirm }: AudioSourceModalProps) {
  const [activeTab, setActiveTab] = useState<AudioTab>("tts");
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [changeVoiceFile, setChangeVoiceFile] = useState<File | null>(null);
  const [changeVoiceTarget, setChangeVoiceTarget] = useState<Voice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changeVoiceInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter voices
  const filteredVoices = MOCK_VOICES.filter((v) => {
    if (genderFilter !== "all" && v.gender !== genderFilter) return false;
    if (ageFilter !== "all" && v.age !== ageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleConfirm = () => {
    if (activeTab === "tts") {
      onConfirm({
        type: "tts",
        script,
        voiceId: selectedVoice?.id,
        voiceName: selectedVoice ? `${selectedVoice.name} - ${selectedVoice.description}` : undefined,
      });
    } else if (activeTab === "upload") {
      onConfirm({ type: "upload", audioFile: uploadedFile || undefined });
    } else if (activeTab === "record") {
      onConfirm({ type: "record" });
    } else {
      onConfirm({
        type: "change-voice",
        audioFile: changeVoiceFile || undefined,
        voiceId: changeVoiceTarget?.id,
        voiceName: changeVoiceTarget ? `${changeVoiceTarget.name} - ${changeVoiceTarget.description}` : undefined,
      });
    }
  };

  const tabs: { id: AudioTab; label: string; icon: React.ReactNode }[] = [
    { id: "tts", label: "Text-to-Speech", icon: <Mic className="w-3.5 h-3.5" /> },
    { id: "upload", label: "Upload", icon: <Upload className="w-3.5 h-3.5" /> },
    { id: "record", label: "Record", icon: <Mic className="w-3.5 h-3.5" /> },
    { id: "change-voice", label: "Change voice", icon: <AudioWaveform className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[620px] max-h-[85vh] bg-[#1e1e22] border border-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-white">Choose audio source</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-white transition-colors rounded-lg hover:bg-[#333]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#141416] rounded-xl p-1 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-[#333] text-white"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {/* TTS Tab */}
          {activeTab === "tts" && (
            <div>
              <p className="text-[12px] text-[#888] mb-4">
                Convert your script into production ready audio.
              </p>

              {/* Voice filters */}
              <label className="text-[13px] text-white font-medium mb-2 block">Voice</label>
              <div className="flex gap-2 mb-3">
                {/* Gender dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => { setShowGenderDropdown(!showGenderDropdown); setShowAgeDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-[#141416] border border-[#2a2a2a] rounded-lg text-[13px] text-white hover:border-[#444] transition-colors"
                  >
                    {genderFilter === "all" ? "All genders" : genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}
                    <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
                  </button>
                  {showGenderDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowGenderDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 z-20 w-full bg-[#1e1e22] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl">
                        {["all", "female", "male", "neutral"].map((g) => (
                          <button
                            key={g}
                            onClick={() => { setGenderFilter(g); setShowGenderDropdown(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-white hover:bg-[#2a2a2a] transition-colors text-left"
                          >
                            {genderFilter === g ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-3.5 h-3.5" />}
                            {g === "all" ? "All genders" : g.charAt(0).toUpperCase() + g.slice(1)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Age dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => { setShowAgeDropdown(!showAgeDropdown); setShowGenderDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-[#141416] border border-[#2a2a2a] rounded-lg text-[13px] text-white hover:border-[#444] transition-colors"
                  >
                    {ageFilter === "all" ? "All ages" : ageFilter === "middle-aged" ? "Middle Aged" : ageFilter.charAt(0).toUpperCase() + ageFilter.slice(1)}
                    <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
                  </button>
                  {showAgeDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAgeDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 z-20 w-full bg-[#1e1e22] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl">
                        {["all", "young", "middle-aged", "old"].map((a) => (
                          <button
                            key={a}
                            onClick={() => { setAgeFilter(a); setShowAgeDropdown(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-white hover:bg-[#2a2a2a] transition-colors text-left"
                          >
                            {ageFilter === a ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-3.5 h-3.5" />}
                            {a === "all" ? "All ages" : a === "middle-aged" ? "Middle Aged" : a.charAt(0).toUpperCase() + a.slice(1)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search voices..."
                  className="w-full bg-[#141416] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-colors"
                />
              </div>

              {/* Voice list */}
              <div className="bg-[#141416] border border-[#2a2a2a] rounded-lg max-h-[200px] overflow-y-auto mb-4">
                <p className="text-[11px] text-[#666] px-3 pt-2.5 pb-1">
                  {filteredVoices.length} voices · tap ▷ to preview
                </p>
                {filteredVoices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`flex items-center justify-between px-3 py-2.5 hover:bg-[#1e1e22] transition-colors border-t border-[#1e1e22] ${
                      selectedVoice?.id === voice.id ? "bg-[#1e1e22]" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white">
                        {voice.name} - {voice.description}
                      </p>
                      <p className="text-[11px] text-[#666]">
                        {voice.gender.charAt(0).toUpperCase() + voice.gender.slice(1)} · {voice.accent || "Standard"} · {voice.age === "middle-aged" ? "Middle Aged" : voice.age.charAt(0).toUpperCase() + voice.age.slice(1)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button className="flex items-center gap-1 px-2.5 py-1 border border-[#444] rounded-md text-[11px] text-[#ccc] hover:text-white hover:border-[#666] transition-colors">
                        <Play className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => setSelectedVoice(voice)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          selectedVoice?.id === voice.id
                            ? "bg-purple text-white"
                            : "border border-[#444] text-[#ccc] hover:text-white hover:border-[#666]"
                        }`}
                      >
                        {selectedVoice?.id === voice.id ? "Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Script */}
              <label className="text-[13px] text-white font-medium mb-2 block">Script</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write what your avatar should say..."
                rows={4}
                className="w-full bg-[#141416] border border-[#2a2a2a] focus:border-[#4a90d9] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none resize-none transition-colors mb-3"
              />

              {/* Preview controls */}
              {selectedVoice && script.trim() && (
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#444] rounded-lg text-[12px] text-[#ccc] hover:text-white hover:border-[#666] transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <span className="text-[12px] text-[#666]">0:00 / 0:00</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="py-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,.m4a,.webm,.ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(file);
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setUploadedFile(file);
                }}
                className="border-2 border-dashed border-[#333] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#555] transition-colors"
              >
                <Upload className="w-10 h-10 text-[#555] mb-3" />
                {uploadedFile ? (
                  <>
                    <p className="text-[14px] text-white font-medium mb-1">{uploadedFile.name}</p>
                    <p className="text-[12px] text-[#888]">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[14px] text-white font-medium mb-1">Upload an audio file</p>
                    <p className="text-[12px] text-[#666]">
                      WAV, MP3, M4A, WebM, OGG (max 12MB, 60s)
                    </p>
                    <button className="mt-4 px-4 py-2 border border-[#444] rounded-lg text-[13px] text-white hover:border-[#666] transition-colors">
                      Choose file
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Record Tab */}
          {activeTab === "record" && (
            <div className="py-8 flex flex-col items-center">
              <div className="mb-6">
                <p className="text-[13px] text-[#888] text-center mb-6">
                  Record your audio directly in the browser.
                </p>
                {/* Waveform placeholder */}
                <div className="w-full h-16 bg-[#141416] rounded-lg border border-[#2a2a2a] flex items-center justify-center mb-4 px-4">
                  {isRecording ? (
                    <div className="flex items-center gap-1">
                      {[...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-purple rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 40 + 8}px`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#555]">Press record to start</p>
                  )}
                </div>

                {/* Timer */}
                <p className="text-[24px] font-mono text-white text-center mb-6">
                  {formatTime(recordingTime)}
                </p>
              </div>

              {/* Record button */}
              <button
                onClick={handleRecordToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-purple hover:bg-purple-hover"
                }`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
              <p className="text-[12px] text-[#666] mt-3">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
            </div>
          )}

          {/* Change Voice Tab */}
          {activeTab === "change-voice" && (
            <div className="py-4">
              <p className="text-[13px] text-[#888] mb-4">
                Upload an audio file and select a target voice for conversion.
              </p>

              {/* Upload source audio */}
              <label className="text-[13px] text-white font-medium mb-2 block">Source Audio</label>
              <input
                ref={changeVoiceInputRef}
                type="file"
                accept=".wav,.mp3,.m4a,.webm,.ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setChangeVoiceFile(file);
                }}
              />
              <div
                onClick={() => changeVoiceInputRef.current?.click()}
                className="border border-dashed border-[#333] rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-[#555] transition-colors mb-5"
              >
                <Upload className="w-6 h-6 text-[#555] mb-2" />
                {changeVoiceFile ? (
                  <p className="text-[13px] text-white">{changeVoiceFile.name}</p>
                ) : (
                  <p className="text-[12px] text-[#666]">Upload source audio (WAV, MP3, M4A)</p>
                )}
              </div>

              {/* Target voice */}
              <label className="text-[13px] text-white font-medium mb-2 block">Target Voice</label>
              <div className="bg-[#141416] border border-[#2a2a2a] rounded-lg max-h-[180px] overflow-y-auto">
                {MOCK_VOICES.slice(0, 6).map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setChangeVoiceTarget(voice)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1e1e22] transition-colors border-b border-[#1e1e22] text-left ${
                      changeVoiceTarget?.id === voice.id ? "bg-[#1e1e22]" : ""
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-white">{voice.name} - {voice.description}</p>
                      <p className="text-[11px] text-[#666]">{voice.gender} · {voice.accent}</p>
                    </div>
                    {changeVoiceTarget?.id === voice.id && (
                      <Check className="w-4 h-4 text-purple shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
