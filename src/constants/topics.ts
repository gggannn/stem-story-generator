import {
  Zap,
  Rocket,
  Plane,
  Bug,
  Cpu,
  Waves,
  Trees,
  PawPrint,
  Moon,
  BookOpen,
  User as UserIcon,
  Leaf,
  Mountain,
  Cloud,
  Shapes,
  Brain,
  Building,
  Cog,
  Zap as Energy,
  Car,
  Compass,
  Eye,
  Wrench,
  Lightbulb,
  KeyRound,
  LucideIcon
} from 'lucide-react';
import { StoryMode, Age, Topic, Identity } from '@/types';

// 完整的二级主题列表
export const TOPICS: { id: Topic; label: string; icon: LucideIcon; category: string }[] = [
  // 科学探索
  { id: 'dinosaur', label: '恐龙王国', icon: Zap, category: '科学探索' },
  { id: 'space', label: '宇宙奥秘', icon: Rocket, category: '科学探索' },
  { id: 'animals', label: '动物世界', icon: PawPrint, category: '科学探索' },
  { id: 'insects', label: '昆虫世界', icon: Bug, category: '科学探索' },
  { id: 'ocean', label: '海洋深处', icon: Waves, category: '科学探索' },
  { id: 'human_body', label: '人体秘密', icon: UserIcon, category: '科学探索' },
  { id: 'plants', label: '植物王国', icon: Leaf, category: '科学探索' },
  // 技术发明
  { id: 'robot', label: '机器人世界', icon: Cpu, category: '技术发明' },
  { id: 'airplane', label: '飞机与飞行', icon: Plane, category: '技术发明' },
  { id: 'programming', label: '编程初体验', icon: Brain, category: '技术发明' },
  { id: 'internet', label: '互联网探索', icon: Rocket, category: '技术发明' },
  { id: 'cars_trains', label: '火车与汽车', icon: Car, category: '技术发明' },
  // 工程世界
  { id: 'architecture', label: '建筑工程', icon: Building, category: '工程世界' },
  { id: 'machines', label: '机械装置', icon: Cog, category: '工程世界' },
  { id: 'energy', label: '能源工程', icon: Energy, category: '工程世界' },
  // 地球奥秘
  { id: 'forest', label: '森林秘境', icon: Trees, category: '地球奥秘' },
  { id: 'mountains', label: '山川河流', icon: Mountain, category: '地球奥秘' },
  { id: 'weather', label: '天气变化', icon: Cloud, category: '地球奥秘' },
  // 数学思维
  { id: 'shapes', label: '形状与空间', icon: Shapes, category: '数学思维' },
  { id: 'logic', label: '逻辑与谜题', icon: Brain, category: '数学思维' },
];

export const AGES: Age[] = [5, 6, 7, 8, 9, 10, 11, 12];

export const DURATIONS = [5, 8, 10, 12];

export const MODES: { id: StoryMode; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'bedtime', label: '睡前听', icon: Moon, color: 'purple' },
  { id: 'reading', label: '阅读材料', icon: BookOpen, color: 'emerald' },
];

export const IDENTITIES: { id: Identity; label: string; icon: LucideIcon; emoji: string; tagline: string }[] = [
  { id: 'explorer', label: '星际探索者', icon: Compass, emoji: '🧭', tagline: '去未知世界发现秘密' },
  { id: 'observer', label: '未来观察家', icon: Eye, emoji: '👀', tagline: '从细节中发现规律' },
  { id: 'builder', label: '机械建造师', icon: Wrench, emoji: '🔧', tagline: '用工具解决难题' },
  { id: 'inventor', label: '奇想发明家', icon: Lightbulb, emoji: '💡', tagline: '把想法变成新发明' },
  { id: 'solver', label: '时空解谜家', icon: KeyRound, emoji: '🧩', tagline: '破解隐藏的科学谜题' },
];

export const LOADING_MESSAGES = [
  "正在联络外星科学家...",
  "正在从恐龙时代搬运故事...",
  "正在给机器人充能...",
  "正在深海里寻找灵感...",
  "正在森林里听小鸟唱歌...",
  "正在太空中捕捉星光...",
];
