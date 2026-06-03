import React, { useEffect, useState, useRef } from 'react';
import { 
  Grid, 
  PieChart, 
  TrendingUp, 
  FileText, 
  RefreshCw,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Database,
  Settings,
  Sliders,
  X,
  AlertTriangle,
  Wifi,
  Battery,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Laptop,
  Activity,
  Globe
} from 'lucide-react';
import { 
  Keyword, 
  Draft, 
  PublishedPost, 
  TrajectoryData, 
  LogEntry, 
  PipelineStats 
} from './types';

// Import modular premium enterprise components
import Sidebar from './components/Sidebar';
import MetricsBoard from './components/MetricsBoard';
import PipelineViewer from './components/PipelineViewer';
import QARadar from './components/QARadar';
import HTMLPreviewer from './components/HTMLPreviewer';
import TerminalLog from './components/TerminalLog';
import SchedulerAndApprovals from './components/SchedulerAndApprovals';

export default function App() {
  // Input seed state
  const [seedTopic, setSeedTopic] = useState('tự động hóa nội dung trí tuệ nhân tạo');
  const [activeTab, setActiveTab] = useState(0); // 0: Pipeline, 1: QA Radar, 2: Preview, 3: Automation
  
  // Custom API key states
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaveMsg, setApiKeySaveMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Scheduler and Automation state
  const [automationConfig, setAutomationConfig] = useState<any>({
    enabled: true,
    hour: 6,
    minute: 0,
    daysOfWeek: [1, 3, 5, 0],
    targetEmail: 'tuananhgame2006@gmail.com'
  });
  const [emails, setEmails] = useState<any[]>([]);

  // Pipeline database lists
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [published, setPublished] = useState<PublishedPost[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    keywordsFound: 0,
    draftsPending: 0,
    postsPublished: 0,
    averageSeoScore: 0,
  });

  // UI status flags
  const [isLoading, setIsLoading] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [activePreviewMode, setActivePreviewMode] = useState<'interactive' | 'source'>('interactive');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-scroll ref
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Enterprise Glassmorphic Settings States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'ui' | 'output' | 'automation'>('ui');
  const [showSettingsApiKey, setShowSettingsApiKey] = useState(false);
  const [settings, setSettings] = useState<any>({
    theme: 'light',
    language: 'vi',
    fontSize: 'medium',
    tone: 'news',
    maxImages: 4,
    maxCharts: 2,
    outputFormat: 'html',
    webhookUrl: '',
    apiSecretKey: '',
    maxTokensPerDay: 500000,
    consumedTokensToday: 0,
    runMode: 'manual',
    cronjobExpr: '0 6 * * 1,3,5',
    geminiApiKey: '',
    autoPostHour: 6,
    autoPostMinute: 0,
    autoPostDays: [1, 3, 5]
  });

  // Premium App Simulator Interactive states
  const [isAppSimulatorMode, setIsAppSimulatorMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return true; // Force-activate desktop layout when packaged as Electron
    }
    const saved = localStorage.getItem('is_app_simulator_mode');
    return saved !== null ? saved === 'true' : true; // Default to simulating high-end native application
  });
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [latencySim, setLatencySim] = useState<number>(24);
  const [batteryLevel, setBatteryLevel] = useState<number>(98);

  const toggleAppSimulatorMode = () => {
    // If running in true Electron, do not toggle back into web container since we are natively frameless!
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return;
    }
    const nextVal = !isAppSimulatorMode;
    setIsAppSimulatorMode(nextVal);
    localStorage.setItem('is_app_simulator_mode', String(nextVal));
  };

  const handleMinimize = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.minimize();
    } else {
      toggleAppSimulatorMode(); // fallback
    }
  };

  const handleMaximize = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.maximize();
    } else {
      toggleAppSimulatorMode(); // fallback
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.close();
    } else {
      toggleAppSimulatorMode(); // fallback
    }
  };

  // Live ticking clock & network latency simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    const latTimer = setInterval(() => {
      setLatencySim(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return Math.max(12, Math.min(48, next));
      });
    }, 4000);

    // Simulated battery discharging/charging
    const batTimer = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev <= 15) return 99; // full charge cycle
        return prev - 1;
      });
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(latTimer);
      clearInterval(batTimer);
    };
  }, []);

  // Sync index on first mount
  useEffect(() => {
    fetchPipelineData();
  }, []);

  // Smooth scroll for log streamer updates
  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const fetchPipelineData = async () => {
    try {
      const res = await fetch('/api/pipeline');
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords || []);
        setDrafts(data.drafts || []);
        setPublished(data.published || []);
        setTrajectory(data.trajectory || []);
        setLogs(data.logs || []);
        setHasEnvKey(!!data.hasEnvKey);
        setStats(data.metrics || {
          keywordsFound: 0,
          draftsPending: 0,
          postsPublished: 0,
          averageSeoScore: 0,
          averageApeScore: 0,
        });

        // Set default dynamic selected draft
        if (data.drafts && data.drafts.length > 0 && !selectedDraftId) {
          setSelectedDraftId(data.drafts[data.drafts.length - 1].id);
        }
      }

      // Sync settings
      const resS = await fetch('/api/settings');
      if (resS.ok) {
        const valS = await resS.json();
        setSettings(valS);
        // Sync custom root theme element class
        if (valS.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Sync automation config and emails list
      const resA = await fetch('/api/automation');
      if (resA.ok) {
        const configVal = await resA.json();
        setAutomationConfig(configVal);
      }
      const resE = await fetch('/api/emails');
      if (resE.ok) {
        const emailsVal = await resE.json();
        setEmails(emailsVal);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu từ máy chủ API:', err);
    }
  };

  const saveSettings = async (updatedSettings: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        if (data.settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình Hệ thống Trạm:', err);
    }
  };

  const updateAutomationConfig = async (newConfig: any) => {
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình hẹn giờ:', err);
    }
  };

  const syncAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/sync-analytics', { method: 'POST' });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi đồng bộ thống kê CMS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRunAutomationJob = async () => {
    try {
      const res = await fetch('/api/automation/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceHostUrl: window.location.origin
        })
      });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi khi kích hoạt chạy thử hẹn giờ:', err);
    }
  };

  const approveDraftFromEmailLog = async (draftId: string) => {
    try {
      const res = await fetch(`/api/confirm-publish?draftId=${draftId}`);
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi phê duyệt bài viết:', err);
    }
  };

  const runStage = async (stageNum: number, forceKeywordId?: string, forceDraftId?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setActiveStage(stageNum);

    let bodyPayload: any = { stage: stageNum };
    if (stageNum === 1) {
      bodyPayload.seedTopic = seedTopic;
    } else if (stageNum === 2) {
      bodyPayload.keywordId = forceKeywordId || undefined;
    } else if (stageNum === 3) {
      bodyPayload.draftId = forceDraftId || undefined;
    } else if (stageNum === 4) {
      bodyPayload.draftId = forceDraftId || undefined;
    }

    try {
      const res = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey
        },
        body: JSON.stringify(bodyPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error('Xử lý Giai đoạn lỗi:', result.error);
      } else {
        // Auto routing helpful visual layout tab
        if (stageNum === 1) {
          setActiveTab(0); // See keywords list
        } else if (stageNum === 2) {
          if (result.draft) {
            setSelectedDraftId(result.draft.id);
          }
          setActiveTab(1); // Inspect newly drafted HTML Content (was 3)
        } else if (stageNum === 3) {
          if (result.draft) {
            setSelectedDraftId(result.draft.id);
          }
          setActiveTab(1); // Inspect HTML content
        } else if (stageNum === 4) {
          setActiveTab(2); // View Scheduler & Ranking Board (was 0)
        } else if (stageNum === 5) {
          setActiveTab(2); // View Scheduler & Ranking Board (was 2)
        }
      }
    } catch (err) {
      console.error('Lỗi mạng truyền tải tác vụ:', err);
    } finally {
      setIsLoading(false);
      setActiveStage(null);
      await fetchPipelineData();
    }
  };

  const runAutopilotPipeline = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // 1. Phân tích Từ khóa
      setActiveStage(1);
      setActiveTab(0); // Switch to Pipeline Viewer tab
      
      const res1 = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey
        },
        body: JSON.stringify({ stage: 1, seedTopic: seedTopic }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || 'Lỗi chạy giai đoạn 1');
      await fetchPipelineData();
      
      // Select the first generated keyword
      const finalKeywords = data1.keywords || [];
      const targetKW = finalKeywords[0];
      if (!targetKW) throw new Error('Không phân tích được từ khóa nào từ chủ đề chủ đạo.');
      
      // 2. Biên soạn Nội dung
      setActiveStage(2);
      const res2 = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey
        },
        body: JSON.stringify({ stage: 2, keywordId: targetKW.id }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || 'Lỗi chạy giai đoạn 2');
      
      const targetDraft = data2.draft;
      if (!targetDraft) throw new Error('Không tạo được bài viết nháp.');
      
      setSelectedDraftId(targetDraft.id);
      setActiveTab(1); // Switch to content preview tab
      await fetchPipelineData();
      
      // 3. Đánh giá SEO
      setActiveStage(3);
      const res3 = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey
        },
        body: JSON.stringify({ stage: 3, draftId: targetDraft.id }),
      });
      const data3 = await res3.json();
      if (!res3.ok) throw new Error(data3.error || 'Lỗi chạy giai đoạn 3');
      
      setActiveTab(1); // Switch to HTML preview
      await fetchPipelineData();
      
      // Auto-approve the draft so Stage 4 can publish without manual validation
      const approveRes = await fetch('/api/pipeline/update-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draftId: targetDraft.id,
          approvalStatus: 'approved',
          editorFeedback: 'Đã phê duyệt tự động hoàn toàn bởi chuỗi Autopilot Swarm.'
        }),
      });
      if (approveRes.ok) {
        await fetchPipelineData();
      }
      
      // 4. Xuất bản Hệ thống
      setActiveStage(4);
      const res4 = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey
        },
        body: JSON.stringify({ stage: 4, draftId: targetDraft.id }),
      });
      const data4 = await res4.json();
      if (!res4.ok) throw new Error(data4.error || 'Lỗi chạy giai đoạn 4');
      
      setActiveTab(2); // View Scheduler & Ranking Board
      await fetchPipelineData();
      
    } catch (err: any) {
      console.error('Lỗi quy trình Autopilot:', err);
      alert(`Gặp vấn đề trong quy trình tự động hóa: ${err.message}`);
    } finally {
      setIsLoading(false);
      setActiveStage(null);
      await fetchPipelineData();
    }
  };

  const resetDatabase = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ Dữ liệu Tiến trình và lịch sử GSC trong SQLite không?')) {
      try {
        const res = await fetch('/api/pipeline/reset', { method: 'POST' });
        if (res.ok) {
          setSelectedDraftId('');
          await fetchPipelineData();
        }
      } catch (err) {
        console.error('Lỗi khi thiết lập lại CSDL:', err);
      }
    }
  };

  const updateDraft = async (payload: {
    draftId: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    editorFeedback?: string;
    scheduledDate?: string;
    assignedAgent?: string;
  }) => {
    try {
      const res = await fetch('/api/pipeline/update-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin bài viết:', err);
    }
  };

  const activeDraft = drafts.find(d => d.id === selectedDraftId) || drafts[drafts.length - 1];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredLogs = logs.filter(entry => {
    if (logFilter === 'all') return true;
    return entry.agent.toLowerCase() === logFilter.toLowerCase();
  });

  // Radar helper functions
  const getRadarSVGCoordinates = (attrs: any) => {
    if (!attrs) return '';
    const metricsMap = [
      attrs.readability || 0,
      attrs.keywordDensity || 0,
      attrs.wordCountScore || 0,
      attrs.structure || 0,
      attrs.metadata || 0,
      attrs.backlinkPotential || 0
    ];

    const centerX = 190;
    const centerY = 190;
    const maxRadius = 115;

    const coordinates = metricsMap.map((val, i) => {
      const angle = i * (Math.PI / 3) - Math.PI / 2;
      const radius = (val / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    });

    return coordinates.join(' ');
  };

  // Trajectory Math Helpers
  const maxImpressions = Math.max(...trajectory.map(t => t.impressions), 5000);
  const maxClicks = Math.max(...trajectory.map(t => t.clicks), 300);

  const getImpressionsSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 200 - (t.impressions / maxImpressions) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const getClicksSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 200 - (t.clicks / maxClicks) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const getPositionSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 50 + ((t.position - 1) / 99) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const isActuallyElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  return (
    <div className={`w-full h-screen font-sans overflow-hidden transition-all duration-500 ${
      isAppSimulatorMode 
        ? `${isActuallyElectron ? 'p-0' : 'p-4 lg:p-6'} bg-[#0f111a] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d1f30] via-[#0b0c13] to-[#040508] relative selection:bg-blue-600/30 selection:text-white` 
        : 'bg-slate-100 text-slate-800 selection:bg-blue-200/50 selection:text-slate-900'
    }`}>

      {isAppSimulatorMode && !isActuallyElectron && (
        <>
          {/* Windows 11 Desktop Ambient Wallpapers blurring glows - Only show on Web Simulator */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#2563eb]/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#4f46e5]/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          {/* Floating Workspace OS Information label */}
          <div className="absolute top-4.5 left-6 flex items-center gap-3 z-40 select-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">WORKSPACE CHẠY:</span>
            <span className="px-2.5 py-0.5 bg-slate-900/80 text-blue-400 rounded text-[9px] font-bold border border-slate-800/80 font-mono flex items-center gap-1">
              <Laptop className="w-3 h-3 text-slate-400" />
              Windows 11 Pro x64 Enterprise 
            </span>
          </div>
        </>
      )}

      {/* Main Container - Windows Mockup or Fullscreen view */}
      <div className={`transition-all duration-300 flex flex-col ${
        isAppSimulatorMode 
          ? `w-full h-full ${isActuallyElectron ? 'max-w-full max-h-full rounded-none border-none' : 'max-w-[1580px] max-h-[960px] rounded-xl border border-slate-700/80 shadow-[0_30px_80px_rgba(0,0,0,0.85)]'} bg-white overflow-hidden relative` 
          : 'w-full h-full flex flex-col'
      }`}>

        {/* Windows 11 Title Bar header structure */}
        {isAppSimulatorMode && (
          <div className="bg-[#181a26] text-slate-200 h-10 px-4 flex items-center justify-between text-xs select-none border-b border-[#2a2c3d] shrink-0 font-sans app-region-drag">
            {/* Left: Window title and small icon */}
            <div className="flex items-center gap-2.5 min-w-0 app-region-no-drag">
              <div className="w-4.5 h-4.5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-extrabold shadow-sm shadow-blue-500/20 select-none">
                S
              </div>
              <span className="font-semibold text-[11.5px] text-slate-200 tracking-wide truncate">
                Swarm SEO Optimizer Client (v3.0.1) — Windows Desktop Agent
              </span>
              <span className="px-1.5 py-0.2 bg-[#2d3149] text-blue-300 text-[8px] font-extrabold rounded uppercase tracking-wider scale-90 border border-blue-500/25">
                {isActuallyElectron ? 'NATIVE WINDOW' : 'Local Host'}
              </span>
            </div>

            {/* Center: Window search or status bar element */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-[#202334] text-slate-400 rounded-lg w-72 justify-between border border-[#2d3149] text-[11px] app-region-no-drag">
              <span className="text-[10px] font-mono tracking-wider font-semibold">CỔNG DỮ LIỆU: SEO_SWARM_LOGS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Right: Windows Controls block with Minimize, Maximize, Close icons */}
            <div className="flex items-center h-full app-region-no-drag">
              {/* Simulator Indicator widgets */}
              <div className="flex items-center gap-3 mr-4 pr-4 border-r border-[#2a2c3d] text-[10.5px] font-mono text-slate-400 font-bold">
                <span className="flex items-center gap-1.5" title="Laptop Network Latency">
                  <Wifi className="w-3.5 h-3.5 text-blue-400" />
                  <span>Win11 Wi-Fi ({latencySim} ms)</span>
                </span>
                <span className="text-slate-700 select-none">|</span>
                <span className="flex items-center gap-1.5" title="Laptop Battery status">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{batteryLevel}%</span>
                </span>
              </div>

              {/* Windows 11 Standard Window controls */}
              <button 
                onClick={handleMinimize}
                className="w-11 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202334] transition-colors cursor-pointer"
                title={isActuallyElectron ? "Minimize (Thu nhỏ)" : "Chuyển giao diện"}
              >
                <span className="text-[14px]">━</span>
              </button>
              
              <button 
                onClick={handleMaximize}
                className="w-11 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202334] transition-colors cursor-pointer"
                title={isActuallyElectron ? "Maximize (Phóng to / Thu nhỏ)" : "Toàn màn hình Web"}
              >
                <div className="w-[9.5px] h-[9.5px] border-[1.5px] border-slate-400 rounded-[1px] hover:border-white" />
              </button>
              
              <button 
                onClick={handleClose}
                className="w-12 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer group"
                title={isActuallyElectron ? "Đóng ứng dụng" : "Thoát giả lập"}
              >
                <span className="text-[14px] font-light leading-none">✕</span>
              </button>
            </div>
          </div>
        )}

        {/* Windows OS Sub-Bar Header - App Menu line representation */}
        {isAppSimulatorMode && (
          <div className="bg-[#1f2233] text-slate-300 h-8 px-4 flex items-center justify-between text-[11px] font-sans border-b border-[#2e3146] select-none shrink-0">
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <span className="text-slate-200 hover:text-white cursor-pointer transition-colors font-bold px-1 py-0.5">Tệp Tin (File)</span>
              <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5">Cấu Hình (Edit)</span>
              <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5">Hệ Thống (System)</span>
              <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5">Nhật Ký (Logs)</span>
              <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5">Trợ Giúp (Help)</span>
            </div>
            
            <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
              <span className="text-slate-400 font-semibold uppercase">⏰ GIỜ WINDOWS:</span>
              <span className="text-indigo-300 font-bold tracking-widest bg-[#151724] px-2 py-0.5 rounded border border-[#2c2f45]">
                {systemTime.toLocaleTimeString('vi-VN')}
              </span>
              <span className="text-slate-500 font-semibold">ICT</span>
            </div>
          </div>
        )}

        {/* Inner App contents window framework */}
        <div className="flex flex-1 overflow-hidden h-full w-full min-h-0 bg-slate-50 text-slate-800">

          {/* Sidebar navigation */}
      <Sidebar 
        seedTopic={seedTopic}
        setSeedTopic={setSeedTopic}
        isLoading={isLoading}
        activeStage={activeStage}
        keywords={keywords}
        drafts={drafts}
        published={published}
        trajectory={trajectory}
        runStage={runStage}
        resetDatabase={resetDatabase}
        onRunAutopilot={runAutopilotPipeline}
      />

      {/* Main Container Area */}
      <main className="flex-grow flex flex-col justify-between overflow-hidden min-w-0 bg-slate-50">

        {/* Header toolbar panel */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/10">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">Agent SEO — Command Control Room</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">API:</span>
                  {geminiApiKey.trim() !== '' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Khóa Tùy chọn (UI)
                    </span>
                  ) : hasEnvKey ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Khóa Hệ thống (Env)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Chưa có API Key
                    </span>
                  )}
                </span>

                <span className="text-slate-300">|</span>

                <span className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chế độ vận hành:</span>
                  {settings.runMode === 'auto' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Tự động (Cronjob {settings.cronjobExpr})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Thủ công (Manual Drafts)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick launch settings button inside header too */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Mở Cấu hình</span>
            </button>
          </div>
        </div>

        {/* Counter cards board */}
        <MetricsBoard stats={stats} published={published} />

        {/* Dynamic workspace container */}
        <div className="flex-1 px-5 py-4 flex flex-col min-h-0 container mx-auto max-w-7xl">
          
          {/* Tab Selection Header Bar */}
          <div className="flex space-x-1 border-b border-slate-200 shrink-0 mb-4">
            <button 
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 0 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Phân tích Từ khóa & Tiến trình</span>
            </button>

            <button 
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 1 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem trước bản thảo</span>
            </button>

            <button 
              onClick={() => setActiveTab(2)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 2 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tự động 6h & Phê duyệt</span>
            </button>

            {isLoading && (
              <div className="ml-auto px-3 py-1 self-center text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 animate-pulse font-bold">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-650" />
                <span>Swarm Đang Thực Thi</span>
              </div>
            )}
          </div>

          {/* Tab content Router renders with overflow-y scroll */}
          <div className="flex-grow py-1 min-h-0 overflow-y-auto w-full">
            {activeTab === 0 && (
              <PipelineViewer 
                keywords={keywords}
                drafts={drafts}
                published={published}
                isLoading={isLoading}
                runStage={runStage}
                setSelectedDraftId={setSelectedDraftId}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 1 && (
              <HTMLPreviewer 
                drafts={drafts}
                selectedDraftId={selectedDraftId}
                setSelectedDraftId={setSelectedDraftId}
                activeDraft={activeDraft}
                activePreviewMode={activePreviewMode}
                setActivePreviewMode={setActivePreviewMode}
                copyToClipboard={copyToClipboard}
                copySuccess={copySuccess}
                onImageGenerated={fetchPipelineData}
              />
            )}

            {activeTab === 2 && (
              <SchedulerAndApprovals 
                config={automationConfig}
                emails={emails}
                isLoading={isLoading}
                onUpdateConfig={updateAutomationConfig}
                onForceRun={forceRunAutomationJob}
                onApproveEmails={approveDraftFromEmailLog}
                published={published}
                onSyncAnalytics={syncAnalyticsData}
              />
            )}
          </div>

          {/* Sequential pipelines standard workflow brief caption info */}
          <div className="border-t border-slate-200 pt-3 mt-3.5 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-400 gap-1.5 shrink-0 font-sans font-semibold">
            <span>TOÀN BỘ CHU TRÌNH TỰ ĐỘNG KHÉP KÍN VIP</span>
            <span className="text-blue-600 font-bold uppercase tracking-wider">
              Chuỗi phối hợp Swarm: Phân tích keyword → Viết bài tự động 6h 2,4,6,8 → Chấm điểm SEO → Check mail xác nhận → Tự xuất bản bài viết lên web
            </span>
          </div>

        </div>

        {/* Real-time system console logs layout */}
        <TerminalLog 
          logs={logs}
          filteredLogs={filteredLogs}
          logFilter={logFilter}
          setLogFilter={setLogFilter}
          logTerminalEndRef={logTerminalEndRef}
        />

      </main>

        </div> {/* closes inner App contents window framework */}
      </div> {/* closes Main Hardware mockup client or Fullscreen container */}

      {/* MODAL SETTINGS PRESTIGE GLASSMORPHISM */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="px-6 py-4.5 border-b border-slate-200/50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-600 animate-spin-slow" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Cấu hình Hệ thống — Agent SEO Enterprise</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Điều chỉnh các tham số tự động hóa & AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="flex border-b border-slate-200/50 bg-slate-50/20 px-6 gap-4">
              <button
                onClick={() => setActiveSettingsTab('ui')}
                className={`py-3 text-xs font-bold transition-all border-b-2 px-1 focus:outline-none cursor-pointer ${
                  activeSettingsTab === 'ui'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                🖥️ Tab 1 - Giao diện (UI)
              </button>
              <button
                onClick={() => setActiveSettingsTab('output')}
                className={`py-3 text-xs font-bold transition-all border-b-2 px-1 focus:outline-none cursor-pointer ${
                  activeSettingsTab === 'output'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📐 Tab 2 - Chuẩn hóa Đầu ra (Outputs)
              </button>
              <button
                onClick={() => setActiveSettingsTab('automation')}
                className={`py-3 text-xs font-bold transition-all border-b-2 px-1 focus:outline-none cursor-pointer ${
                  activeSettingsTab === 'automation'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                ⚙️ Tab 3 - Kết nối & Tự động hóa
              </button>
            </div>

            {/* Drawer Contents */}
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-5">
              
              {/* TAB 1: UI */}
              {activeSettingsTab === 'ui' && (
                <div className="space-y-4">
                  
                  {/* Sáng/Tối toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Chế độ hiển thị (Light/Dark mode)</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Bảo vệ thị lực trong môi trường làm việc</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, theme: 'light' })}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          settings.theme === 'light' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        Sáng
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, theme: 'dark' })}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          settings.theme === 'dark' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        Tối
                      </button>
                    </div>
                  </div>

                  {/* Ngôn ngữ */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Ngôn ngữ hiển thị</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Sử dụng trong toàn bộ nhãn giao diện</span>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => saveSettings({ ...settings, language: e.target.value })}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  {/* Kích cỡ chữ */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Kích thước chữ</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Tự thu phóng cỡ chữ hiển thị chính</span>
                    </div>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => saveSettings({ ...settings, fontSize: e.target.value })}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="small">Nhỏ (Small)</option>
                      <option value="medium">Vừa (Medium)</option>
                      <option value="large">Lớn (Large)</option>
                    </select>
                  </div>

                </div>
              )}

              {/* TAB 2: OUTPUT STANDARDIZATION */}
              {activeSettingsTab === 'output' && (
                <div className="space-y-4">
                  
                  {/* Tone of voice */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">Văn phong biên tập (Tone)</span>
                      <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px] capitalize font-extrabold">{settings.tone}</span>
                    </div>
                    <select
                      value={settings.tone}
                      onChange={(e) => saveSettings({ ...settings, tone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="academic">🔬 Hàn lâm / Nghiên cứu học thuật (Whitepaper Academic)</option>
                      <option value="news">📰 Báo mạng chuyên nghiệp / Trực quan (Modern Newsroom)</option>
                      <option value="technical">💻 Kỹ thuật thực dụng / Hướng dẫn (Developer Specs)</option>
                      <option value="creative">💎 Sáng tạo nội dung thu hút khách hàng (Creative Copywriter)</option>
                    </select>
                  </div>

                  {/* Max Images Slider */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Số lượng hình ảnh tối đa trong bài viết:</span>
                      <span className="text-blue-600">{settings.maxImages} hình ảnh</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.maxImages}
                      onChange={(e) => saveSettings({ ...settings, maxImages: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Khuyên dùng: 2-4 ảnh</span>
                      <span>Tối đa: 10 ảnh</span>
                    </div>
                  </div>

                  {/* Max Mermaid charts Slider */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Số lượng biểu đồ trực quan (Mermaid):</span>
                      <span className="text-indigo-600">{settings.maxCharts} biểu đồ</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={settings.maxCharts}
                      onChange={(e) => saveSettings({ ...settings, maxCharts: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Khuyên dùng: 1-2 bảng biểu</span>
                      <span>Tối đa: 5</span>
                    </div>
                  </div>

                  {/* Output format selector */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Định dạng đầu ra CMS</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Bảo đảm thích ứng khớp đồng bộ hệ thống Web</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, outputFormat: 'html' })}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                          settings.outputFormat === 'html'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        HTML Code
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, outputFormat: 'markdown' })}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                          settings.outputFormat === 'markdown'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        Markdown
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: CONNECTIONS AND AUTOMATION */}
              {activeSettingsTab === 'automation' && (
                <div className="space-y-6">
                  
                  {/* PHẦN 1: API CỦA WEB */}
                  <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-205 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌐</span>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mục 1 — Cấu Hình API Của Web (CMS Webhook)</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Bảo đảm thông tin đầu cực Webhook và Token bảo mật đồng bộ với WordPress hoặc Website</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Webhook URL (CMS Receiver)</label>
                        <input
                          type="text"
                          value={settings.webhookUrl || ''}
                          onChange={(e) => saveSettings({ ...settings, webhookUrl: e.target.value })}
                          placeholder="https://my-wordpress.com/api/post-receiver"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">API Secret Key (CMS Token)</label>
                        <input
                          type="password"
                          value={settings.apiSecretKey || ''}
                          onChange={(e) => saveSettings({ ...settings, apiSecretKey: e.target.value })}
                          placeholder="Mã số bí mật nạp CMS..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PHẦN 2: API MÔ HÌNH TƯ DUY */}
                  <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-205 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧠</span>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mục 2 — API Mô Hình Tư Duy (AI Mind Key)</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Khóa API chuyên sâu kích hoạt sức mạnh Agent AI (Gemini) phân tích, lập dàn ý & tạo nội dung</p>
                    <div className="relative flex items-center md:max-w-md pt-1">
                      <input
                        type={showSettingsApiKey ? "text" : "password"}
                        value={settings.geminiApiKey || ''}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          localStorage.setItem('gemini_api_key', newKey);
                          setGeminiApiKey(newKey);
                          saveSettings({ ...settings, geminiApiKey: newKey });
                        }}
                        placeholder="Nhập Gemini API Key (AIzaSy...)"
                        className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSettingsApiKey(!showSettingsApiKey)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                        title={showSettingsApiKey ? "Ẩn khóa" : "Hiện khóa"}
                      >
                        {showSettingsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Run mode switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Chế độ vận hành (Scheduler Mode):</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Bật Tự động để hệ thống đăng bài Robot chuẩn hóa theo lịch đặt giờ</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, runMode: 'manual' })}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          settings.runMode === 'manual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        Thủ công
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSettings({ ...settings, runMode: 'auto' })}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          settings.runMode === 'auto' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        Tự động
                      </button>
                    </div>
                  </div>

                  {/* PHẦN 3: CÀI ĐẶT GIỜ VÀ NGÀY TRONG TUẦN ĐĂNG BÀI TỰ ĐỘNG */}
                  {settings.runMode === 'auto' && (
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200">
                      
                      <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">⏱️</span>
                          <span className="text-[11px] font-extrabold text-indigo-900 uppercase">Cài đặt giờ & ngày trong tuần đăng bài tự động:</span>
                        </div>
                        <span className="text-[9px] font-mono text-indigo-500 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">Automated Robot</span>
                      </div>

                      {/* Dropdowns for Hour and Minute */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">Thời gian đăng bài tự động:</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <select
                                value={settings.autoPostHour !== undefined ? settings.autoPostHour : 6}
                                onChange={(e) => {
                                  const hr = parseInt(e.target.value);
                                  const mn = settings.autoPostMinute !== undefined ? settings.autoPostMinute : 0;
                                  const dys = settings.autoPostDays || [1, 3, 5];
                                  const dysStr = dys.length === 0 ? '*' : [...dys].sort().join(',');
                                  const newCron = `${mn} ${hr} * * ${dysStr}`;
                                  saveSettings({
                                    ...settings,
                                    autoPostHour: hr,
                                    cronjobExpr: newCron
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                              >
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <option key={i} value={i}>{String(i).padStart(2, '0')} giờ</option>
                                ))}
                              </select>
                            </div>
                            <span className="text-indigo-800 font-bold">:</span>
                            <div className="flex-1">
                              <select
                                value={settings.autoPostMinute !== undefined ? settings.autoPostMinute : 0}
                                onChange={(e) => {
                                  const mn = parseInt(e.target.value);
                                  const hr = settings.autoPostHour !== undefined ? settings.autoPostHour : 6;
                                  const dys = settings.autoPostDays || [1, 3, 5];
                                  const dysStr = dys.length === 0 ? '*' : [...dys].sort().join(',');
                                  const newCron = `${mn} ${hr} * * ${dysStr}`;
                                  saveSettings({
                                    ...settings,
                                    autoPostMinute: mn,
                                    cronjobExpr: newCron
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                              >
                                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((val) => (
                                  <option key={val} value={val}>{String(val).padStart(2, '0')} phút</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Giờ đồng bộ & Múi giờ */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">Giờ đồng bộ dữ liệu:</label>
                              <select
                                value={settings.autoPostHour !== undefined ? settings.autoPostHour : 6}
                                onChange={(e) => {
                                  const hr = parseInt(e.target.value);
                                  saveSettings({
                                    ...settings,
                                    autoPostHour: hr
                                  });
                                }}
                                className="w-full bg-white border border-indigo-200/50 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                              >
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">Múi giờ hệ thống:</label>
                              <select
                                value={settings.timezone || 'GMT+7'}
                                onChange={(e) => saveSettings({ ...settings, timezone: e.target.value })}
                                className="w-full bg-white border border-indigo-200/50 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                              >
                                <option value="GMT+7">ICT (GMT+7) - Hà Nội / Bangkok</option>
                                <option value="GMT+0">UTC/GMT (GMT+0) - Giờ quốc tế</option>
                                <option value="GMT+8">SGT (GMT+8) - Singapore / Bắc Kinh</option>
                                <option value="GMT+9">JST (GMT+9) - Tokyo / Seoul</option>
                                <option value="GMT-5">EST (GMT-5) - Mỹ & Canada</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Days of week checkbox checklist */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider font-semibold">Các ngày đăng bài trong tuần:</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Thứ 2', value: 1 },
                            { label: 'Thứ 3', value: 2 },
                            { label: 'Thứ 4', value: 3 },
                            { label: 'Thứ 5', value: 4 },
                            { label: 'Thứ 6', value: 5 },
                            { label: 'Thứ 7', value: 6 },
                            { label: 'C.Nhật', value: 0 }
                          ].map((day) => {
                            const currentDays = settings.autoPostDays || [1, 3, 5];
                            const isChecked = currentDays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  const newDays = isChecked
                                    ? currentDays.filter(d => d !== day.value)
                                    : [...currentDays, day.value];
                                  const sortedDays = [...newDays].sort((a,b) => a - b);
                                  const daysStr = sortedDays.length === 0 ? '*' : sortedDays.join(',');
                                  const hr = settings.autoPostHour !== undefined ? settings.autoPostHour : 6;
                                  const mn = settings.autoPostMinute !== undefined ? settings.autoPostMinute : 0;
                                  const newCron = `${mn} ${hr} * * ${daysStr}`;
                                  saveSettings({
                                    ...settings,
                                    autoPostDays: sortedDays,
                                    cronjobExpr: newCron
                                  });
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                                  isChecked 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                                <span>{day.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dynamic Human-readable interpretation box */}
                      <div className="p-3 bg-indigo-50/90 rounded-xl text-[10px] text-indigo-800 leading-relaxed font-bold border border-indigo-100 flex items-start gap-2">
                        <span>💡</span>
                        <div>
                          <p className="font-extrabold uppercase text-[9px] text-indigo-600 tracking-wider">Diễn giải dịch nghĩa thực tế:</p>
                          <p className="mt-0.5 text-[11px] font-semibold">
                            {(() => {
                              const hr = settings.autoPostHour !== undefined ? settings.autoPostHour : 6;
                              const mn = settings.autoPostMinute !== undefined ? settings.autoPostMinute : 0;
                              const currentDays = settings.autoPostDays || [1, 3, 5];
                              
                              const daysMap: { [key: number]: string } = {
                                1: "Thứ 2",
                                2: "Thứ 3",
                                3: "Thứ 4",
                                4: "Thứ 5",
                                5: "Thứ 6",
                                6: "Thứ 7",
                                0: "Chủ Nhật"
                              };
                              const hrStr = String(hr).padStart(2, '0');
                              const mnStr = String(mn).padStart(2, '0');
                              if (currentDays.length === 7) {
                                return `Auto post xuất bản lúc ${hrStr}:${mnStr} tất cả các ngày trong tuần.`;
                              }
                              if (currentDays.length === 0) {
                                return `Chưa cấu hình ngày đăng (vui lòng chọn ít nhất một ngày trong tuần)`;
                              }
                              const selectedNames = currentDays.sort((a,b) => a-b).map(d => daysMap[d]);
                              return `Auto post xuất bản lúc ${hrStr}:${mnStr} vào mỗi: ${selectedNames.join(', ')}.`;
                            })()}
                          </p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Kill Switch Limits */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span>Cầu dao an toàn (Kill Switch)</span>
                      </div>
                      <p className="text-[10px] text-rose-600/90 leading-relaxed font-semibold">
                        Tự động đóng băng toàn bộ hệ thống Swarm khi số lượng token tiêu thụ chạm ngưỡng giới hạn hằng ngày để tránh phát sinh chi phí ngoài kiểm soát.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-rose-800 uppercase block">Hạn mức Token/ngày:</label>
                      <input
                        type="number"
                        value={settings.maxTokensPerDay}
                        onChange={(e) => saveSettings({ ...settings, maxTokensPerDay: parseInt(e.target.value) || 0 })}
                        className="bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Consumed Tokens Stats */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-605 flex items-center gap-1">
                        <span>📊 Số Token Đã Tiêu Thụ Hôm Nay:</span>
                      </span>
                      <span className="text-indigo-600 font-bold">
                        {settings.consumedTokensToday.toLocaleString()} / {settings.maxTokensPerDay.toLocaleString()} Tokens
                      </span>
                    </div>
                    {/* Progress Bar visualizer */}
                    <div className="w-full bg-slate-250 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          settings.consumedTokensToday >= settings.maxTokensPerDay 
                            ? 'bg-rose-500' 
                            : settings.consumedTokensToday / settings.maxTokensPerDay > 0.8
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, (settings.consumedTokensToday / settings.maxTokensPerDay) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Ước lượng: {Math.max(0, settings.maxTokensPerDay - settings.consumedTokensToday).toLocaleString()} Tokens còn khả dụng</span>
                      <span>Độ tiêu hao: {((settings.consumedTokensToday / settings.maxTokensPerDay) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Footer Modal Action */}
            <div className="px-6 py-4.5 border-b border-slate-200/50 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => {
                  fetchPipelineData();
                  setShowSettingsModal(false);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-xl shadow-md uppercase active:scale-95 transition-all cursor-pointer"
              >
                Xác nhận Hoàn tất
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
