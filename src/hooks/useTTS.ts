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
  const [currentSegment, setCurrentSegment] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const isStoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSegment = async (segmentIndex: number) => {
    if (isStoppedRef.current || segmentIndex >= segmentsRef.current.length) {
      setIsPlaying(false);
      setCurrentSegment(0);
      return;
    }

    const text = segmentsRef.current[segmentIndex];
    setCurrentSegment(segmentIndex + 1);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: options.voice || 'Xiaoyun',
          speech_rate: options.speech_rate || 0,
          pitch_rate: options.pitch_rate || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '语音合成失败');
      }

      if (isStoppedRef.current) return;

      const audio = new Audio(data.audio);
      audioRef.current = audio;

      audio.onended = () => {
        playSegment(segmentIndex + 1);
      };

      audio.onerror = () => {
        setError('播放失败');
        setIsPlaying(false);
      };

      await audio.play();

    } catch (err) {
      setError(err instanceof Error ? err.message : '语音合成失败');
      setIsPlaying(false);
    }
  };

  const speak = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    isStoppedRef.current = false;
    setIsLoading(true);
    setError(null);
    setIsPlaying(true);

    // 按段落分割（保留标题）
    const segments = text.split('。').filter(s => s.trim().length > 0).map(s => s + '。');
    segmentsRef.current = segments;
    setTotalSegments(segments.length);
    setCurrentSegment(0);

    setIsLoading(false);
    await playSegment(0);
  };

  const stop = () => {
    isStoppedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSegment(0);
  };

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    error,
    currentSegment,
    totalSegments,
  };
}
