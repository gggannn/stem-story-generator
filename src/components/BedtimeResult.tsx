import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BedtimeStory } from '@/types';
import { ArrowLeft, Volume2, VolumeX, RefreshCw, Loader2, Sparkles, Moon, Settings } from 'lucide-react';
import { CosmicVoid } from './CosmicVoid';
import { useTTS } from '@/hooks/useTTS';

interface BedtimeResultProps {
  story: BedtimeStory;
  onBack: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

// 语音选项 - 阿里云标准发音人
const VOICE_OPTIONS = [
  { value: 'Xiaoyun', label: '云小蜜 (女声)' },
  { value: 'Xiaogang', label: '阿钢 (男声)' },
  { value: 'Ruoxi', label: '若琪 (女声)' },
  { value: 'Siqi', label: '思琪 (女声)' },
  { value: 'Sijia', label: '思佳 (女声)' },
  { value: 'Sicheng', label: '思诚 (男声)' },
  { value: 'Aiqi', label: '艾琪 (女声)' },
];

export function BedtimeResult({ story, onBack, onRegenerate, isLoading }: BedtimeResultProps) {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Xiaoyun');
  const [speechRate, setSpeechRate] = useState(0);

  // Handle both new format (body/recap/parent_tip) and old cached format (story/review/interaction)
  type LegacyBedtimeStory = { story?: string[]; review?: string[]; interaction?: string };
  const legacyStory = story as BedtimeStory & LegacyBedtimeStory;
  const storyBody = legacyStory.body || legacyStory.story || [];
  const storyRecap = legacyStory.recap || legacyStory.review || [];
  const storyParentTip = legacyStory.parent_tip || legacyStory.interaction || '';

  const { speak, stop, isLoading: isSpeaking, isPlaying, error: ttsError } = useTTS({
    voice: selectedVoice,
    speech_rate: speechRate,
  });

  const handleSpeak = async () => {
    if (isPlaying) {
      stop();
      return;
    }
    // 合并标题和正文为一个完整的语音文本
    const fullText = `${story.title}。${storyBody.join('')}`;
    console.log('>>> TTS fullText length:', fullText.length);
    console.log('>>> storyBody array length:', storyBody.length);
    console.log('>>> storyBody:', storyBody);
    await speak(fullText);
  };

  return (
    <>
      <CosmicVoid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen py-8 px-4"
      >
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2 text-indigo-400">
            <Moon className="w-5 h-5" />
            <span className="font-semibold">睡前听</span>
          </div>
        </div>

        {/* Story Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 md:p-8"
        >
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-400 mb-6">
            {story.title}
          </h1>

          {/* Story Body */}
          <div className="space-y-4 mb-8">
            {storyBody.map((paragraph: string, index: number) => (
              <p key={index} className="text-slate-300 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Recap Questions */}
          <div className="bg-indigo-500/10 rounded-2xl p-5 mb-6 border border-indigo-500/30">
            <h3 className="font-semibold text-indigo-400 mb-3">🤔 想想看</h3>
            <ul className="space-y-2">
              {storyRecap.map((question: string, index: number) => (
                <li key={index} className="text-slate-300">
                  {index + 1}. {question}
                </li>
              ))}
            </ul>
          </div>

          {/* Parent Tip */}
          <div className="bg-pink-500/10 rounded-2xl p-5 mb-6 border border-pink-500/30">
            <h3 className="font-semibold text-pink-400 mb-2">👨‍👩‍👧 亲子互动</h3>
            <p className="text-slate-300">{storyParentTip}</p>
          </div>

          {/* Source (folded) */}
          {story.source && (
            <details className="text-xs text-slate-500 mb-6">
              <summary className="cursor-pointer">来源</summary>
              <p className="mt-2">{story.source}</p>
            </details>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold transition-all ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
            } disabled:opacity-50`}
          >
            {isSpeaking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            {isSpeaking ? '生成语音中...' : isPlaying ? '停止播放' : '朗读故事'}
          </button>

          {/* Voice Settings Button */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-3 rounded-2xl border transition-all ${
              showVoiceSettings
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300'
            }`}
            title="语音设置"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FE6845] via-[#FF8C42] to-[#FFB347] text-white py-3 px-4 rounded-2xl font-semibold hover:from-[#E85A3A] hover:via-[#FF7A30] hover:to-[#FFA030] disabled:opacity-50 transition-all shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(254, 104, 69, 0.3)' }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                再来一个
              </>
            )}
          </button>
        </div>

        {/* Voice Settings Panel */}
        {showVoiceSettings && (
          <div className="mt-4 p-4 bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">🎤 语音设置</h4>

            {/* Voice Selection */}
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-2">选择声音</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.value}
                    onClick={() => setSelectedVoice(voice.value)}
                    className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                      selectedVoice === voice.value
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {voice.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech Rate */}
            <div>
              <label className="text-xs text-slate-500 block mb-2">
                语速: {speechRate > 0 ? `+${speechRate}` : speechRate}
              </label>
              <input
                type="range"
                min="-300"
                max="300"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>慢</span>
                <span>正常</span>
                <span>快</span>
              </div>
            </div>

            {/* Error Message */}
            {ttsError && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {ttsError}
              </div>
            )}
          </div>
        )}
      </div>
      </motion.div>
    </>
  );
}
