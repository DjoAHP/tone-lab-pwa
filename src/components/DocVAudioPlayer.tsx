// Lecteur YouTube audio-only pour DocV
// L'iframe est masquée (height: 0) car on n'a besoin que de l'audio

import React, { useEffect, useRef, useState, useCallback } from "react";
import YouTube from "react-youtube";

interface DocVAudioPlayerProps {
  videoId: string;
  onRegisterPlayer: (player: any) => void;
  onPlayingChange: (playing: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

export function DocVAudioPlayer({ videoId, onRegisterPlayer, onPlayingChange, onTimeUpdate }: DocVAudioPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const seekValueRef = useRef(0);

  // Options YouTube (audio-only)
  const opts = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  // Quand le player est prêt
  const handleReady = useCallback((event: any) => {
    playerRef.current = event.target;
    onRegisterPlayer(event.target);
    setDuration(event.target.getDuration());
  }, [onRegisterPlayer]);

  // Quand l'état de lecture change
  const handleStateChange = useCallback((event: any) => {
    const playing = event.data === 1; // YT.PlayerState.PLAYING = 1
    setIsPlaying(playing);
    onPlayingChange(playing);
  }, [onPlayingChange]);

  // Mise à jour du temps
  useEffect(() => {
    if (seeking) return;
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const t = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration();
        setCurrentTime(t);
        setDuration(d);
        onTimeUpdate(t, d);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [seeking, onTimeUpdate]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (delta: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    playerRef.current.seekTo(newTime, true);
  };

  const handleSeekBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    seekValueRef.current = value;
    if (!seeking) {
      playerRef.current?.seekTo(value, true);
      setCurrentTime(value);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div style={{ padding: "12px", color: "hsl(210, 30%, 88%)" }}>
      {/* Lecteur YouTube masqué */}
      <div style={{ height: 0, overflow: "hidden" }}>
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={handleReady}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Bouton Play/Pause circulaire */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: isPlaying ? "hsl(198, 48%, 50%)" : "hsl(220, 15%, 24%)",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* Temps */}
      <div style={{ textAlign: "center", fontSize: 12, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Barre de progression */}
      <div style={{ marginBottom: 8 }}>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={seeking ? seekValueRef.current : currentTime}
          onChange={handleSeekBar}
          onMouseDown={() => setSeeking(true)}
          onMouseUp={() => {
            setSeeking(false);
            playerRef.current?.seekTo(seekValueRef.current, true);
          }}
          style={{
            width: "100%",
            accentColor: "hsl(198, 48%, 50%)",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Boutons seek +/- 10s */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => handleSeek(-10)}
          style={{
            padding: "4px 12px",
            fontSize: 11,
            background: "hsl(222, 18%, 18%)",
            color: "hsl(220, 15%, 60%)",
            border: "1px solid hsl(220, 15%, 24%)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          -10s
        </button>
        <button
          onClick={() => handleSeek(10)}
          style={{
            padding: "4px 12px",
            fontSize: 11,
            background: "hsl(222, 18%, 18%)",
            color: "hsl(220, 15%, 60%)",
            border: "1px solid hsl(220, 15%, 24%)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          +10s
        </button>
      </div>
    </div>
  );
}
