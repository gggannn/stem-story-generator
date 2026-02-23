import React from 'react';
import { HistoryItem } from '@/types';
import { History, Moon, BookOpen } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const topicLabels: Record<string, string> = {
  dinosaur: '恐龙',
  space: '宇宙',
  airplane: '飞机',
  insect: '昆虫',
  robot: '机器人',
  ocean: '海洋',
  forest: '森林',
  animal: '动物',
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
