import React, { useState } from "react";
import { BookOpen, Sparkles, Volume2, ArrowRight } from "lucide-react";
import { PresetPhrase, GeminiVoiceName, VoiceStyleId } from "../types";
import { PRESET_PHRASES } from "../data/greekPresets";

interface PresetLibraryProps {
  onSelectPreset: (preset: PresetPhrase) => void;
  onSpeakDirectly: (preset: PresetPhrase) => void;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  onSelectPreset,
  onSpeakDirectly,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Presets (Όλα)" },
    { id: "greetings", label: "Greetings (Καθημερινά)" },
    { id: "philosophy", label: "Philosophy (Φιλοσοφία)" },
    { id: "literature", label: "Poetry (Ποίηση)" },
    { id: "travel", label: "Travel (Ταξίδια)" },
    { id: "twisters", label: "Tongue Twisters (Γλωσσοδέτες)" },
  ];

  const filteredPresets =
    activeCategory === "all"
      ? PRESET_PHRASES
      : PRESET_PHRASES.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Greek Phrasebook & Neural Presets (Επιλεγμένα Κείμενα)
            </h3>
            <p className="text-xs text-slate-400">
              Curated Greek phrases with recommended voice personas & emotional tones
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="group p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {preset.title}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="font-medium text-indigo-400">
                    {preset.suggestedVoice}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="capitalize">{preset.suggestedStyle}</span>
                </div>
              </div>

              <p className="text-sm sm:text-base font-medium text-slate-100 mb-1.5 leading-relaxed">
                {preset.greekText}
              </p>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                "{preset.englishTranslation}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
              >
                <span>Load Text</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>

              <button
                type="button"
                onClick={() => onSpeakDirectly(preset)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-200" />
                <span>Speak Preset</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
