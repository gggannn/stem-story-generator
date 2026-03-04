import React from 'react';
import { StoryMode, Age, Topic, Duration } from '@/types';

interface PasswordDisplayProps {
  mode: StoryMode;
  age: Age;
  topic: Topic;
  minutes: Duration;
}

const topicLabels: Record<Topic, string> = {
  // Visible Topics (二级)
  dinosaur: '恐龙',
  space: '宇宙',
  animal: '动物',
  insect: '昆虫',
  ocean: '海洋',
  human_body: '人体',
  plants: '植物',
  robot: '机器人',
  airplane: '飞机',
  programming: '编程',
  internet: '互联网',
  cars_trains: '交通',
  architecture: '建筑',
  machines: '机械',
  energy: '能源',
  forest: '森林',
  mountains: '山川',
  weather: '天气',
  shapes: '形状',
  logic: '逻辑',
  // Science sub-topics (三级)
  dinosaur_types: '恐龙种类',
  dinosaur_era: '恐龙时代',
  fossil: '化石',
  extinction_mystery: '灭绝之谜',
  planets: '行星',
  stars: '恒星',
  astronaut: '宇航员',
  blackhole: '黑洞',
  moon_landing: '登月',
  aliens_search: '外星人',
  wild_animals: '野生动物',
  pets: '宠物',
  extinct_animals: '灭绝动物',
  migration: '动物迁徙',
  animal_senses: '动物感官',
  insect_types: '昆虫种类',
  butterfly: '蝴蝶',
  bee_ant: '蜜蜂蚂蚁',
  mimicry: '拟态',
  beetle_armor: '甲虫装甲',
  sea_creatures: '海洋生物',
  coral: '珊瑚礁',
  deep_sea: '深海',
  ocean_currents: '洋流',
  marine_protection: '海洋保护',
  skeleton: '骨骼',
  digestion: '消化',
  brain_power: '大脑',
  five_senses: '五感',
  blood_travel: '血液循环',
  DNA: 'DNA',
  photosynthesis: '光合作用',
  seeds_travel: '种子传播',
  carnivorous_plants: '食虫植物',
  giant_trees: '巨树',
  flowers: '花朵',
  // Technology sub-topics (三级)
  robot_basics: '机器人基础',
  ai: '人工智能',
  future_tech: '未来科技',
  bionic_robots: '仿生机器人',
  robot_coding: '机器人编程',
  flight: '飞行原理',
  spacecraft: '航天器',
  drones: '无人机',
  hot_air_balloons: '热气球',
  aerodynamics: '空气动力学',
  algorithms: '算法',
  coding_logic: '编程逻辑',
  hardware: '硬件',
  game_design: '游戏设计',
  scratch_fun: 'Scratch',
  world_wide_web: '万维网',
  cyber_safety: '网络安全',
  social_media: '社交媒体',
  cloud_storage: '云存储',
  '5G_6G': '5G/6G',
  electric_cars: '电动汽车',
  maglev_trains: '磁悬浮',
  engine_work: '发动机',
  racing_cars: '赛车',
  smart_traffic: '智能交通',
  // Engineering sub-topics (三级)
  skyscrapers: '摩天楼',
  bridges: '桥梁',
  ancient_wonders: '古建筑',
  eco_friendly_houses: '环保房屋',
  tunnels: '隧道',
  simple_machines: '简单机械',
  gears: '齿轮',
  hydraulic_power: '液压',
  clockwork: '发条',
  factory_automation: '工厂自动化',
  solar_power: '太阳能',
  wind_turbines: '风力发电机',
  electricity: '电',
  batteries: '电池',
  nuclear_energy: '核能',
  // Earth sub-topics (三级)
  forest_life: '森林生物',
  forest_plants: '森林植物',
  ecosystem: '生态系统',
  rainforest: '雨林',
  seasonal_changes: '季节变化',
  volcanoes: '火山',
  glaciers: '冰川',
  river_cycle: '河流',
  caves: '洞穴',
  plate_tectonics: '板块构造',
  clouds: '云',
  storms: '风暴',
  global_warming: '全球变暖',
  seasons: '四季',
  rainbows: '彩虹',
  natural_disasters: '自然灾害',
  // Math sub-topics (三级)
  '2D_3D_shapes': '2D/3D形状',
  symmetry: '对称',
  geometry_in_nature: '自然几何',
  architecture_math: '建筑数学',
  sequences: '数列',
  binary_code: '二进制',
  probability: '概率',
  strategy_games: '策略游戏',
  paradoxes: '悖论',
  // Legacy
  solar_system: '太阳系',
  animals: '动物',
  insects: '昆虫',
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
