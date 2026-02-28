import { ThemeDomain, Topic } from '@/types';

// Updated theme config for SpaceExplorer - using new 20 topic IDs
export const themeDomains: ThemeDomain[] = [
  {
    id: 'science',
    name: '🔬 科学探索',
    icon: '🔬',
    color: '#8b5cf6',
    subThemes: [
      { id: 'dinosaur', name: '恐龙王国', topics: ['dinosaur'] },
      { id: 'solar_system', name: '宇宙奥秘', topics: ['solar_system'] },
      { id: 'animals', name: '动物世界', topics: ['animals'] },
      { id: 'insects', name: '昆虫世界', topics: ['insects'] },
      { id: 'ocean', name: '海洋深处', topics: ['ocean'] },
      { id: 'human_body', name: '人体秘密', topics: ['human_body'] },
      { id: 'plants', name: '植物王国', topics: ['plants'] },
    ],
  },
  {
    id: 'technology',
    name: '🚀 技术发明',
    icon: '🚀',
    color: '#0ea5e9',
    subThemes: [
      { id: 'robot', name: '机器人世界', topics: ['robot'] },
      { id: 'airplane', name: '飞机与飞行', topics: ['airplane'] },
      { id: 'cars_trains', name: '火车与汽车', topics: ['cars_trains'] },
      { id: 'programming', name: '编程初体验', topics: ['programming'] },
      { id: 'internet', name: '互联网探索', topics: ['internet'] },
    ],
  },
  {
    id: 'engineering',
    name: '🏗️ 工程世界',
    icon: '🏗️',
    color: '#f97316',
    subThemes: [
      { id: 'architecture', name: '建筑工程', topics: ['architecture'] },
      { id: 'machines', name: '机械装置', topics: ['machines'] },
      { id: 'energy', name: '能源工程', topics: ['energy'] },
    ],
  },
  {
    id: 'earth',
    name: '🌍 地球奥秘',
    icon: '🌍',
    color: '#10b981',
    subThemes: [
      { id: 'forest', name: '森林秘境', topics: ['forest'] },
      { id: 'mountains', name: '山川河流', topics: ['mountains'] },
      { id: 'weather', name: '天气变化', topics: ['weather'] },
    ],
  },
  {
    id: 'mathematics',
    name: '🔢 数学思维',
    icon: '🔢',
    color: '#ec4899',
    subThemes: [
      { id: 'shapes', name: '形状与空间', topics: ['shapes'] },
      { id: 'logic', name: '逻辑与谜题', topics: ['logic'] },
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
