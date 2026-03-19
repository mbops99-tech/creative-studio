"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ScriptCard from "@/components/ScriptCard";
import ImageCard from "@/components/ImageCard";
import VideoCard from "@/components/VideoCard";
import { MOCK_SCRIPT, MOCK_IMAGE_VARIATIONS, MOCK_VIDEO, type Message } from "@/lib/mock-data";
import { Send, FileText, Image, Video, Mic, Paperclip, Sparkles } from "lucide-react";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Create a UGC ad script for Desaire - AI girlfriend app targeting single men 18-35 who want companionship",
  },
  {
    id: "2",
    role: "assistant",
    content: "script",
    data: MOCK_SCRIPT,
  },
  {
    id: "3",
    role: "user",
    content: "Generate first frame for the Hook shot",
  },
  {
    id: "4",
    role: "assistant",
    content: "image",
    data: { shotName: "Hook", variations: MOCK_IMAGE_VARIATIONS },
  },
  {
    id: "5",
    role: "user",
    content: "Make her look more natural, like a real selfie, messy hair",
  },
  {
    id: "6",
    role: "assistant",
    content: "image",
    data: { shotName: "Hook (v2)", variations: MOCK_IMAGE_VARIATIONS.map((v, i) => ({ ...v, id: `v2-${i}`, selected: i === 1 })) },
  },
  {
    id: "7",
    role: "user",
    content: "Perfect, use the second one. Now generate the video for the hook",
  },
  {
    id: "8",
    role: "assistant",
    content: "video",
    data: MOCK_VIDEO,
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [activeProject, setActiveProject] = useState("desaire-1");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: input,
    };
    setMessages([...messages, newMsg]);
    setInput("");
    setActiveQuickAction(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeProject={activeProject} onSelectProject={setActiveProject} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-[#1e1e3a] flex items-center px-5 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
            <span className="text-sm font-semibold">Desaire Ad Campaign</span>
            <span className="text-[11px] text-[#888] bg-white/5 px-2 py-0.5 rounded">8 shots</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-[13px] text-white/90">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-2">
                    {msg.content === "script" && msg.data && (
                      <ScriptCard data={msg.data} />
                    )}
                    {msg.content === "image" && msg.data && (
                      <ImageCard shotName={msg.data.shotName} variations={msg.data.variations} />
                    )}
                    {msg.content === "video" && msg.data && (
                      <VideoCard data={msg.data} />
                    )}
                    {msg.content !== "script" && msg.content !== "image" && msg.content !== "video" && (
                      <div className="bg-[#141420] border border-[#1e1e3a] rounded-2xl rounded-bl-md px-4 py-3">
                        <p className="text-[13px] text-white/80">{msg.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Action Panel */}
        {activeQuickAction && (
          <div className="px-6 pb-2">
            <div className="bg-[#141420] border border-[#1e1e3a] rounded-xl p-4">
              {activeQuickAction === "script" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Script</p>
                  <input
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                    placeholder="Product name or description..."
                  />
                  <input
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                    placeholder="Target audience..."
                  />
                  <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                    Generate Script ~$0.02
                  </button>
                </div>
              )}
              {activeQuickAction === "image" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Image</p>
                  <div className="flex gap-2">
                    {["Sarah", "Mike", "Aisha", "James", "Yuki", "Nina"].map((name) => (
                      <div key={name} className="flex flex-col items-center gap-1 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-white/10 group-hover:ring-2 ring-[#6C5CE7] transition-all flex items-center justify-center text-[10px] text-[#888]">
                          {name[0]}
                        </div>
                        <span className="text-[10px] text-[#888]">{name}</span>
                      </div>
                    ))}
                  </div>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Describe the image..."
                  />
                  <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                    Generate 4 Variations ~$0.20
                  </button>
                </div>
              )}
              {activeQuickAction === "video" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Video</p>
                  <div className="flex gap-3">
                    <button className="text-[12px] px-3 py-1.5 rounded-lg bg-[#6C5CE7]/20 text-[#6C5CE7] font-medium">Easy Mode</button>
                    <button className="text-[12px] px-3 py-1.5 rounded-lg bg-white/5 text-[#888] hover:text-white transition-colors">Custom Mode</button>
                  </div>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Action description..."
                  />
                  <div className="flex gap-2 items-center">
                    <select className="bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none">
                      <option>Kling 2.5 (Best)</option>
                      <option>Fast (Free)</option>
                    </select>
                    <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                      Generate Video ~$0.50
                    </button>
                  </div>
                </div>
              )}
              {activeQuickAction === "voice" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Voice</p>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Text to speak..."
                  />
                  <div className="flex gap-2 items-center">
                    <select className="bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none">
                      <option>Bella - Warm</option>
                      <option>Rachel - Casual</option>
                      <option>Josh - Confident</option>
                      <option>Vanessa - Energetic</option>
                    </select>
                    <input type="range" min="0.8" max="1.3" step="0.05" defaultValue="1.0" className="flex-1 accent-[#6C5CE7]" />
                    <span className="text-[11px] text-[#888]">1.0x</span>
                    <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                      Generate ~$0.03
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Bar */}
        <div className="shrink-0 px-6 pb-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-2">
            {[
              { id: "script", icon: FileText, label: "Script" },
              { id: "image", icon: Image, label: "Image" },
              { id: "video", icon: Video, label: "Video" },
              { id: "voice", icon: Mic, label: "Voice" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveQuickAction(activeQuickAction === id ? null : id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  activeQuickAction === id
                    ? "bg-[#6C5CE7]/20 text-[#6C5CE7]"
                    : "bg-white/5 text-[#888] hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 bg-[#141420] border border-[#1e1e3a] rounded-xl p-2 focus-within:border-[#6C5CE7]/50 transition-colors">
            <button className="p-2 text-[#555] hover:text-white transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-[#555] resize-none focus:outline-none min-h-[36px] max-h-[120px] py-2"
              rows={1}
            />
            <button
              onClick={handleSend}
              className="p-2 bg-[#6C5CE7] hover:bg-[#5A4BD1] rounded-lg text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#555] mt-1 text-center">
            Est. cost per generation: Script ~$0.02 • Image ~$0.05 • Video ~$0.50 • Voice ~$0.03
          </p>
        </div>
      </div>
    </div>
  );
}
