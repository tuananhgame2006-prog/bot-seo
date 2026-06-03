import fs from 'fs';
import path from 'path';
import { Keyword, Draft, PublishedPost, TrajectoryData, LogEntry, PipelineStats } from '../src/types';

// Absolute or relative simulated E:\ drive path
const WORKSPACE_DIR = path.resolve(process.cwd(), 'E_drive');
const DB_FILE = path.join(WORKSPACE_DIR, 'seo_midterm.db'); // Written as JSON structure for 100% web container stability

export interface EmailLog {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  bodyHtml: string;
  draftId: string;
  status: 'sent' | 'pending_approval' | 'confirmed' | 'failed';
}

export interface AutomationConfig {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
  daysOfWeek: number[]; // 1=Mon, 3=Wed, 5=Fri, 0=Sun
  targetEmail: string;
}

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

export interface DBState {
  keywords: Keyword[];
  drafts: Draft[];
  published: PublishedPost[];
  trajectory: TrajectoryData[];
  logs: LogEntry[];
  emails?: EmailLog[];
  automationConfig?: AutomationConfig;
  settings?: AppSettings;
}

const DEFAULT_TRAJECTORY = (): TrajectoryData[] => {
  const data: TrajectoryData[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  
  for (let i = 0; i <= 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    data.push({
      date: d.toISOString().split('T')[0],
      impressions: 0,
      clicks: 0,
      position: 0,
    });
  }
  return data;
};

const DEFAULT_SETTINGS = (): AppSettings => ({
  theme: 'light',
  language: 'vi',
  fontSize: 'medium',
  tone: 'technical',
  maxImages: 2,
  maxCharts: 1,
  outputFormat: 'html',
  webhookUrl: 'https://ais-dev-sah4nwq3qwatpxzx6nolx5-233475127323.asia-southeast1.run.app/api/bot-publish',
  apiSecretKey: 'cms_secret_9988',
  maxTokensPerDay: 5000000,
  consumedTokensToday: 0,
  runMode: 'manual',
  cronjobExpr: '0 6 * * 1,3,5',
  geminiApiKey: '',
  autoPostHour: 6,
  autoPostMinute: 0,
  autoPostDays: [1, 3, 5],
  timezone: 'GMT+7'
});

const DEFAULT_STATE: DBState = {
  keywords: [],
  drafts: [],
  published: [],
  trajectory: DEFAULT_TRAJECTORY(),
  emails: [],
  automationConfig: {
    enabled: true,
    hour: 6,
    minute: 0,
    daysOfWeek: [1, 3, 5, 0], // Monday (2), Wednesday (4), Friday (6), Sunday (CN/8)
    targetEmail: 'tuananhgame2006@gmail.com'
  },
  settings: DEFAULT_SETTINGS(),
  logs: [
    {
      id: "log-init",
      timestamp: new Date().toISOString(),
      agent: "System",
      message: "Agent SEO Command Center database initialized in E:\\ workspace.",
      type: "success"
    }
  ]
};

class Database {
  private state: DBState = { ...DEFAULT_STATE };

  constructor() {
    this.ensureWorkspace();
    this.load();
  }

  private ensureWorkspace() {
    try {
      if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
      }
      // Also establish standard E:\ mock workspace in current directory to bypass absolute path locks
      const rootEDrive = path.resolve(process.cwd(), 'E:');
      if (!fs.existsSync(rootEDrive)) {
        fs.mkdirSync(rootEDrive, { recursive: true });
        // Sim link or complementary mock db file inside E:
        fs.writeFileSync(path.join(rootEDrive, 'seo_midterm.db'), JSON.stringify(DEFAULT_STATE, null, 2));
      }
    } catch (err) {
      console.error('Error creating simulated E:\\ drive workspace:', err);
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        // Clean out simulated items as requested to start with clean boards
        this.state.keywords = [];
        this.state.drafts = [];
        this.state.published = [];
        this.state.emails = [];
        
        // Normalize trajectory dates if empty
        if (!this.state.trajectory || this.state.trajectory.length === 0) {
          this.state.trajectory = DEFAULT_TRAJECTORY();
        }
        if (!this.state.emails) {
          this.state.emails = [];
        }
        if (!this.state.automationConfig) {
          this.state.automationConfig = { ...DEFAULT_STATE.automationConfig! };
        }
        if (!this.state.settings) {
          this.state.settings = DEFAULT_SETTINGS();
        } else if (this.state.settings.webhookUrl && this.state.settings.webhookUrl.includes('/api/published-hook')) {
          this.state.settings.webhookUrl = this.state.settings.webhookUrl.replace('/api/published-hook', '/api/bot-publish');
        }
        // Save clean slate
        this.save();
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to load seo_midterm.db content, starting fresh:', err);
      this.state = { ...DEFAULT_STATE };
      this.save();
    }
  }

  private save() {
    try {
      this.ensureWorkspace();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2));
      
      // Also sync to literal 'E:\seo_midterm.db' folder mock
      const rootEDriveFile = path.resolve(process.cwd(), 'E:/seo_midterm.db');
      fs.writeFileSync(rootEDriveFile, JSON.stringify(this.state, null, 2));
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  public getKeywords(): Keyword[] {
    return this.state.keywords;
  }

  public addKeywords(keywords: Keyword[]) {
    this.state.keywords.push(...keywords);
    this.save();
  }

  public getDrafts(): Draft[] {
    return this.state.drafts;
  }

  public addDraft(draft: Draft) {
    // If overwrite exists
    const idx = this.state.drafts.findIndex(d => d.id === draft.id);
    if (idx !== -1) {
      this.state.drafts[idx] = draft;
    } else {
      this.state.drafts.push(draft);
    }
    // Update keyword status
    const kw = this.state.keywords.find(k => k.keyword.toLowerCase() === draft.keyword?.toLowerCase());
    if (kw) {
      kw.status = 'drafted';
    }
    this.save();
  }

  public getPublished(): PublishedPost[] {
    return this.state.published;
  }

  public addPublished(post: PublishedPost) {
    const idx = this.state.published.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      this.state.published[idx] = post;
    } else {
      this.state.published.push(post);
    }
    // Update draft status
    const draft = this.state.drafts.find(d => d.id === post.draftId);
    if (draft) {
      draft.status = 'published';
    }
    this.save();
  }

  public getTrajectory(): TrajectoryData[] {
    return this.state.trajectory;
  }

  public updateTrajectory(data: TrajectoryData[]) {
    this.state.trajectory = data;
    this.save();
  }

  public getLogs(): LogEntry[] {
    return this.state.logs;
  }

  public addLog(agent: LogEntry['agent'], message: string, type: LogEntry['type'] = 'info') {
    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      agent,
      message,
      type,
    };
    this.state.logs.push(log);
    // Print to stdout as well to support standard logs intercept
    console.log(`[${agent.toUpperCase()}] ${message}`);
    this.save();
  }

  public getPipelineMetrics(): PipelineStats {
    const kwCount = this.state.keywords.length;
    const pendingDrafts = this.state.drafts.filter(d => d.status !== 'published').length;
    const postsPublished = this.state.published.length;
    
    // Average SEO score from all draft reviews
    const reviewsWithScore = this.state.drafts.filter(d => d.seoScore > 0);
    const avgScore = reviewsWithScore.length > 0 
      ? Math.round(reviewsWithScore.reduce((sum, d) => sum + d.seoScore, 0) / reviewsWithScore.length)
      : 0;

    // Average APE Score
    const published = this.state.published || [];
    const avgApe = published.length > 0
      ? Number((published.reduce((sum, p) => sum + (p.apeScore || 0), 0) / published.length).toFixed(2))
      : 0;

    return {
      keywordsFound: kwCount,
      draftsPending: pendingDrafts,
      postsPublished,
      averageSeoScore: avgScore,
      averageApeScore: avgApe,
    };
  }

  public getEmails(): EmailLog[] {
    return this.state.emails || [];
  }

  public addEmail(email: EmailLog) {
    if (!this.state.emails) this.state.emails = [];
    this.state.emails.push(email);
    this.save();
  }

  public updateEmailStatus(emailId: string, status: EmailLog['status']) {
    if (!this.state.emails) return;
    const email = this.state.emails.find(e => e.id === emailId);
    if (email) {
      email.status = status;
      this.save();
    }
  }

  public getAutomationConfig(): AutomationConfig {
    return this.state.automationConfig || {
      enabled: true,
      hour: 6,
      minute: 0,
      daysOfWeek: [1, 3, 5, 0],
      targetEmail: 'tuananhgame2006@gmail.com'
    };
  }

  public updateAutomationConfig(config: Partial<AutomationConfig>) {
    if (!this.state.automationConfig) {
      this.state.automationConfig = {
        enabled: true,
        hour: 6,
        minute: 0,
        daysOfWeek: [1, 3, 5, 0],
        targetEmail: 'tuananhgame2006@gmail.com'
      };
    }
    this.state.automationConfig = {
      ...this.state.automationConfig,
      ...config
    };

    // Sync back to settings
    if (!this.state.settings) {
      this.state.settings = DEFAULT_SETTINGS();
    }
    if (this.state.automationConfig.enabled !== undefined) {
      this.state.settings.runMode = this.state.automationConfig.enabled ? 'auto' : 'manual';
    }
    if (this.state.automationConfig.hour !== undefined) {
      this.state.settings.autoPostHour = this.state.automationConfig.hour;
    }
    if (this.state.automationConfig.minute !== undefined) {
      this.state.settings.autoPostMinute = this.state.automationConfig.minute;
    }
    if (this.state.automationConfig.daysOfWeek !== undefined) {
      this.state.settings.autoPostDays = this.state.automationConfig.daysOfWeek;
    }

    this.save();
  }

  public getSettings(): AppSettings {
    if (!this.state.settings) {
      this.state.settings = DEFAULT_SETTINGS();
    }
    return this.state.settings;
  }

  public updateSettings(config: Partial<AppSettings>) {
    if (!this.state.settings) {
      this.state.settings = DEFAULT_SETTINGS();
    }
    this.state.settings = {
      ...this.state.settings,
      ...config
    };
    
    // Sync to automationConfig for scheduler compatibility
    if (!this.state.automationConfig) {
      this.state.automationConfig = {
        enabled: false,
        hour: 6,
        minute: 0,
        daysOfWeek: [1, 3, 5],
        targetEmail: 'tuananhgame2006@gmail.com'
      };
    }
    
    if (this.state.settings.runMode !== undefined) {
      this.state.automationConfig.enabled = (this.state.settings.runMode === 'auto');
    }
    if (this.state.settings.autoPostHour !== undefined) {
      this.state.automationConfig.hour = this.state.settings.autoPostHour;
    }
    if (this.state.settings.autoPostMinute !== undefined) {
      this.state.automationConfig.minute = this.state.settings.autoPostMinute;
    }
    if (this.state.settings.autoPostDays !== undefined) {
      this.state.automationConfig.daysOfWeek = this.state.settings.autoPostDays;
    }

    this.save();
  }

  public reset() {
    this.state = {
      keywords: [],
      drafts: [],
      published: [],
      trajectory: DEFAULT_TRAJECTORY(),
      settings: this.state.settings || DEFAULT_SETTINGS(),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent: "System",
          message: "Database system reset. Starting fresh pipeline sequences in E:\\ workspace.",
          type: "info"
        }
      ]
    };
    this.save();
  }
}

export const db = new Database();
