import React from 'react';
import { HistoryItem } from '@/types';
import { History, Moon, BookOpen } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const topicLabels: Record<string, string> = {
  // Science - 科学探索
  dinosaur: '恐龙王国',
  solar_system: '宇宙奥秘',
  animals: '动物世界',
  insects: '昆虫世界',
  ocean: '海洋深处',
  human_body: '人体秘密',
  plants: '植物王国',
  // Technology - 技术发明
  robot: '机器人世界',
  airplane: '飞机与飞行',
  cars_trains: '火车与汽车',
  programming: '编程初体验',
  internet: '互联网探索',
  // Engineering - 工程世界
  architecture: '建筑工程',
  machines: '机械装置',
  energy: '能源工程',
  // Earth - 地球奥秘
  forest: '森林秘境',
  mountains: '山川河流',
  weather: '天气变化',
  // Mathematics - 数学思维
  shapes: '形状与空间',
  logic: '逻辑与谜题',
};

export function HistoryList({ items, onSelect }: HistoryListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-400">最近回听/回读</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm hover:bg-slate-700 hover:border-slate-600 transition-all"
          >
            {item.mode === 'bedtime' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <BookOpen className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-slate-300">{topicLabels[item.topic] || item.topic}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                item.mode === 'bedtime'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {item.mode === 'bedtime' ? '听' : '读'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
