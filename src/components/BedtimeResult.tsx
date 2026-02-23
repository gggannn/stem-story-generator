import React from 'react';
import { BedtimeStory } from '@/types';
import { ArrowLeft, Volume2, RefreshCw, Loader2, Sparkles, Moon } from 'lucide-react';
import { CosmicVoid } from './CosmicVoid';

interface BedtimeResultProps {
  story: BedtimeStory;
  onBack: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function BedtimeResult({ story, onBack, onRegenerate, isLoading }: BedtimeResultProps) {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const text = `${story.title}。${story.body.join('。')}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <CosmicVoid />
      <div className="min-h-screen py-8 px-4">
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
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-400 mb-6">
            {story.title}
          </h1>

          {/* Story Body */}
          <div className="space-y-4 mb-8">
            {story.body.map((paragraph, index) => (
              <p key={index} className="text-slate-300 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Recap Questions */}
          <div className="bg-indigo-500/10 rounded-2xl p-5 mb-6 border border-indigo-500/30">
            <h3 className="font-semibold text-indigo-400 mb-3">🤔 想想看</h3>
            <ul className="space-y-2">
              {story.recap.map((question, index) => (
                <li key={index} className="text-slate-300">
                  {index + 1}. {question}
                </li>
              ))}
            </ul>
          </div>

          {/* Parent Tip */}
          <div className="bg-pink-500/10 rounded-2xl p-5 mb-6 border border-pink-500/30">
            <h3 className="font-semibold text-pink-400 mb-2">👨‍👩‍👧 亲子互动</h3>
            <p className="text-slate-300">{story.parent_tip}</p>
          </div>

          {/* Source (folded) */}
          {story.source && (
            <details className="text-xs text-slate-500 mb-6">
              <summary className="cursor-pointer">来源</summary>
              <p className="mt-2">{story.source}</p>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSpeak}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-3 px-4 rounded-2xl font-semibold hover:bg-indigo-500/30 transition-all"
          >
            <Volume2 className="w-5 h-5" />
            朗读故事
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
      </div>
      </div>
    </>
  );
}
