import React from 'react';
import { 
  Search, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  Workflow
} from 'lucide-react';
import { Keyword, Draft, PublishedPost, TrajectoryData } from '../types';

interface SidebarProps {
  seedTopic: string;
  setSeedTopic: (val: string) => void;
  isLoading: boolean;
  activeStage: number | null;
  keywords: Keyword[];
  drafts: Draft[];
  published: PublishedPost[];
  trajectory: TrajectoryData[];
  runStage: (stageNum: number, forceKeywordId?: string, forceDraftId?: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  onRunAutopilot: () => Promise<void>;
}

export default function Sidebar({
  seedTopic,
  setSeedTopic,
  isLoading,
  activeStage,
  keywords,
  drafts,
  published,
  trajectory,
  runStage,
  resetDatabase,
  onRunAutopilot
}: SidebarProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<'ai-news' | 'semi-news' | 'foundational'>('ai-news');
  const [isCrawling, setIsCrawling] = React.useState(false);

  const handleRandomKeyword = async () => {
    setIsCrawling(true);
    try {
      const res = await fetch(`/api/trends/random?topic=${selectedTemplate}`);
      const data = await res.json();
      if (data.success && data.keyword) {
        setSeedTopic(data.keyword);
      }
    } catch (err) {
      console.error("Gặp lỗi khi lấy từ khóa ngẫu nhiên:", err);
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <aside className="w-80 flex flex-col border-r border-slate-200 bg-white p-6 shrink-0 justify-between overflow-y-auto font-sans">
      <div className="space-y-6">
        
        {/* Brand Header & Enterprise Title */}
        <div className="pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-lg tracking-tight leading-none">
                Agent <span className="text-blue-600">SEO</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1 block">
                Hệ thống Điều phối Swarm
              </span>
            </div>
          </div>
        </div>

        {/* Selected Category template Dropdown first */}
        <div className="space-y-3.5 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-inner">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">
              Chọn Mẫu Chủ Đề Tối Ưu
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm cursor-pointer"
            >
              <option value="ai-news">📰 Tin tức AI (ai-news)</option>
              <option value="semi-news">🎯 Chip Bán dẫn (semi-news)</option>
              <option value="foundational">🔬 Nghiên cứu Học thuật (foundational)</option>
            </select>
          </div>

          {/* Random Trend keyword middle button */}
          <button
            type="button"
            onClick={handleRandomKeyword}
            disabled={isCrawling || isLoading}
            className="w-full flex items-center justify-center py-2 px-3 border border-dashed border-blue-300 rounded-xl text-[11px] font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/60 disabled:opacity-55 active:scale-[0.98] transition-all cursor-pointer select-none"
          >
            {isCrawling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                <span>Đang cào dữ liệu 24h...</span>
              </>
            ) : (
              <>
                <span className="mr-1.5">🎲</span>
                <span>Random Từ Khóa Hot</span>
              </>
            )}
          </button>

          {/* Target input text */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">
              Nhập Chủ Đề / Từ khóa cụ thể
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={seedTopic}
                onChange={(e) => setSeedTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && seedTopic.trim() !== '') {
                    onRunAutopilot();
                  }
                }}
                placeholder="Nhập từ khóa hoặc cụm từ..." 
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-sans font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Start Analysis Button on bottom */}
          <button
            type="button"
            onClick={onRunAutopilot}
            disabled={isLoading || seedTopic.trim() === ''}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/10 cursor-pointer active:scale-[0.99] transition-all"
          >
            🚀 Bắt Đầu Phân Tích
          </button>
        </div>

        {/* Sequential Pipeline Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              02. Quy trình làm việc tự động
            </label>
            <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
              Enterprise
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            
            {/* STAGE 1: Scout Agent */}
            <button 
              onClick={() => runStage(1)}
              disabled={isLoading}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left font-semibold transition-all border cursor-pointer ${
                activeStage === 1
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm shadow-blue-500/5'
                  : keywords.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/85 shadow-sm'
              }`}
              title="Giai đoạn 1: Quét và phân tách các cụm từ khóa có lượng truy cập"
            >
              <span className="flex items-center gap-2.5">
                <span className={`text-[10px] font-semibold font-mono ${keywords.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>01</span>
                <span>Phân tích Từ khóa</span>
              </span>
              {activeStage === 1 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : keywords.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* STAGE 2: Writer Agent */}
            <button 
              onClick={() => runStage(2)}
              disabled={isLoading || keywords.length === 0}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left font-semibold transition-all border ${
                keywords.length === 0 ? 'opacity-40 cursor-not-allowed bg-slate-50/50' : 'cursor-pointer'
              } ${
                activeStage === 2
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm shadow-blue-500/5'
                  : drafts.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/85 shadow-sm'
              }`}
              title="Giai đoạn 2: Phát triển đề cương chi tiết và viết nội dung nháp"
            >
              <span className="flex items-center gap-2.5">
                <span className={`text-[10px] font-semibold font-mono ${drafts.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>02</span>
                <span>Biên soạn Nội dung</span>
              </span>
              {activeStage === 2 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : drafts.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* STAGE 4: Publisher Agent */}
            <button 
              onClick={() => runStage(4)}
              disabled={isLoading || drafts.length === 0}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left font-semibold transition-all border ${
                drafts.length === 0 ? 'opacity-40 cursor-not-allowed bg-slate-50/50' : 'cursor-pointer'
              } ${
                activeStage === 4
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm shadow-blue-500/5'
                  : published.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/85 shadow-sm'
              }`}
              title="Giai đoạn 3: Phân phối và tự động hóa xuất bản lên các CMS"
            >
              <span className="flex items-center gap-2.5">
                <span className={`text-[10px] font-semibold font-mono ${published.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>03</span>
                <span>Xuất bản Hệ thống</span>
              </span>
              {activeStage === 4 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : published.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* STAGE 5: Tracker Agent */}
            <button 
              onClick={() => runStage(5)}
              disabled={isLoading}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left font-semibold transition-all border cursor-pointer ${
                activeStage === 5
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm shadow-blue-500/5'
                  : trajectory.some(r => r.impressions > 0)
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/85 shadow-sm'
              }`}
              title="Cập nhật dữ liệu APE & Đồng bộ hoá chỉ số tối ưu hoá"
            >
              <span className="flex items-center gap-2.5">
                <span className={`text-[10px] font-semibold font-mono ${trajectory.some(r => r.impressions > 0) ? 'text-emerald-500' : 'text-slate-400'}`}>04</span>
                <span>Cập nhật dữ liệu APE</span>
              </span>
              {activeStage === 5 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : trajectory.some(r => r.impressions > 0) ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Database & Reset Panel Info */}
      <div className="space-y-4 pt-6 mt-auto border-t border-slate-100">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 shadow-inner">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Cơ sở dữ liệu</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              HOẠT ĐỘNG
            </span>
          </div>
          <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
            SQLite (MIDTERM_QA)
          </div>
        </div>

        <button 
          onClick={resetDatabase}
          className="w-full flex items-center justify-center py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-white font-bold text-xs uppercase hover:bg-rose-500 hover:border-rose-500 transition-all cursor-pointer shadow-sm"
          title="Xóa vĩnh viễn dữ liệu tiến trình"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          <span>Xóa Dữ liệu Swarm</span>
        </button>
      </div>
    </aside>
  );
}
