import React from 'react';
import { StoryMode, Age, Topic, Duration } from '@/types';

interface PasswordDisplayProps {
  mode: StoryMode;
  age: Age;
  topic: Topic;
  minutes: Duration;
}

const topicLabels: Record<Topic, string> = {
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
