import { ThemeDomain, Topic } from '@/types';

export const themeDomains: ThemeDomain[] = [
  {
    id: 'space',
    name: '太空探索',
    icon: '🌌',
    color: '#6366f1',
    subThemes: [
      { id: 'planets', name: '行星', topics: ['space'] },
      { id: 'stars', name: '恒星与星座', topics: ['space'] },
      { id: 'astronaut', name: '宇航员', topics: ['space'] },
      { id: 'blackhole', name: '黑洞与宇宙', topics: ['space'] },
    ],
  },
  {
    id: 'ocean',
    name: '海洋世界',
    icon: '🌊',
    color: '#0ea5e9',
    subThemes: [
      { id: 'sea-creatures', name: '海洋生物', topics: ['ocean', 'animal'] },
      { id: 'coral', name: '珊瑚礁', topics: ['ocean'] },
      { id: 'deep-sea', name: '深海探险', topics: ['ocean'] },
    ],
  },
  {
    id: 'dinosaur',
    name: '恐龙王国',
    icon: '🦕',
    color: '#f59e0b',
    subThemes: [
      { id: 'dinosaur-types', name: '恐龙种类', topics: ['dinosaur'] },
      { id: 'dinosaur-era', name: '恐龙时代', topics: ['dinosaur'] },
      { id: 'fossil', name: '化石与考古', topics: ['dinosaur'] },
    ],
  },
  {
    id: 'robot',
    name: '机器人科技',
    icon: '🤖',
    color: '#8b5cf6',
    subThemes: [
      { id: 'robot-basics', name: '机器人基础', topics: ['robot'] },
      { id: 'ai', name: '人工智能', topics: ['robot'] },
      { id: 'future-tech', name: '未来科技', topics: ['robot'] },
    ],
  },
  {
    id: 'forest',
    name: '森林奇境',
    icon: '🌲',
    color: '#22c55e',
    subThemes: [
      { id: 'forest-life', name: '森林生物', topics: ['forest', 'animal'] },
      { id: 'plants', name: '植物世界', topics: ['forest'] },
      { id: 'ecosystem', name: '生态系统', topics: ['forest'] },
    ],
  },
  {
    id: 'insect',
    name: '昆虫世界',
    icon: '🦋',
    color: '#ec4899',
    subThemes: [
      { id: 'insect-types', name: '昆虫种类', topics: ['insect'] },
      { id: 'butterfly', name: '蝴蝶与蛾', topics: ['insect'] },
      { id: 'bee-ant', name: '蜜蜂与蚂蚁', topics: ['insect', 'animal'] },
    ],
  },
  {
    id: 'airplane',
    name: '飞行器',
    icon: '✈️',
    color: '#f97316',
    subThemes: [
      { id: 'airplane', name: '飞机', topics: ['airplane'] },
      { id: 'flight', name: '飞行原理', topics: ['airplane'] },
      { id: 'spacecraft', name: '航天器', topics: ['airplane', 'space'] },
    ],
  },
  {
    id: 'animal',
    name: '动物王国',
    icon: '🦁',
    color: '#eab308',
    subThemes: [
      { id: 'wild-animals', name: '野生动物', topics: ['animal'] },
      { id: 'pets', name: '宠物世界', topics: ['animal'] },
      { id: 'extinct', name: '灭绝动物', topics: ['animal', 'dinosaur'] },
    ],
  },
];

// Helper to get domain by ID
export function getThemeDomain(id: string): ThemeDomain | undefined {
  return themeDomains.find(domain => domain.id === id);
}

// Helper to get topic from subTheme
export function getTopicFromSubTheme(domainId: string, subThemeId: string): Topic | null {
  const domain = getThemeDomain(domainId);
  if (!domain) return null;

  const subTheme = domain.subThemes.find(st => st.id === subThemeId);
  if (!subTheme || subTheme.topics.length === 0) return null;

  return subTheme.topics[0];
}
