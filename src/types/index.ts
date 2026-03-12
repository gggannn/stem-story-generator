export type StoryMode = 'bedtime' | 'reading';

export type Age = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Identity = 'explorer' | 'observer' | 'builder' | 'inventor' | 'solver';

export type Topic =
  // Visible Topics (二级)
  | 'dinosaur' | 'space' | 'animal' | 'insect' | 'ocean' | 'human_body' | 'plants'
  | 'robot' | 'airplane' | 'programming' | 'internet' | 'cars_trains'
  | 'architecture' | 'machines' | 'energy'
  | 'forest' | 'mountains' | 'weather'
  | 'shapes' | 'logic'
  // Science sub-topics (三级)
  | 'dinosaur_types' | 'dinosaur_era' | 'fossil' | 'extinction_mystery'
  | 'planets' | 'stars' | 'astronaut' | 'blackhole' | 'moon_landing' | 'aliens_search'
  | 'wild_animals' | 'pets' | 'extinct_animals' | 'migration' | 'animal_senses'
  | 'insect_types' | 'butterfly' | 'bee_ant' | 'mimicry' | 'beetle_armor'
  | 'sea_creatures' | 'coral' | 'deep_sea' | 'ocean_currents' | 'marine_protection'
  | 'skeleton' | 'digestion' | 'brain_power' | 'five_senses' | 'blood_travel' | 'DNA'
  | 'photosynthesis' | 'seeds_travel' | 'carnivorous_plants' | 'giant_trees' | 'flowers'
  // Technology sub-topics (三级)
  | 'robot_basics' | 'ai' | 'future_tech' | 'bionic_robots' | 'robot_coding'
  | 'flight' | 'spacecraft' | 'drones' | 'hot_air_balloons' | 'aerodynamics'
  | 'algorithms' | 'coding_logic' | 'hardware' | 'game_design' | 'scratch_fun'
  | 'world_wide_web' | 'cyber_safety' | 'social_media' | 'cloud_storage' | '5G_6G'
  | 'electric_cars' | 'maglev_trains' | 'engine_work' | 'racing_cars' | 'smart_traffic'
  // Engineering sub-topics (三级)
  | 'skyscrapers' | 'bridges' | 'ancient_wonders' | 'eco_friendly_houses' | 'tunnels'
  | 'simple_machines' | 'gears' | 'hydraulic_power' | 'clockwork' | 'factory_automation'
  | 'solar_power' | 'wind_turbines' | 'electricity' | 'batteries' | 'nuclear_energy'
  // Earth sub-topics (三级)
  | 'forest_life' | 'forest_plants' | 'ecosystem' | 'rainforest' | 'seasonal_changes'
  | 'volcanoes' | 'glaciers' | 'river_cycle' | 'caves' | 'plate_tectonics'
  | 'clouds' | 'storms' | 'global_warming' | 'seasons' | 'rainbows' | 'natural_disasters'
  // Math sub-topics (三级)
  | '2D_3D_shapes' | 'symmetry' | 'geometry_in_nature' | 'architecture_math'
  | 'sequences' | 'binary_code' | 'probability' | 'strategy_games' | 'paradoxes'
  // Legacy (for backward compatibility)
  | 'solar_system' | 'animals' | 'insects';

// Theme categories for ThemeExplorer
export type ThemeCategory = 'science' | 'technology' | 'engineering' | 'earth' | 'math';

export type Duration = 5 | 8 | 10 | 12;

export interface StoryParams {
  mode: StoryMode;
  age: Age;
  topic: Topic;
  minutes: Duration;
}

export interface BedtimeStory {
  title: string;
  body: string[];
  recap: string[];
  parent_tip: string;
  source?: string;
}

export interface ReadingSection {
  h: string;
  p: string;
}

export interface VocabItem {
  term: string;
  explain: string;
}

export interface QuizMCQ {
  type: 'mcq';
  q: string;
  options: string[];
  answer: string;
}

export interface QuizShort {
  type: 'short';
  q: string;
  answer_key: string;
}

export type Quiz = QuizMCQ | QuizShort;

export interface ReadingPack {
  intro: string;
  sections: ReadingSection[];
  vocab: VocabItem[];
  quiz: Quiz[];
}

export interface ReadingStory {
  title: string;
  reading_pack: ReadingPack;
  source?: string;
}

export type Story = BedtimeStory | ReadingStory;

export interface CachedStory {
  key: string;
  story: Story;
  mode: StoryMode;
  timestamp: number;
  params: {
    age: Age;
    topic: Topic;
    minutes: Duration;
  };
}

export interface HistoryItem {
  id: string;
  key: string;
  mode: StoryMode;
  title: string;
  topic: Topic;
  age: Age;
  timestamp: number;
}

// Theme exploration types
export interface SubTheme {
  id: string;
  name: string;
  topics: Topic[];
}

export type ParticleShape = 'atom' | 'pixel' | 'block' | 'drop' | 'crystal';

export interface ThemeDomain {
  id: string;
  name: string;
  icon: string;
  color: string;
  subThemes: SubTheme[];
  // Additional fields for ThemeExplorer visualization
  particleColor?: string;
  particleShape?: ParticleShape;
  hasRing?: boolean;
}

// User authentication types
export interface User {
  id: string;
  username: string;
  displayName: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: number;
  lastLoginAt: number | null;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface AuthUser extends Omit<UserRecord, 'passwordHash'> {}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  displayName?: string;
  role?: 'user' | 'admin';
}

// Storage key with user isolation
export type StorageKey =
  | 'stem_explorer_profile'
  | 'stem_story_history'
  | 'stem_story_cache'
  | 'stem_story_api_count'
  | 'stem_story_api_date';
