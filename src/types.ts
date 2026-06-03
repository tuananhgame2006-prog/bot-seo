export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  tone: 'academic' | 'news' | 'technical' | 'creative';
  maxImages: number;
  maxCharts: number;
  outputFormat: 'html' | 'markdown';
  webhookUrl: string;
  apiSecretKey: string;
  maxTokensPerDay: number;
  consumedTokensToday: number;
  runMode: 'manual' | 'auto';
  cronjobExpr: string;
  geminiApiKey?: string;
  autoPostHour?: number;
  autoPostMinute?: number;
  autoPostDays?: number[];
  timezone?: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  relevance: number; // 0-100
  status: 'pending' | 'drafted' | 'skipped';
  topic: string;
}

export interface ReviewerAttributes {
  readability: number;
  keywordDensity: number;
  wordCountScore: number;
  structure: number;
  metadata: number;
  backlinkPotential: number;
}

export interface Draft {
  id: string;
  keyword: string;
  title: string;
  outline: string[];
  draftHtml: string;
  seoScore: number;
  reviewerNotes: string;
  status: 'pending' | 'reviewed' | 'published';
  attributes: ReviewerAttributes;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  editorFeedback?: string;
  scheduledDate?: string;
  assignedAgent?: string;
}

export interface PublishedPost {
  id: string;
  draftId: string;
  title: string;
  url: string;
  platform: 'WordPress' | 'Webflow' | 'Ghost' | 'Shopify';
  date: string;
  status: 'live' | 'scheduled';
  quality?: string;
  imageCount?: number;
  chartCount?: number;
  tokensConsumed?: number;
  visits?: number;
  likes?: number;
  apeScore?: number;
  articleId?: string;
}

export interface TrajectoryData {
  date: string;
  impressions: number;
  clicks: number;
  position: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: 'Scout' | 'Writer' | 'Reviewer' | 'Publisher' | 'Tracker' | 'System';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PipelineStats {
  keywordsFound: number;
  draftsPending: number;
  postsPublished: number;
  averageSeoScore: number;
  averageApeScore?: number;
}
