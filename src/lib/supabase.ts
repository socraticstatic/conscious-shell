import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type Project = {
  id: string;
  title: string;
  role: string;
  client: string;
  summary: string;
  tags: string[];
  image_url: string;
  year: string;
  order_index: number;
  featured: boolean;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  order_index: number;
};

export type Award = {
  id: string;
  title: string;
  organization: string;
  year: string;
  order_index: number;
};

export type Publication = {
  id: string;
  title: string;
  kind: string;
  url?: string | null;
  order_index: number;
};

export type ArchiveCapture = {
  id: string;
  year: number;
  timestamp_raw: string;
  captured_at: string;
  original_url: string;
  wayback_url: string;
  embed_url: string;
  era_label: string;
  order_index: number;
  screenshot_url: string;
  custom_screenshot_url: string;
};

export type VkQuestion = {
  id: string;
  prompt: string;
  prompt_jp: string;
  category: string;
  order_index: number;
};

export type GithubProject = {
  id: string;
  repo_owner: string;
  repo_name: string;
  repo_url: string;
  pages_url: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  stars: number;
  language: string;
  thumbnail_url: string;
  featured: boolean;
  sort_order: number;
};

export type EsperHotspot = {
  id: string;
  photo_url: string;
  photo_caption: string;
  x: number;
  y: number;
  w: number;
  h: number;
  track_cmd: string;
  enhance_cmd: string;
  reveal: string;
  order_index: number;
  photo_credit: string;
};

export type WebDossierFact = {
  id: string;
  category: string;
  text: string;
  source_label: string;
  source_url: string;
  weight: number;
  order_index: number;
  created_at: string;
};

export type DesignRound = {
  id: string;
  round_number: number;
  agent: 'scifi' | 'goth' | string;
  title: string;
  palette: string[];
  motif: string;
  material: string;
  typography: string;
  critique: string;
  score: number;
  created_at: string;
};

export type SkylineSign = {
  id: string;
  text: string;
  tone: 'neon' | 'siren' | 'ember' | 'cyan' | string;
  order_index: number;
};

export type Noir = {
  id: string;
  line: string;
  mood: string;
  order_index: number;
};

export type Haiku = {
  id: string;
  line1: string;
  line2: string;
  line3: string;
  source: string;
  mood: string;
  order_index: number;
};

export type Trivia = {
  id: string;
  category: string;
  label: string;
  value: string;
  glyph: string;
  order_index: number;
};

export type LogRow = {
  id: string;
  level: LogLevel;
  message: string;
  details: Record<string, unknown>;
  source: string;
  url: string;
  user_agent: string;
  session_id: string;
  created_at: string;
};
