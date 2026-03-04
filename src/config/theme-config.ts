import { ThemeDomain, Topic } from '@/types';

// Theme Domains (Category / 一级)
// Each domain contains subThemes which are the visible Topics (二级)
// Each topic contains hidden subTopics (三级) for API-level story differentiation

export const themeDomains: ThemeDomain[] = [
  {
    id: 'science',
    name: '科学探索',
    icon: '🔬',
    color: '#8b5cf6',
    subThemes: [
      { id: 'dinosaur', name: '恐龙王国', topics: ['dinosaur_types', 'dinosaur_era', 'fossil', 'extinction_mystery'] },
      { id: 'space', name: '宇宙奥秘', topics: ['planets', 'stars', 'astronaut', 'blackhole', 'moon_landing', 'aliens_search'] },
      { id: 'animals', name: '动物世界', topics: ['wild_animals', 'pets', 'extinct_animals', 'migration', 'animal_senses'] },
      { id: 'insects', name: '昆虫世界', topics: ['insect_types', 'butterfly', 'bee_ant', 'mimicry', 'beetle_armor'] },
      { id: 'ocean', name: '海洋深处', topics: ['sea_creatures', 'coral', 'deep_sea', 'ocean_currents', 'marine_protection'] },
      { id: 'human_body', name: '人体秘密', topics: ['skeleton', 'digestion', 'brain_power', 'five_senses', 'blood_travel', 'DNA'] },
      { id: 'plants', name: '植物王国', topics: ['photosynthesis', 'seeds_travel', 'carnivorous_plants', 'giant_trees', 'flowers'] },
    ],
  },
  {
    id: 'technology',
    name: '技术发明',
    icon: '🚀',
    color: '#0ea5e9',
    subThemes: [
      { id: 'robot', name: '机器人世界', topics: ['robot_basics', 'ai', 'future_tech', 'bionic_robots', 'robot_coding'] },
      { id: 'airplane', name: '飞机与飞行', topics: ['airplane', 'flight', 'spacecraft', 'drones', 'hot_air_balloons', 'aerodynamics'] },
      { id: 'programming', name: '编程初体验', topics: ['algorithms', 'coding_logic', 'hardware', 'game_design', 'scratch_fun'] },
      { id: 'internet', name: '互联网探索', topics: ['world_wide_web', 'cyber_safety', 'social_media', 'cloud_storage', '5G_6G'] },
      { id: 'cars_trains', name: '火车与汽车', topics: ['electric_cars', 'maglev_trains', 'engine_work', 'racing_cars', 'smart_traffic'] },
    ],
  },
  {
    id: 'engineering',
    name: '工程世界',
    icon: '🏗️',
    color: '#f97316',
    subThemes: [
      { id: 'architecture', name: '建筑工程', topics: ['skyscrapers', 'bridges', 'ancient_wonders', 'eco_friendly_houses', 'tunnels'] },
      { id: 'machines', name: '机械装置', topics: ['simple_machines', 'gears', 'hydraulic_power', 'clockwork', 'factory_automation'] },
      { id: 'energy', name: '能源工程', topics: ['solar_power', 'wind_turbines', 'electricity', 'batteries', 'nuclear_energy'] },
    ],
  },
  {
    id: 'earth',
    name: '地球奥秘',
    icon: '🌍',
    color: '#10b981',
    subThemes: [
      { id: 'forest', name: '森林秘境', topics: ['forest_life', 'forest_plants', 'ecosystem', 'rainforest', 'seasonal_changes'] },
      { id: 'mountains', name: '山川河流', topics: ['volcanoes', 'glaciers', 'river_cycle', 'caves', 'plate_tectonics'] },
      { id: 'weather', name: '天气变化', topics: ['clouds', 'storms', 'global_warming', 'seasons', 'rainbows', 'natural_disasters'] },
    ],
  },
  {
    id: 'math',
    name: '数学思维',
    icon: '🔢',
    color: '#ec4899',
    subThemes: [
      { id: 'shapes', name: '形状与空间', topics: ['2D_3D_shapes', 'symmetry', 'geometry_in_nature', 'architecture_math'] },
      { id: 'logic', name: '逻辑与谜题', topics: ['sequences', 'binary_code', 'probability', 'strategy_games', 'paradoxes'] },
    ],
  },
];

// Helper to get domain by ID
export function getThemeDomain(id: string): ThemeDomain | undefined {
  return themeDomains.find(domain => domain.id === id);
}

// Helper to get all visible topics (二级) from a domain
export function getTopicsFromDomain(domainId: string): Topic[] {
  const domain = getThemeDomain(domainId);
  if (!domain) return [];

  return domain.subThemes.map(st => st.id as Topic);
}

// Helper to get hidden subTopics (三级) for API
export function getSubTopicsFromTopic(topicId: string): Topic[] {
  for (const domain of themeDomains) {
    const subTheme = domain.subThemes.find(st => st.id === topicId);
    if (subTheme) {
      return subTheme.topics;
    }
  }
  // Fallback: return the topic itself if no subTopics defined
  return [topicId as Topic];
}

// Helper to get topic from subTheme (for API)
export function getRandomSubTopic(topicId: string): Topic | null {
  const subTopics = getSubTopicsFromTopic(topicId);
  if (subTopics.length === 0) return null;

  // Randomly select one subTopic for story variation
  const randomIndex = Math.floor(Math.random() * subTopics.length);
  return subTopics[randomIndex];
}
