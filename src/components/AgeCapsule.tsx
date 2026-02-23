import React from 'react';
import { Age } from '@/types';

interface AgeCapsuleProps {
  selected: Age;
  onChange: (age: Age) => void;
  compact?: boolean;
}

const ages: Age[] = [5, 6, 7, 8, 9, 10, 11, 12];

export function AgeCapsule({ selected, onChange, compact = false }: AgeCapsuleProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : ''}`}>
      {ages.map((age) => {
        const isSelected = selected === age;
        return (
          <button
            key={age}
            onClick={() => onChange(age)}
            className={`
              relative rounded-xl text-sm font-bold
              transition-all duration-200 ease-out
              ${compact
                ? `px-3 py-1.5 ${isSelected ? 'text-xs' : 'text-xs'}`
                : 'px-5 py-3'
              }
              ${isSelected
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-300'
              }
              active:scale-95
            `}
          >
            {age}岁
          </button>
        );
      })}
    </div>
  );
}
