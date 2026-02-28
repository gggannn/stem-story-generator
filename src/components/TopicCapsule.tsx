'use client';

import React, { useState } from 'react';
import { Topic, ThemeCategory } from '@/types';
import {
  FlaskConical, Cpu, Building2, Calculator, Globe,
  Rocket, Plane, Train, Car, Code, Wifi,
  Castle, Cog, Zap, Trees, Mountain, Cloud,
  Shapes, Puzzle,
  ChevronRight, Sparkles
} from 'lucide-react';

// Main Category definitions (5 STEM categories)
const mainCategories: { id: ThemeCategory; name: string; icon: React.ReactNode; color: string; description: string }[] = [
  { id: 'science', name: '🔬 科学探索', icon: <FlaskConical className="w-5 h-5" />, color: 'violet', description: '探索自然奥秘' },
  { id: 'technology', name: '🚀 技术发明', icon: <Cpu className="w-5 h-5" />, color: 'sky', description: '创造与创新' },
  { id: 'engineering', name: '🏗️ 工程世界', icon: <Building2 className="w-5 h-5" />, color: 'orange', description: '设计与建造' },
  { id: 'earth', name: '🌍 地球奥秘', icon: <Globe className="w-5 h-5" />, color: 'emerald', description: '我们美丽的家园' },
  { id: 'mathematics', name: '🔢 数学思维', icon: <Calculator className="w-5 h-5" />, color: 'rose', description: '智慧与逻辑' },
];

// Topics grouped by category (20 topics total as per plan)
const topicsByCategory: Record<ThemeCategory, { id: Topic; name: string; icon: React.ReactNode }[]> = {
  science: [
    { id: 'dinosaur', name: '恐龙王国', icon: <Rocket className="w-4 h-4" /> },
    { id: 'solar_system', name: '宇宙奥秘', icon: <Rocket className="w-4 h-4" /> },
    { id: 'animals', name: '动物世界', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'insects', name: '昆虫世界', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'ocean', name: '海洋深处', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'human_body', name: '人体秘密', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'plants', name: '植物王国', icon: <FlaskConical className="w-4 h-4" /> },
  ],
  technology: [
    { id: 'robot', name: '机器人世界', icon: <Cpu className="w-4 h-4" /> },
    { id: 'airplane', name: '飞机与飞行', icon: <Plane className="w-4 h-4" /> },
    { id: 'cars_trains', name: '火车与汽车', icon: <Car className="w-4 h-4" /> },
    { id: 'programming', name: '编程初体验', icon: <Code className="w-4 h-4" /> },
    { id: 'internet', name: '互联网探索', icon: <Wifi className="w-4 h-4" /> },
  ],
  engineering: [
    { id: 'architecture', name: '建筑工程', icon: <Building2 className="w-4 h-4" /> },
    { id: 'machines', name: '机械装置', icon: <Cog className="w-4 h-4" /> },
    { id: 'energy', name: '能源工程', icon: <Zap className="w-4 h-4" /> },
  ],
  earth: [
    { id: 'forest', name: '森林秘境', icon: <Trees className="w-4 h-4" /> },
    { id: 'mountains', name: '山川河流', icon: <Mountain className="w-4 h-4" /> },
    { id: 'weather', name: '天气变化', icon: <Cloud className="w-4 h-4" /> },
  ],
  mathematics: [
    { id: 'shapes', name: '形状与空间', icon: <Shapes className="w-4 h-4" /> },
    { id: 'logic', name: '逻辑与谜题', icon: <Puzzle className="w-4 h-4" /> },
  ],
};

const colorMap: Record<string, { selected: string; default: string }> = {
  violet: { selected: 'bg-violet-500/20 border-violet-500/50 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  sky: { selected: 'bg-sky-500/20 border-sky-500/50 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.3)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  orange: { selected: 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  emerald: { selected: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
  rose: { selected: 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]', default: 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300' },
};

interface TopicCapsuleProps {
  selected: Topic;
  onChange: (topic: Topic) => void;
}

export function TopicCapsule({ selected, onChange }: TopicCapsuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>(() => {
    // Find which category the currently selected topic belongs to
    for (const [catId, topics] of Object.entries(topicsByCategory)) {
      if (topics.some(t => t.id === selected)) {
        return catId as ThemeCategory;
      }
    }
    return 'science';
  });

  // Get current topics
  const currentTopics = topicsByCategory[selectedCategory] || [];

  const handleCategoryClick = (categoryId: ThemeCategory) => {
    setSelectedCategory(categoryId);
  };

  const handleTopicClick = (topicId: Topic) => {
    onChange(topicId);
  };

  return (
    <div className="space-y-3">
      {/* Level 1: Main Categories */}
      <div className="flex flex-wrap gap-2">
        {mainCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const colors = colorMap[category.color] || colorMap.violet;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out border
                ${isSelected
                  ? colors.selected
                  : colors.default
                }
                active:scale-95
              `}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Level 2: Topics */}
      {currentTopics.length > 0 && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ChevronRight className="w-4 h-4 text-slate-500" />
          <div className="flex flex-wrap gap-2">
            {currentTopics.map((topic) => {
              const isSelected = selected === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.id as Topic)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200 ease-out border
                    ${isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }
                    active:scale-95
                  `}
                >
                  {isSelected && <Sparkles className="w-3 h-3" />}
                  {topic.icon}
                  <span>{topic.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
