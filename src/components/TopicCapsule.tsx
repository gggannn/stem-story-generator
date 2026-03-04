import React from 'react';
import { Topic } from '@/types';
import { Droplets, Rocket, Plane, Bug, Bot, PawPrint, Trees, Flame, Brain, Wrench, Factory, Mountain, Cloud, Shapes } from 'lucide-react';

interface TopicCapsuleProps {
  selected: Topic;
  onChange: (topic: Topic) => void;
  disabled?: boolean;
}

// 20 visible topics (二级) matching theme-config.ts
const uniqueTopics = [
  // Science (7)
  { value: 'dinosaur', label: '恐龙', icon: <Flame className="w-5 h-5" />, color: 'orange' },
  { value: 'space', label: '宇宙', icon: <Rocket className="w-5 h-5" />, color: 'indigo' },
  { value: 'animals', label: '动物', icon: <PawPrint className="w-5 h-5" />, color: 'amber' },
  { value: 'insects', label: '昆虫', icon: <Bug className="w-5 h-5" />, color: 'green' },
  { value: 'ocean', label: '海洋', icon: <Droplets className="w-5 h-5" />, color: 'blue' },
  { value: 'human_body', label: '人体', icon: <Brain className="w-5 h-5" />, color: 'rose' },
  { value: 'plants', label: '植物', icon: <Trees className="w-5 h-5" />, color: 'emerald' },
  // Technology (5)
  { value: 'robot', label: '机器人', icon: <Bot className="w-5 h-5" />, color: 'slate' },
  { value: 'airplane', label: '飞机', icon: <Plane className="w-5 h-5" />, color: 'sky' },
  { value: 'programming', label: '编程', icon: <Shapes className="w-5 h-5" />, color: 'violet' },
  { value: 'internet', label: '互联网', icon: <Rocket className="w-5 h-5" />, color: 'cyan' },
  { value: 'cars_trains', label: '汽车火车', icon: <Rocket className="w-5 h-5" />, color: 'red' },
  // Engineering (3)
  { value: 'architecture', label: '建筑', icon: <Factory className="w-5 h-5" />, color: 'amber' },
  { value: 'machines', label: '机械', icon: <Wrench className="w-5 h-5" />, color: 'orange' },
  { value: 'energy', label: '能源', icon: <Flame className="w-5 h-5" />, color: 'yellow' },
  // Earth (3)
  { value: 'forest', label: '森林', icon: <Trees className="w-5 h-5" />, color: 'emerald' },
  { value: 'mountains', label: '山川', icon: <Mountain className="w-5 h-5" />, color: 'stone' },
  { value: 'weather', label: '天气', icon: <Cloud className="w-5 h-5" />, color: 'gray' },
  // Math (2)
  { value: 'shapes', label: '形状', icon: <Shapes className="w-5 h-5" />, color: 'purple' },
  { value: 'logic', label: '逻辑', icon: <Brain className="w-5 h-5" />, color: 'pink' },
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
  // New colors
  rose: { selected: 'bg-rose-500/20 border-rose-500/50 text-rose-400', border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  violet: { selected: 'bg-violet-500/20 border-violet-500/50 text-violet-400', border: 'border-violet-500/30', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  cyan: { selected: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  red: { selected: 'bg-red-500/20 border-red-500/50 text-red-400', border: 'border-red-500/30', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  yellow: { selected: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  stone: { selected: 'bg-stone-500/20 border-stone-500/50 text-stone-300', border: 'border-stone-500/30', glow: 'shadow-[0_0_15px_rgba(120,113,108,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  gray: { selected: 'bg-gray-500/20 border-gray-500/50 text-gray-300', border: 'border-gray-500/30', glow: 'shadow-[0_0_15px_rgba(107,114,128,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  purple: { selected: 'bg-purple-500/20 border-purple-500/50 text-purple-400', border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  pink: { selected: 'bg-pink-500/20 border-pink-500/50 text-pink-400', border: 'border-pink-500/30', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
};

export function TopicCapsule({ selected, onChange, disabled = false }: TopicCapsuleProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="选择科学主题">
      {uniqueTopics.map((topic) => {
        const isSelected = selected === topic.value;
        const colors = colorMap[topic.color];

        return (
          <button
            key={topic.value}
            onClick={() => !disabled && onChange(topic.value as Topic)}
            disabled={disabled}
            aria-label={`选择${topic.label}主题`}
            className={`
              relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium
              transition-all duration-200 ease-out border
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
              ${isSelected ? `${colors.selected} ${colors.glow}` : colors.default}
              ${disabled ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/80 disabled:hover:text-slate-400' : 'active:scale-95'}
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
