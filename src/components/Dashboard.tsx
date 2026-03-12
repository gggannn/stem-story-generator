import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StoryMode, Age, Topic, HistoryItem, Identity } from '../types';
import { MODES, AGES, TOPICS, DURATIONS, IDENTITIES } from '../constants/topics';
import { Rocket, Moon, BookOpen, Clock, History as HistoryIcon, LogOut, User, Edit } from 'lucide-react';
import clsx from 'clsx';

interface UserProfile {
  name: string;
  age: Age;
  identity?: Identity;
}

interface DashboardProps {
  profile: UserProfile;
  history: HistoryItem[];
  onGenerate: (mode: StoryMode, age: Age, topic: Topic, duration?: number) => void;
  onHistoryClick: (item: HistoryItem) => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

export function Dashboard({
  profile,
  history,
  onGenerate,
  onHistoryClick,
  onLogout,
  onEditProfile,
}: DashboardProps) {
  const [mode, setMode] = useState<StoryMode>('bedtime');
  const [age, setAge] = useState<Age>(profile.age);
  const [category, setCategory] = useState<string>('');
  const [topic, setTopic] = useState<Topic>('dinosaur');
  const [duration, setDuration] = useState<number>(10);

  const categories = ['科学探索', '技术发明', '工程世界', '地球奥秘', '数学思维'];

  const identityInfo = IDENTITIES.find(i => i.id === profile.identity);
  const IdentityIcon = identityInfo?.icon || IDENTITIES[0].icon;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
            <IdentityIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}，你好！</h2>
            <p className="text-white/60 text-sm">
              {IDENTITIES.find(i => i.id === profile.identity)?.label || '星际探索者'} • {profile.age}岁
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEditProfile}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title="编辑资料"
          >
            <Edit className="w-5 h-5 text-white/60" />
          </button>
          <button
            onClick={onLogout}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={clsx(
              "mode-btn",
              m.id === 'bedtime' ? "mode-btn-purple" : "mode-btn-emerald",
              mode === m.id && (m.id === 'bedtime' ? "mode-btn-purple-active" : "mode-btn-emerald-active")
            )}
          >
            <m.icon className={clsx("w-10 h-10 mb-2", mode === m.id ? "text-white" : "text-white/40")} />
            <span className="font-bold text-lg">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Age Selector */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          适合年龄
        </h3>
        <div className="flex flex-wrap gap-2">
          {AGES.map((a) => (
            <button
              key={a}
              onClick={() => setAge(a)}
              className={clsx(
                "capsule-btn",
                age === a ? "capsule-btn-active" : "hover:bg-white/10"
              )}
            >
              {a}岁
            </button>
          ))}
        </div>
      </section>

      {/* Topic Selector */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-400" />
          探索主题
        </h3>

        {/* Category Selection - Always Visible */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                "p-3 rounded-xl border transition-all text-sm font-medium",
                category === cat
                  ? "bg-white/10 border-white/40 text-white"
                  : "border-white/10 text-white/60 hover:bg-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topic Selection - Shows when category selected */}
        {category && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {TOPICS.filter(t => t.category === category).map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-xl border border-white/10 transition-all",
                  topic === t.id ? "bg-white/10 border-white/40" : "hover:bg-white/5"
                )}
              >
                <t.icon className={clsx("w-4 h-4", topic === t.id ? "text-white" : "text-white/40")} />
                <span className={clsx("text-xs font-medium", topic === t.id ? "text-white" : "text-white/60")}>{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </section>

      {/* Duration Selector (Bedtime only) */}
      {mode === 'bedtime' && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 overflow-hidden"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            故事时长
          </h3>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={clsx(
                  "capsule-btn",
                  duration === d ? "capsule-btn-active" : "hover:bg-white/10"
                )}
              >
                {d}分钟
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Generate Button */}
      <div className="pt-4">
        <button
          onClick={() => onGenerate(mode, age, topic, mode === 'bedtime' ? duration : undefined)}
          className="w-full rocket-btn h-16"
        >
          <Rocket className="w-6 h-6" />
          生成我的专属故事
        </button>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-white/40" />
            最近探索
          </h3>
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onHistoryClick(item)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    item.mode === 'bedtime' ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {item.mode === 'bedtime' ? <Moon className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-white/40">
                      {TOPICS.find(t => t.id === item.topic)?.label} • {item.age}岁
                    </p>
                  </div>
                </div>
                <span className="text-xs text-white/20">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
