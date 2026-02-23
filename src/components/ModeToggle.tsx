import React from 'react';
import { StoryMode } from '@/types';
import { Moon, BookOpen } from 'lucide-react';

interface ModeToggleProps {
  mode: StoryMode;
  onChange: (mode: StoryMode) => void;
  compact?: boolean;
}

export function ModeToggle({ mode, onChange, compact = false }: ModeToggleProps) {
  const isBedtime = mode === 'bedtime';

  return (
    <div className={`relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-1.5 flex shadow-inner border border-slate-700 ${compact ? 'rounded-lg p-1' : ''}`}>
      <button
        onClick={() => onChange('bedtime')}
        className={`
          relative flex items-center gap-2 rounded-xl text-sm font-bold
          transition-all duration-300 ease-out border
          ${compact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5'}
          ${isBedtime
            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
            : 'text-slate-400 hover:text-slate-300'
          }
          active:scale-95
        `}
      >
        <Moon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {compact ? '睡前' : '睡前听'}
      </button>
      <button
        onClick={() => onChange('reading')}
        className={`
          relative flex items-center gap-2 rounded-xl text-sm font-bold
          transition-all duration-300 ease-out border
          ${compact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5'}
          ${!isBedtime
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'text-slate-400 hover:text-slate-300'
          }
          active:scale-95
        `}
      >
        <BookOpen className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {compact ? '阅读' : '阅读材料'}
      </button>
    </div>
  );
}
