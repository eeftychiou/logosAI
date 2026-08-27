import React from "react";
import {
  Sparkles,
  Smile,
  BookOpen,
  Wind,
  Mic,
  Feather,
  Shield,
  Volume1,
  Zap,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { GeminiVoiceName, VoiceStyleId } from "../types";
import { VOICE_PERSONAS, VOICE_STYLES } from "../data/greekPresets";

interface VoiceSelectorProps {
  selectedVoice: GeminiVoiceName;
  onSelectVoice: (voice: GeminiVoiceName) => void;
  selectedStyle: VoiceStyleId;
  onSelectStyle: (style: VoiceStyleId) => void;
  customStylePrompt: string;
  onChangeCustomStylePrompt: (prompt: string) => void;
  isCustomStyle: boolean;
  onToggleCustomStyle: (custom: boolean) => void;
}

const STYLE_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Smile,
  BookOpen,
  Wind,
  Mic,
  Feather,
  Shield,
  Volume1,
  Zap,
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  selectedStyle,
  onSelectStyle,
  customStylePrompt,
  onChangeCustomStylePrompt,
  isCustomStyle,
  onToggleCustomStyle,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Voice Persona Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            1. Επιλογή Φωνής (Voice Persona)
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            5 Neural Greek Personas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {VOICE_PERSONAS.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => onSelectVoice(voice.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? "bg-indigo-600/15 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${voice.accentColor} text-white flex items-center justify-center text-xs font-bold shadow-md`}
                    >
                      {voice.greekName.slice(0, 1)}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-sm leading-tight ${
                          isSelected ? "text-indigo-200" : "text-slate-200"
                        }`}
                      >
                        {voice.greekName}
                      </h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {voice.gender} • {voice.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-snug line-clamp-2 mt-1">
                    {voice.tone}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-semibold">
                    {voice.id === "Kore"
                      ? "Narrative"
                      : voice.id === "Puck"
                      ? "Youthful"
                      : voice.id === "Charon"
                      ? "Deep"
                      : voice.id === "Zephyr"
                      ? "Gentle"
                      : "Dramatic"}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[80px]">
                    {voice.bestFor.split(",")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Voice Style / Emotion Delivery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            2. Delivery Style & Emotion (Στυλ Εκφώνησης)
          </label>

          <button
            type="button"
            onClick={() => onToggleCustomStyle(!isCustomStyle)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              isCustomStyle
                ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3 h-3" />
            {isCustomStyle ? "Using Custom Prompt" : "Custom Prompt Style..."}
          </button>
        </div>

        {!isCustomStyle ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {VOICE_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              const IconComp = STYLE_ICONS[style.iconName] || Sparkles;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onSelectStyle(style.id)}
                  title={style.description}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/30 text-slate-100 shadow-md shadow-indigo-500/10"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400/50" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-200 block truncate">
                      {style.label}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {style.greekLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Custom Neural Speaking Instruction:
              </span>
              <button
                type="button"
                onClick={() => onToggleCustomStyle(false)}
                className="text-xs text-slate-400 hover:text-indigo-300 hover:underline cursor-pointer"
              >
                Back to Preset Styles
              </button>
            </div>
            <input
              type="text"
              value={customStylePrompt}
              onChange={(e) => onChangeCustomStylePrompt(e.target.value)}
              placeholder="e.g., Say like an excited Olympic commentator in Athens in Greek:"
              className="w-full text-xs sm:text-sm bg-slate-950/70 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-indigo-400 font-semibold">
                Suggestions:
              </span>
              {[
                "Say like an ancient Greek philosopher:",
                "Say like an affectionate grandmother in Crete:",
                "Say like an energetic sports radio host:",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onChangeCustomStylePrompt(suggestion)}
                  className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
