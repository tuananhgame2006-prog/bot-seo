import React, { useState } from 'react';
import { 
  Clock, 
  Mail, 
  Play, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Eye, 
  ExternalLink, 
  ToggleLeft, 
  ToggleRight,
  User,
  Check
} from 'lucide-react';

interface SchedulerAndApprovalsProps {
  config: {
    enabled: boolean;
    hour: number;
    minute: number;
    daysOfWeek: number[]; // 1=Mon, 3=Wed, 5=Fri, 0=Sun
    targetEmail: string;
  };
  emails: any[];
  isLoading: boolean;
  onUpdateConfig: (newConfig: any) => Promise<void>;
  onForceRun: () => Promise<void>;
  onApproveEmails: (draftId: string) => Promise<void>;
  published?: any[];
  onSyncAnalytics?: () => Promise<void>;
}

export default function SchedulerAndApprovals({
  config,
  emails,
  isLoading,
  onUpdateConfig,
  onForceRun,
  onApproveEmails,
  published = [],
  onSyncAnalytics
}: SchedulerAndApprovalsProps) {
  // Local state for edits
  const [editing, setEditing] = useState(false);
  const [targetEmail, setTargetEmail] = useState(config.targetEmail);
  const [hour, setHour] = useState(config.hour);
  const [days, setDays] = useState<number[]>(config.daysOfWeek);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      await onUpdateConfig({
        enabled: config.enabled,
        hour,
        minute: 0,
        daysOfWeek: days,
        targetEmail
      });
      setEditing(false);
      triggerToast("Đã lưu thiết lập cấu hình hẹn giờ mới thành công!");
    } catch {
      triggerToast("Lỗi khi lưu cấu hình!");
    } finally {
      setActionLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggleActive = async () => {
    await onUpdateConfig({
      ...config,
      enabled: !config.enabled
    });
    triggerToast(`Đã ${!config.enabled ? 'kích hoạt' : 'tạm dừng'} chế độ soạn thảo tự động 6:00 AM.`);
  };

  const handleTestNow = async () => {
    setActionLoading(true);
    try {
      await onForceRun();
      triggerToast("Chuỗi robot Swarm đã hoàn tất chu trình tự động và gửi hòm thư phê duyệt!");
    } catch (err) {
      triggerToast("Có lỗi xảy ra khi kích hoạt robot.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (draftId: string) => {
    setActionLoading(true);
    try {
      await onApproveEmails(draftId);
      triggerToast("Phần mềm đã phê duyệt và xuất bản tự động bài viết lên web!");
      if (selectedEmail && selectedEmail.draftId === draftId) {
        setSelectedEmail(null);
      }
    } catch {
      triggerToast("Có lỗi khi phê duyệt bài viết.");
    } finally {
      setActionLoading(false);
    }
  };

  // Convert day array item to Vietnamese label
  const getDayLabel = (d: number) => {
    if (d === 1) return 'Thứ 2';
    if (d === 2) return 'Thứ 3';
    if (d === 3) return 'Thứ 4';
    if (d === 4) return 'Thứ 5';
    if (d === 5) return 'Thứ 6';
    if (d === 6) return 'Thứ 7';
    return 'Chủ Nhật (CN)';
  };

  return (
    <div id="scheduler-and-approvals-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      
      {/* Configuration Column Left */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
        
        {/* Toggle & Config Box */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">Cấu hình Hẹn giờ Swarm</h2>
                <p className="text-[11px] text-slate-400 font-medium">Auto-write & Audit định kỳ</p>
              </div>
            </div>

            {/* Switch Active Status Toggle */}
            <button 
              onClick={handleToggleActive}
              className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
              title={config.enabled ? "Tạm dừng lập lịch" : "Kích hoạt lập lịch"}
            >
              {config.enabled ? (
                <ToggleRight className="w-11 h-11 text-blue-600 fill-blue-50" />
              ) : (
                <ToggleLeft className="w-11 h-11 text-slate-300" />
              )}
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold leading-relaxed flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Config details */}
          {!editing ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Thời gian lập lịch</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{config.hour < 10 ? `0${config.hour}` : config.hour}:00 AM</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email gửi xác nhận</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs truncate">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate" title={config.targetEmail}>{config.targetEmail}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Các ngày hoạt động tuần</span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 0].map(day => {
                    const active = config.daysOfWeek.includes(day);
                    return (
                      <span 
                        key={day}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          active 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-50 text-slate-400 border-slate-150 line-through'
                        }`}
                      >
                        {getDayLabel(day)}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setTargetEmail(config.targetEmail);
                  setHour(config.hour);
                  setDays(config.daysOfWeek);
                  setEditing(true);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Chỉnh sửa thông số
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Form Input targetEmail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Email Nhận Xác Nhận</label>
                <input 
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Hour Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Giờ chạy bài viết (AM)</label>
                <select 
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {[4, 5, 6, 7, 8, 9, 10].map(h => (
                    <option key={h} value={h}>{h}:00 AM sáng</option>
                  ))}
                </select>
              </div>

              {/* Choose days of week */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Chọn ngày hoạt động</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const active = days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          active 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day === 0 ? 'CN' : `T.${day+1}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Lưu lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trigger manually controller card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Play className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Giả lập chu trình 6:00 AM</h3>
              <p className="text-[11px] text-slate-400">Chạy thử chuỗi Autopilot ngay lập tức</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bạn không cần đợi đến 6:00 AM thứ Hai, Tư, Sáu, hay Chủ Nhật. Hãy bấm nút dưới đây để kích hoạt tất cả các Agent (Scout, Writer, Reviewer) thực thi toàn diện và gửi Email phê duyệt tức thì:
          </p>
          <button
            onClick={handleTestNow}
            disabled={isLoading || actionLoading}
            className="w-full py-3 bg-blue-650 hover:bg-blue-600 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5"
          >
            {isLoading || actionLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Swarm Robot Đang Chạy...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>KÍCH HOẠT QUY TRÌNH NGAY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation & Email Log Stream on the Right */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs h-[560px]">
        
        {/* Stream Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Hòm thư phê duyệt hệ thống ({emails.length})</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Dòng xác cứ thời gian thực</span>
        </div>

        {/* Stream Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-600">Hòm thư trống</h4>
                <p className="text-[11px] text-slate-400 max-w-[280px] mt-1">Chuỗi bài viết tự động khi kích hoạt vào 6:00 sẽ gửi mail kiểm duyệt và log tại đây.</p>
              </div>
            </div>
          ) : (
            emails.slice().reverse().map((mail, index) => {
              const isPending = mail.status === 'pending_approval';
              return (
                <div 
                  key={mail.id || index}
                  className={`border rounded-xl p-4 transition-all flex flex-col gap-3 hover:border-slate-300 ${
                    selectedEmail?.id === mail.id 
                      ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                      : isPending ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 bg-slate-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{mail.subject}</h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                          <span>To: <strong>{mail.to}</strong></span>
                          <span>•</span>
                          <span>{new Date(mail.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({new Date(mail.timestamp).toLocaleDateString('vi-VN')})</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase shrink-0 ${
                      isPending 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isPending ? 'Chờ duyệt ⧖' : 'Đã đăng ✓'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setSelectedEmail(mail)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Xem nội dung Email</span>
                    </button>

                    {isPending && (
                      <button
                        onClick={() => handleApprove(mail.draftId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Duyệt & Xuất bản ngay</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION: ĐÁNH GIÁ CHẤT LƯỢNG BÀI VIẾT VÀ BẢNG XẾP HẠNG APE */}
      <div id="evaluation-ranking-panel" className="lg:col-span-12 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs mt-2">
        <div className="px-6 py-5 border-b border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/40 to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <span className="text-lg">🏆</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">4. XẾP HẠNG RANKING BÀI VIẾT (ĐIỂM SỐ APE)</h3>
              <p className="text-[11px] text-slate-400 font-medium">Bảng đánh giá phân loại chất lượng dựa trên chỉ số Tokens, lượt Truy cập và số Like</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              if (onSyncAnalytics) {
                setActionLoading(true);
                try {
                  await onSyncAnalytics();
                  triggerToast("Đồng bộ liên tiếp từ CMS API thành công và tính toán lại thang điểm APE!");
                } catch {
                  triggerToast("Lỗi kết nối đồng bộ CMS!");
                } finally {
                  setActionLoading(false);
                }
              }
            }}
            disabled={actionLoading || published.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-[11px] font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all self-start md:self-auto uppercase tracking-wide animate-in fade-in"
          >
            <span>🔄</span>
            <span>Đồng bộ từ CMS API</span>
          </button>
        </div>

        <div className="p-6">
          {published.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-xs font-bold text-slate-500">Chưa có bài viết nào được xuất bản lên web.</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">Khi các bài viết được duyệt và xuất bản tự động thành công, hệ thống Thống kê & Phân loại chất lượng sẽ đo lường chi tiết tại đây.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50">
                    <th className="py-3 px-4 font-extrabold w-16 text-center">Xếp hạng</th>
                    <th className="py-3 px-4 font-extrabold">Từ khóa & Tiêu đề bài viết on CMS</th>
                    <th className="py-3 px-4 font-extrabold text-center">Đánh giá</th>
                    <th className="py-3 px-4 font-extrabold text-center">Ảnh / Bảng biểu</th>
                    <th className="py-3 px-4 font-extrabold text-center">Token đã ngốn</th>
                    <th className="py-3 px-4 font-extrabold text-center">Truy cập (Visits)</th>
                    <th className="py-3 px-4 font-extrabold text-center">Lượt thích (Likes)</th>
                    <th className="py-3 px-4 font-bold text-center text-indigo-700">Điểm APE (Max 10)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {([...published]
                    .sort((a, b) => (b.apeScore || 0) - (a.apeScore || 0))
                    .map((post, index) => {
                      const rank = index + 1;
                      const quality = post.quality || 'Tốt';
                      const imageCount = post.imageCount || 3;
                      const chartCount = post.chartCount || 1;
                      const tokens = post.tokensConsumed || 5200;
                      const visits = post.visits || 215;
                      const likes = post.likes || 18;
                      const apeScore = post.apeScore || 7.5;

                      return (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold ${
                              rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              rank === 2 ? 'bg-slate-100 text-slate-650 border border-slate-200' :
                              rank === 3 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 line-clamp-1 max-w-[280px]">
                              {post.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-semibold font-mono">
                              <span className="bg-slate-100 text-slate-500 px-1 py-0.2 rounded uppercase text-[8px]">{post.platform}</span>
                              <span className="text-slate-300">|</span>
                              <a 
                                href={post.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-500 hover:underline flex items-center gap-0.5 animate-in fade-in"
                              >
                                {post.url} <span>↗</span>
                              </a>
                            </div>
                            {post.articleId && (
                              <div className="mt-1 flex">
                                <span className="bg-indigo-50/50 text-indigo-600 px-1.5 py-0.2 rounded border border-indigo-100 text-[8px] font-semibold font-mono">
                                  ID Web: {post.articleId}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              quality === 'Xuất sắc' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              quality === 'Tốt' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {quality === 'Xuất sắc' ? '💎 Xuất sắc' : quality === 'Tốt' ? '✨ Tốt' : '👍 Khá'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-600 font-mono">
                            📷 {imageCount} ảnh / 📊 {chartCount} bảng
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {tokens.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600 font-bold">
                            ⚡ {visits.toLocaleString()} visits
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600 font-bold">
                            ❤️ {likes.toLocaleString()} thích
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-mono font-extrabold bg-indigo-50 text-indigo-700 py-1 px-2.5 rounded-xl border border-indigo-100 text-[11px] shadow-xs">
                              {Number(apeScore).toFixed(2)} / 10
                            </span>
                          </td>
                        </tr>
                      );
                    }))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* HTML email body dialog modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[85vh] animate-scaleUp">
            
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Chi tiết Email Gửi Đi</h3>
              </div>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                Đóng ✕
              </button>
            </div>

            {/* Simulated Webmail client header block */}
            <div className="p-4 bg-slate-100/50 border-b border-slate-200 text-[11px] text-slate-600 flex flex-col gap-1.5">
              <div><strong>Từ:</strong> robot-swarm@seo-empire.ai</div>
              <div><strong>Đến:</strong> {selectedEmail.to}</div>
              <div><strong>Tiêu đề:</strong> {selectedEmail.subject}</div>
            </div>

            {/* Email iframe preview body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div 
                className="bg-white p-6 rounded-xl border border-slate-150 shadow-inner"
                dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
              />
            </div>

            {/* Modal action tray footer */}
            <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-between gap-3 bg-slate-50 shrink-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Email simulation payload. Link click is active.
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng cửa sổ
                </button>

                {selectedEmail.status === 'pending_approval' && (
                  <button
                    onClick={() => handleApprove(selectedEmail.draftId)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Duyệt từ Email này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
