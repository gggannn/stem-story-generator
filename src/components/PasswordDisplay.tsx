import React from 'react';
import { StoryMode, Age, Topic, Duration } from '@/types';

interface PasswordDisplayProps {
  mode: StoryMode;
  age: Age;
  topic: Topic;
  minutes: Duration;
}

const topicLabels: Record<Topic, string> = {
  dinosaur: '恐龙',
  space: '宇宙',
  airplane: '飞机',
  insect: '昆虫',
  robot: '机器人',
  ocean: '海洋',
  forest: '森林',
  animal: '动物',
};

const modeLabels: Record<StoryMode, { main: string; desc: string }> = {
  bedtime: { main: '睡前放松', desc: '10分钟' },
  reading: { main: '阅读材料', desc: '目标1页' },
};

export function PasswordDisplay({ mode, age, topic, minutes }: PasswordDisplayProps) {
  const modeInfo = modeLabels[mode];

  return (
    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 bg-slate-900/50">
      <p className="text-center text-slate-500 text-sm mb-2">我的故事关键词</p>
      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
          {age}岁
        </span>
        <span className="text-slate-600">｜</span>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
          {topicLabels[topic]}
        </span>
        <span className="text-slate-600">｜</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${
            mode === 'bedtime'
              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {modeInfo.main}
        </span>
        <span className="text-slate-600">｜</span>
        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
          {mode === 'bedtime' ? `${minutes}分钟` : modeInfo.desc}
        </span>
      </div>
    </div>
  );
}
