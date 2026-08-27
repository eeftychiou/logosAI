import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Languages,
  Sparkles,
} from "lucide-react";
import { formatDuration, downloadAudioUrl, generateWaveformPoints, greekToPhonetic } from "../utils/audioUtils";

interface AudioPlayerProps {
  audioUrl: string | null;
  spokenText: string;
  voiceName: string;
  styleName: string;
  isLoading?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  spokenText,
  voiceName,
  styleName,
  isLoading = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPhonetics, setShowPhonetics] = useState(false);

  const waveformPoints = React.useMemo(() => {
    return generateWaveformPoints(36, spokenText || "greek");
  }, [spokenText]);

  useEffect(() => {
    // When audioUrl changes, reset player and auto-play
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay may be blocked if user hasn't interacted
        setIsPlaying(false);
      });
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error("Playback error:", e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.muted = newMuteState;
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyText = () => {
    if (!spokenText) return;
    navigator.clipboard.writeText(spokenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl && !isLoading) {
    return null;
  }

  return (
    <div className="bg-slate-900/80 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow matching theme */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          loop={isLooping}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                Greek Neural Audio
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {voiceName}
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {styleName}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              High Definition Speech Synthesis (24kHz WAV PCM)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPhonetics(!showPhonetics)}
            title="Toggle Greek Phonetic Pronunciation Guide"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showPhonetics
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Phonetics Guide</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            title="Copy Greek Text"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {audioUrl && (
            <button
              type="button"
              onClick={() =>
                downloadAudioUrl(
                  audioUrl,
                  `greek-speech-${voiceName.toLowerCase()}-${Date.now()}.wav`
                )
              }
              title="Download Audio (.wav)"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export WAV</span>
            </button>
          )}
        </div>
      </div>

      {/* Phonetic Pronunciation Card */}
      {showPhonetics && spokenText && (
        <div className="mb-5 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative z-10">
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
            Phonetic Transliteration (Λατινική Απόδοση):
          </div>
          <p className="text-sm font-mono text-emerald-400 leading-relaxed">
            {greekToPhonetic(spokenText)}
          </p>
        </div>
      )}

      {/* Waveform Visualization Bars */}
      <div className="relative z-10 my-4 bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800">
        <div className="flex items-center justify-between gap-1 h-14 w-full">
          {waveformPoints.map((height, idx) => {
            const barProgress = (idx / waveformPoints.length) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (audioRef.current && duration > 0) {
                    const targetSec = (idx / waveformPoints.length) * duration;
                    audioRef.current.currentTime = targetSec;
                    setCurrentTime(targetSec);
                  }
                }}
                className="flex-1 h-full flex items-center justify-center cursor-pointer group py-1"
              >
                <div
                  style={{
                    height: `${Math.max(14, height * 100)}%`,
                    transform: isPlaying ? `scaleY(${0.8 + Math.random() * 0.4})` : undefined,
                  }}
                  className={`w-full max-w-[5px] rounded-full transition-all duration-75 ${
                    isPlayed
                      ? "bg-gradient-to-t from-indigo-500 to-cyan-400 group-hover:brightness-125 shadow-xs"
                      : "bg-slate-800 group-hover:bg-slate-700"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Scrubber slider */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 min-w-[32px]">
            {formatDuration(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />

          <span className="text-[11px] font-mono text-slate-400 min-w-[32px] text-right">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-2">
        {/* Main playback buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform cursor-pointer text-white"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={restartAudio}
            title="Restart from beginning"
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            title="Loop audio"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              isLooping
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            Loop
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-full border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-500 px-2">
            Speed:
          </span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                playbackRate === rate
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-full border border-slate-800">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
