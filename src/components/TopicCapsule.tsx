import React from 'react';
import { Topic } from '@/types';
import { Droplets, Rocket, Plane, Bug, Bot, PawPrint, Trees, Flame } from 'lucide-react';

interface TopicCapsuleProps {
  selected: Topic;
  onChange: (topic: Topic) => void;
}

const uniqueTopics = [
  { value: 'dinosaur', label: '恐龙', icon: <Flame className="w-5 h-5" />, color: 'orange' },
  { value: 'space', label: '宇宙', icon: <Rocket className="w-5 h-5" />, color: 'indigo' },
  { value: 'airplane', label: '飞机', icon: <Plane className="w-5 h-5" />, color: 'sky' },
  { value: 'insect', label: '昆虫', icon: <Bug className="w-5 h-5" />, color: 'green' },
  { value: 'robot', label: '机器人', icon: <Bot className="w-5 h-5" />, color: 'slate' },
  { value: 'ocean', label: '海洋', icon: <Droplets className="w-5 h-5" />, color: 'blue' },
  { value: 'forest', label: '森林', icon: <Trees className="w-5 h-5" />, color: 'emerald' },
  { value: 'animal', label: '动物', icon: <PawPrint className="w-5 h-5" />, color: 'amber' },
];

const colorMap: Record<string, { selected: string; border: string; glow: string; default: string }> = {
  orange: { selected: 'bg-orange-500/20 border-orange-500/50 text-orange-400', border: 'border-orange-500/30', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  indigo: { selected: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  sky: { selected: 'bg-sky-500/20 border-sky-500/50 text-sky-400', border: 'border-sky-500/30', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  green: { selected: 'bg-green-500/20 border-green-500/50 text-green-400', border: 'border-green-500/30', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  slate: { selected: 'bg-slate-500/20 border-slate-500/50 text-slate-300', border: 'border-slate-500/30', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  blue: { selected: 'bg-blue-500/20 border-blue-500/50 text-blue-400', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  emerald: { selected: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  amber: { selected: 'bg-amber-500/20 border-amber-500/50 text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
};

export function TopicCapsule({ selected, onChange }: TopicCapsuleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {uniqueTopics.map((topic) => {
        const isSelected = selected === topic.value;
        const colors = colorMap[topic.color];

        return (
          <button
            key={topic.value}
            onClick={() => onChange(topic.value as Topic)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 ease-out border
              ${isSelected ? `${colors.selected} ${colors.glow}` : colors.default}
              active:scale-95
            `}
          >
            {topic.icon}
            <span>{topic.label}</span>
          </button>
        );
      })}
    </div>
  );
}
