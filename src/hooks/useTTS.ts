import { useState, useRef, useEffect } from 'react';

interface UseTTSOptions {
  voice?: string;
  speech_rate?: number;
  pitch_rate?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = async (text: string) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice || 'xiaoyun',
          speech_rate: options.speech_rate || 0,
          pitch_rate: options.pitch_rate || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '语音合成失败');
      }

      // Create audio element and play
      const audio = new Audio(data.audio);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setError('播放失败');
        setIsPlaying(false);
      };

      await audio.play();

    } catch (err) {
      setError(err instanceof Error ? err.message : '语音合成失败');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    error,
  };
}
