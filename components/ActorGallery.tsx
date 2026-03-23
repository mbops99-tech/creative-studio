"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Heart, User } from "lucide-react";
import type { Actor } from "@/lib/api";

interface ActorGalleryProps {
  actors: Actor[];
  selectedActors: Actor[];
  maxSelect: number;
  onSelect: (actors: Actor[]) => void;
  onClose: () => void;
  onCreateActor: () => void;
}

type FilterTab = "all" | "favorites" | "my";

interface Filters {
  gender: string;
  skinTone: string;
  age: string;
  setting: string;
  vibe: string;
  framing: string;
  wardrobe: string;
}

const defaultFilters: Filters = {
  gender: "",
  skinTone: "",
  age: "",
  setting: "",
  vibe: "",
  framing: "",
  wardrobe: "",
};

const filterOptions: Record<string, string[]> = {
  gender: ["Female", "Male"],
  age: ["Adult", "Senior", "Young Adult"],
  setting: ["Bedroom", "Car", "Couch", "Gym", "Home", "Kitchen", "Office", "Outdoor", "Studio"],
  vibe: ["Calm", "Casual", "Energetic", "Professional"],
  framing: ["Close Up", "Waist Up"],
  wardrobe: ["Casual", "Formal", "Smart Casual"],
};

const skinTones = [
  { label: "Light", color: "#E8C4A0" },
  { label: "Medium", color: "#B5854B" },
  { label: "Dark", color: "#6B4226" },
];

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
        selected
          ? "bg-purple/20 border-purple text-purple"
          : "border-[#333] text-[#aaa] hover:border-[#555] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function ActorGallery({
  actors,
  selectedActors,
  maxSelect,
  onSelect,
  onClose,
  onCreateActor,
}: ActorGalleryProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [localSelected, setLocalSelected] = useState<Actor[]>(selectedActors);

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key] === value ? "" : value,
    }));
  };

  const toggleActor = (actor: Actor) => {
    const isSelected = localSelected.some((a) => a.id === actor.id);
    if (isSelected) {
      setLocalSelected(localSelected.filter((a) => a.id !== actor.id));
    } else if (localSelected.length < maxSelect) {
      setLocalSelected([...localSelected, actor]);
    }
  };

  const filteredActors = actors.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f]/95 flex animate-fade-in">
      {/* Left sidebar - Filters */}
      <div className="w-[230px] border-r border-[#2a2a2a] flex flex-col p-4 overflow-y-auto">
        {/* Tabs */}
        <div className="space-y-1 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
              activeTab === "all"
                ? "bg-purple/20 text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            All Actors
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
              activeTab === "favorites"
                ? "bg-purple/20 text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Favorites
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors justify-between ${
              activeTab === "my"
                ? "bg-purple/20 text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              My actors
            </div>
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Filter sections */}
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key} className="mb-4">
            <label className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2 block">
              {key}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  selected={filters[key as keyof Filters] === opt}
                  onClick={() => toggleFilter(key as keyof Filters, opt)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Skin tone */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2 block">
            Skin Tone
          </label>
          <div className="flex gap-2">
            {skinTones.map((tone) => (
              <button
                key={tone.label}
                onClick={() => toggleFilter("skinTone", tone.label)}
                className={`w-8 h-8 rounded-full border-2 transition-colors ${
                  filters.skinTone === tone.label
                    ? "border-purple"
                    : "border-transparent hover:border-[#555]"
                }`}
                style={{ backgroundColor: tone.color }}
                title={tone.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-[18px] font-semibold text-white">Select Actors</h2>
            <p className="text-[12px] text-[#888]">All actors are 4K (UHD) resolution</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-[200px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-[12px] text-white placeholder:text-[#555] focus:outline-none focus:border-purple/50"
              />
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Create Actor card */}
            <button
              onClick={onCreateActor}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#333] flex flex-col items-center justify-center gap-2 hover:border-[#555] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#222] transition-colors">
                <Plus className="w-5 h-5 text-[#888] group-hover:text-white transition-colors" />
              </div>
              <span className="text-[12px] text-[#888] group-hover:text-white transition-colors">
                Create Actor
              </span>
            </button>

            {/* Actor cards */}
            {filteredActors.map((actor) => {
              const isSelected = localSelected.some((a) => a.id === actor.id);
              return (
                <button
                  key={actor.id}
                  onClick={() => toggleActor(actor)}
                  className="group relative"
                >
                  <div
                    className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-dashed border-blue-500"
                        : "border-transparent hover:border-[#444]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={actor.imageUrl}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Selection overlay */}
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                  </div>
                  <p className="text-[12px] text-[#ccc] text-center mt-2">{actor.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2a2a2a] px-6 py-3 flex items-center justify-center gap-3">
          <span className="text-[12px] text-[#888]">
            {localSelected.length} of {maxSelect} selected
          </span>
          <button
            onClick={() => {
              onSelect(localSelected);
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
