export type StoryMode = 'bedtime' | 'reading';

export type Age = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ThemeCategory = 'science' | 'technology' | 'engineering' | 'earth' | 'mathematics';

export type Topic =
  // Science - 科学探索 (7 topics)
  | 'dinosaur'
  | 'solar_system'
  | 'animals'
  | 'insects'
  | 'ocean'
  | 'human_body'
  | 'plants'
  // Technology - 技术发明 (5 topics)
  | 'robot'
  | 'airplane'
  | 'cars_trains'
  | 'programming'
  | 'internet'
  // Engineering - 工程世界 (3 topics)
  | 'architecture'
  | 'machines'
  | 'energy'
  // Earth - 地球奥秘 (3 topics)
  | 'forest'
  | 'mountains'
  | 'weather'
  // Mathematics - 数学思维 (2 topics)
  | 'shapes'
  | 'logic';

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
  timestamp: number;
}

// Theme exploration types
export interface ThemeCategoryInfo {
  id: ThemeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface TopicInfo {
  id: Topic;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Legacy type for SpaceExplorer (kept for backward compatibility)
export interface SubTheme {
  id: string;
  name: string;
  topics: Topic[];
}

export interface ThemeDomain {
  id: string;
  name: string;
  icon: string;
  color: string;
  subThemes: SubTheme[];
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
