import React, { useState } from "react";
import {
  History,
  Play,
  Pause,
  Star,
  Download,
  Trash2,
  Search,
  Volume2,
} from "lucide-react";
import { AudioClipHistory } from "../types";
import { downloadAudioUrl } from "../utils/audioUtils";

interface HistoryListProps {
  history: AudioClipHistory[];
  onPlayClip: (clip: AudioClipHistory) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteClip: (id: string) => void;
  onClearHistory: () => void;
  currentPlayingId: string | null;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayClip,
  onToggleFavorite,
  onDeleteClip,
  onClearHistory,
  currentPlayingId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.voiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.styleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = filterFavorites ? item.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Generation History ({history.length})
            </h3>
            <p className="text-xs text-slate-400">
              Replay, bookmark, or export your generated Greek audio clips
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              filterFavorites
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filterFavorites ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
            <span>Favorites</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter history by Greek phrase or voice name..."
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* History Items */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const isPlaying = currentPlayingId === item.id;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isPlaying
                  ? "bg-indigo-600/15 border-indigo-500/60 shadow-md shadow-indigo-500/10"
                  : "bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/90"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onPlayClip(item)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                    isPlaying
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-indigo-400">
                      {item.voiceName}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{item.styleName}</span>
                    <span>•</span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  title={item.isFavorite ? "Remove favorite" : "Bookmark favorite"}
                  className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      item.isFavorite ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                </button>

                {item.audioUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadAudioUrl(
                        item.audioUrl,
                        `greek-${item.voiceName.toLowerCase()}-${item.id.slice(0, 5)}.wav`
                      )
                    }
                    title="Export audio clip"
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteClip(item.id)}
                  title="Delete from history"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
