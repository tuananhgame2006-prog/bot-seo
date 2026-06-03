import React, { useState } from 'react';
import { Draft, Keyword, PublishedPost } from '../types';
import { 
  Calendar, 
  AlertTriangle, 
  UserCheck, 
  Check, 
  X, 
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';

interface EditorialPlanAndAlertsProps {
  drafts: Draft[];
  keywords: Keyword[];
  published: PublishedPost[];
  onUpdateDraft: (payload: {
    draftId: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    editorFeedback?: string;
    scheduledDate?: string;
    assignedAgent?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function EditorialPlanAndAlerts({
  drafts,
  keywords,
  published,
  onUpdateDraft,
  isLoading
}: EditorialPlanAndAlertsProps) {
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Intent overlap calculation for cannibalization alerts
  const detectCannibalization = () => {
    const alerts: Array<{
      id: string;
      keyword: string;
      type: 'exact' | 'partial';
      entities: string[];
      risk: 'HIGH' | 'MEDIUM';
      solution: string;
    }> = [];

    // Combine all tracking intents (draft keywords and published keys)
    const activeKeywordsMap: Record<string, string[]> = {};
    
    // Group draft targeting
    drafts.forEach(d => {
      const key = d.keyword.trim().toLowerCase();
      if (!activeKeywordsMap[key]) activeKeywordsMap[key] = [];
      activeKeywordsMap[key].push(`Bản thảo: "${d.title}"`);
    });

    // Group published targeting
    published.forEach(p => {
      // Find matching keywords from scout database if possible
      const key = p.title.trim().toLowerCase();
      // Or search using drafts mapping
      const relatedDraft = drafts.find(d => d.id === p.draftId);
      const kwKey = relatedDraft ? relatedDraft.keyword.trim().toLowerCase() : key;
      if (!activeKeywordsMap[kwKey]) activeKeywordsMap[kwKey] = [];
      activeKeywordsMap[kwKey].push(`Đã xuất bản: "${p.title}"`);
    });

    // 1. Detect exact cannibalization
    Object.entries(activeKeywordsMap).forEach(([keyword, entities]) => {
      if (entities.length > 1) {
        alerts.push({
          id: `exact-${keyword}`,
          keyword,
          type: 'exact',
          entities,
          risk: 'HIGH',
          solution: 'Hợp nhất nội dung thành một tài liệu Mega-Post trụ cột hoặc thiết lập thẻ Canonical chỉ định bài viết chính.'
        });
      }
    });

    // 2. Detect partial/intent overlap heuristic (sharing >=3 characters of key sub-nouns)
    const keywordsList = Object.keys(activeKeywordsMap);
    for (let i = 0; i < keywordsList.length; i++) {
      for (let j = i + 1; j < keywordsList.length; j++) {
        const kw1 = keywordsList[i];
        const kw2 = keywordsList[j];
        
        // Split and find intersection of terms (excluding generic prepositions)
        const stopwords = ['và', 'với', 'trong', 'tại', 'về', 'cho', 'của', 'các', 'đã', 'có', 'hóa', 'tự', 'động', 'trí', 'tuệ', 'nhân', 'tạo'];
        const words1 = kw1.split(/\s+/).filter(w => w.length > 1 && !stopwords.includes(w));
        const words2 = kw2.split(/\s+/).filter(w => w.length > 1 && !stopwords.includes(w));
        
        const intersection = words1.filter(w => words2.includes(w));
        if (intersection.length >= 2) {
          const entities = [
            ...(activeKeywordsMap[kw1] || []),
            ...(activeKeywordsMap[kw2] || [])
          ];
          
          if (!alerts.some(a => a.keyword === kw1 || a.keyword === kw2)) {
            alerts.push({
              id: `partial-${kw1}-${kw2}`,
              keyword: `Sự giao thoa giữa [${kw1}] và [${kw2}]`,
              type: 'partial',
              entities: Array.from(new Set(entities)),
              risk: 'MEDIUM',
              solution: `Tối ưu hóa lại cấu trúc liên kết nội bộ: sử dụng văn bản neo (anchor text) khác nhau và định tuyến lại từ khóa phụ về các thẻ header phụ (H2) thay vì tiêu đề H1 chính.`
            });
          }
        }
      }
    }

    return alerts;
  };

  const cannibals = detectCannibalization();

  // Handle local submit of updates
  const handleUpdate = async (draftId: string, status?: 'approved' | 'rejected', localDate?: string, agent?: string) => {
    setUpdatingId(draftId);
    try {
      await onUpdateDraft({
        draftId,
        approvalStatus: status,
        editorFeedback: feedbackInputs[draftId],
        scheduledDate: localDate,
        assignedAgent: agent
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Sorted list of articles for editorial queue
  const calendarQueue = [...drafts].sort((a, b) => {
    const dateA = a.scheduledDate || '9999-12-31';
    const dateB = b.scheduledDate || '9999-12-31';
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Dynamic Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Kế hoạch Biên tập & Giám sát Tương thích SEO</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Quy trình phối hợp an toàn: Lập kế hoạch phân bổ ngày xuất bản, phê duyệt cấu trúc chất lượng trước khi gửi CMS, và dọn dẹp các xung đột từ khóa trùng lặp.
          </p>
        </div>
      </div>

      {/* Grid of Calendar Queue and Cannibalization Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editorial Planning Calendar List (2 Cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h5 className="font-bold text-slate-700 text-xs mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-650" />
              <span>Tiến độ Lịch đăng & Trạng thái Phê duyệt</span>
            </h5>

            {calendarQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-450 flex flex-col items-center">
                <FileText className="w-8 h-8 text-slate-200 mb-2" />
                <p className="font-semibold text-slate-500">Chưa có bản thảo nào sẵn sàng lập lịch.</p>
                <p className="text-[10px] mt-1 text-slate-400">Khởi chạy Giai đoạn 2: "Biên soạn bài viết" để tạo bản thảo đầu tiên.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {calendarQueue.map((draft) => {
                  const localFeedback = feedbackInputs[draft.id] ?? draft.editorFeedback ?? '';
                  const isPending = !draft.approvalStatus || draft.approvalStatus === 'pending';
                  const isApproved = draft.approvalStatus === 'approved';
                  const isRejected = draft.approvalStatus === 'rejected';

                  return (
                    <div 
                      key={draft.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isApproved ? 'bg-emerald-50/40 border-emerald-200/80' :
                        isRejected ? 'bg-rose-50/45 border-rose-200/80' :
                        'bg-slate-50/50 border-slate-200/60'
                      }`}
                    >
                      {/* Draft Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                            Mã: #{draft.id.slice(-6)} • Focus Key: <strong className="text-blue-600">{draft.keyword}</strong>
                          </span>
                          <h6 className="font-bold text-slate-800 text-sm mt-1.5 truncate">{draft.title}</h6>
                        </div>

                        {/* Status Stamp */}
                        <div className="shrink-0 mt-1">
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                              Đã Duyệt Đăng
                            </span>
                          )}

                          {isRejected && (
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-rose-100 text-rose-800 border border-rose-200/50 flex items-center gap-1 shadow-xs">
                              <X className="w-2.5 h-2.5" />
                              Yêu Cầu Sửa
                            </span>
                          )}

                          {isPending && (
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse shadow-xs">
                              <HelpCircle className="w-2.5 h-2.5" />
                              Chờ Kiểm Duyệt
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Editorial Settings Block */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200/60 pt-3 my-2 text-[11px] text-slate-500">
                        {/* Date Scheduler */}
                        <div>
                          <label className="text-[9px] text-slate-455 uppercase font-bold block mb-1">Ngày Xuất Bản Dự Kiến</label>
                          <input 
                            type="date"
                            value={draft.scheduledDate || ''}
                            onChange={(e) => handleUpdate(draft.id, undefined, e.target.value)}
                            disabled={updatingId === draft.id}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600 w-full shadow-inner"
                          />
                        </div>

                        {/* Agent Router */}
                        <div>
                          <label className="text-[9px] text-slate-455 uppercase font-bold block mb-1">Trí tuệ Biên tập (Assigned AI)</label>
                          <select 
                            value={draft.assignedAgent || 'Gemini-3.5-Flash'}
                            onChange={(e) => handleUpdate(draft.id, undefined, undefined, e.target.value)}
                            disabled={updatingId === draft.id}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-600 w-full font-mono shadow-inner"
                          >
                            <option value="Gemini-3.5-Flash">Gemini 3.5 Flash</option>
                            <option value="Gemini-3.1-Pro">Gemini 3.1 Pro (B2B Deep)</option>
                            <option value="Claude-3.5-Sonnet">Agile Writer Core</option>
                          </select>
                        </div>

                        {/* SEO Score Context */}
                        <div className="flex flex-col justify-center pl-2">
                          <span className="text-[9px] text-slate-455 uppercase font-bold block">Điểm SEO Kiểm Định</span>
                          <span className={`text-base font-extrabold mt-0.5 ${
                            draft.seoScore >= 80 ? 'text-emerald-600' :
                            draft.seoScore >= 50 ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {draft.seoScore > 0 ? `${draft.seoScore}/100đ` : 'Chưa Kiểm Định'}
                          </span>
                        </div>
                      </div>

                      {/* Editorial Feedback & Review Actions */}
                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-250 shadow-inner">
                        <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Ý kiến chỉ đạo từ Trưởng ban Biên tập (B2B Chief Feedback)</label>
                        <textarea 
                          placeholder="Nhập ghi chú yêu cầu viết lại hoặc lưu ý dàn ý..."
                          value={localFeedback}
                          onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [draft.id]: e.target.value }))}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10.5px] text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white w-full h-11 resize-none placeholder:text-slate-405 leading-normal shadow-inner"
                        />
                        
                        {/* Actions for draft review approval */}
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[8.5px] text-slate-400 block italic font-semibold">
                            {updatingId === draft.id ? 'Đang gửi cập nhật lên CSDL...' : 'Sẵn sàng lưu chỉnh sửa.'}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(draft.id, 'rejected')}
                              disabled={updatingId === draft.id}
                              className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer border flex items-center gap-1 transition-all shadow-xs ${
                                isRejected 
                                  ? 'bg-rose-100 text-rose-850 border-rose-350' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:text-rose-600 hover:border-rose-300'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              Yêu Cầu Điều Chỉnh
                            </button>

                            <button
                              onClick={() => handleUpdate(draft.id, 'approved')}
                              disabled={updatingId === draft.id}
                              className={`px-3 py-1 text-[10px] rounded font-bold cursor-pointer border flex items-center gap-1 transition-all shadow-xs ${
                                isApproved 
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              Phê Duyệt Xuất Bản
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cannibalization & Warnings Panel (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Trùng lặp Từ khóa (Cannibalization)</span>
              </h5>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                cannibals.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {cannibals.length} Cảnh báo
              </span>
            </div>

            {cannibals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center p-3">
                <UserCheck className="w-8 h-8 text-emerald-300 mb-2" />
                <p className="font-bold text-slate-700 text-[11px]">Cấu trúc Nội dung An toàn</p>
                <p className="text-[10px] text-slate-405 mt-1 leading-relaxed">Các từ khóa SEO trong hệ thống của bạn hiện tại hoạt động độc lập và không cạnh tranh trực tiếp với nhau.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cannibals.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 shadow-inner">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="font-mono text-slate-700 font-extrabold tracking-tight bg-slate-100 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[150px]">
                        {alert.keyword}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold border ${
                        alert.risk === 'HIGH' ? 'bg-rose-50 text-rose-750 border-rose-200' : 'bg-amber-50 text-amber-750 border-amber-200'
                      }`}>
                        {alert.risk} RISK
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Thành phần xung đột:</span>
                      <ul className="list-disc pl-3 text-[10px] text-slate-650 space-y-0.5 font-medium">
                        {alert.entities.map((ent, idx) => (
                          <li key={idx} className="truncate">{ent}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[9.5px] leading-relaxed text-slate-500 font-medium">
                      <strong className="text-amber-600 block uppercase text-[8px] font-extrabold mb-0.5">Giải pháp khuyên dùng:</strong>
                      {alert.solution}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines Tips box */}
          <div className="bg-blue-50/40 p-5 border border-blue-100 rounded-2xl space-y-2 shadow-xs">
            <h6 className="font-bold text-[10px] text-blue-700 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              BÍ QUYẾT B2B SEO COPILOT
            </h6>
            <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
              Hãy chỉ định ngày xuất bản phân bố cách nhau từ <strong>2 đến 3 ngày</strong>. Điều này cho phép Google Crawler lập chỉ mục đúng cách, giảm thiểu nguy cơ bị coi là spam hàng loạt và duy trì sự ổn định tối đa cho Biểu đồ Tăng trưởng GSC.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
