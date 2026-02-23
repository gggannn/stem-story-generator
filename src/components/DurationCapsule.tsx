import React from 'react';
import { Duration } from '@/types';
import { Clock } from 'lucide-react';

interface DurationCapsuleProps {
  selected: Duration;
  onChange: (duration: Duration) => void;
  disabled?: boolean;
  compact?: boolean;
}

const durations: Duration[] = [5, 8, 10, 12];

export function DurationCapsule({ selected, onChange, disabled = false, compact = false }: DurationCapsuleProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''} ${compact ? 'gap-1' : ''}`}>
      {durations.map((duration) => {
        const isSelected = selected === duration;
        return (
          <button
            key={duration}
            onClick={() => !disabled && onChange(duration)}
            disabled={disabled}
            className={`
              relative flex items-center gap-2 rounded-xl text-sm font-bold
              transition-all duration-200 ease-out border
              ${compact
                ? `px-2.5 py-1.5 ${isSelected ? 'text-xs' : 'text-xs'}`
                : 'px-5 py-3'
              }
              ${isSelected && !disabled
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
              }
              active:scale-95
            `}
          >
            <Clock className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            {duration}{compact ? '分' : '分钟'}
          </button>
        );
      })}
    </div>
  );
}
