import React, { useState, useEffect } from 'react';
import { Draft } from '../types';
import { Eye, Code, Copy, Check, FileText, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

interface HTMLPreviewerProps {
  drafts: Draft[];
  selectedDraftId: string;
  setSelectedDraftId: (id: string) => void;
  activeDraft: Draft | undefined;
  activePreviewMode: 'interactive' | 'source';
  setActivePreviewMode: (mode: 'interactive' | 'source') => void;
  copyToClipboard: (text: string) => void;
  copySuccess: boolean;
  onImageGenerated?: () => Promise<void>;
}

const getSuggestedPrompts = (keyword: string = '', title: string = '') => {
  const text = (keyword + ' ' + title).toLowerCase();
  
  if (
    text.includes('bán dẫn') || 
    text.includes('chip') || 
    text.includes('semiconductor') || 
    text.includes('tsmc') || 
    text.includes('nvidia') || 
    text.includes('intel') || 
    text.includes('silicon') || 
    text.includes('wafer')
  ) {
    return [
      `Tấm wafer silicon bán dẫn siêu tiên tiến mạch phát sáng laser xanh neon rực rỡ dưới máy quang khắc EUV, phòng sạch công nghệ cao, cinematic lighting, 3D render, photorealistic, 16:9`,
      `Cận cảnh bộ vi xử lý AI chip lõi GPU thế hệ mới với ánh sáng phản chiếu vàng cam và xanh dương, đế silicon thạch anh đen bóng bẩy, macro 3D render, tech-art, 16:9`,
      `Biểu đồ trừu tượng kiến trúc vi mạch bán dẫn và luồng dữ liệu điện tử chạy qua các bóng bán dẫn siêu nhỏ, nền tối sang trọng, 16:9`
    ];
  } else if (
    text.includes('nghiên cứu') || 
    text.includes('tài liệu') || 
    text.includes('paper') || 
    text.includes('học thuật') || 
    text.includes('luận văn') || 
    text.includes('foundational') || 
    text.includes('academic') ||
    text.includes('theory')
  ) {
    return [
      `Một phòng lab nghiên cứu AI tinh gọn, màn hình hologram ảo diệu hiển thị các tài liệu lý thuyết nơ-ron và thuật toán toán học sâu sắc, ánh sáng thanh lịch tối giản, 16:9`,
      `Sách học thuật khoa học dữ liệu mở ra rực sáng trong màn đêm, các luồng kiến thức số hóa mềm mại kết nối thành mạng lưới nơ-ron học sâu, phong cách bìa báo nước ngoài tối giản sang trọng, 16:9`,
      `Đồ họa học thuật tối giản mô phỏng cấu trúc nơ-ron thần kinh và các lớp suy luận học sâu toán học phức tạp, xanh navy kết hợp xám chì sang trọng, 16:9`
    ];
  } else {
    return [
      `Tác nhân AI thông minh (AI Agentic Workflows) hoạt động mượt mà bối cảnh tương lai sang trọng, các hạt ánh sáng xanh ngọc bích lấp lánh biểu diễn kết nối tự động cực đại, 16:9`,
      `Phân tích ngôn ngữ tầng sâu và mô hình LLM: Một khối óc nhân tạo phát ra các luồng dữ liệu neon lấp lánh rực rỡ trên phông nền tối xám khói, 3D render nghệ thuật siêu thực, 16:9`,
      `Minh họa phẳng tối giản đại diện cho tối ưu nội dung SEO bài viết và phân tích từ khóa tự động mượt mà, màu sắc gradient tươi sáng hiện đại, 16:9`
    ];
  }
};

export default function HTMLPreviewer({
  drafts,
  selectedDraftId,
  setSelectedDraftId,
  activeDraft,
  activePreviewMode,
  setActivePreviewMode,
  copyToClipboard,
  copySuccess,
  onImageGenerated
}: HTMLPreviewerProps) {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsg, setGenerationMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const presets = activeDraft ? getSuggestedPrompts(activeDraft.keyword, activeDraft.title) : [];

  useEffect(() => {
    if (presets.length > 0) {
      setSelectedPrompt(presets[0]);
      setCustomPrompt(presets[0]);
    } else {
      setSelectedPrompt('');
      setCustomPrompt('');
    }
    setGenerationMsg(null);
  }, [selectedDraftId, activeDraft?.id]);

  const handleSelectPreset = (preset: string) => {
    setSelectedPrompt(preset);
    setCustomPrompt(preset);
  };

  const handleGenerateImage = async () => {
    if (!activeDraft || !customPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationMsg(null);

    try {
      const customKey = localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/pipeline/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': customKey
        },
        body: JSON.stringify({
          draftId: activeDraft.id,
          prompt: customPrompt
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGenerationMsg({
        type: 'success',
        text: 'Đã sinh ảnh thành công! Hình ảnh đã lưu trực tiếp vào E_drive và nhúng vào bài viết.'
      });

      if (onImageGenerated) {
        await onImageGenerated();
      }
    } catch (err: any) {
      console.error(err);
      setGenerationMsg({
        type: 'error',
        text: `Lỗi sinh ảnh: ${err.message}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top action layout Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-505 font-bold uppercase text-[10px] tracking-wider">Bản thảo chọn xem</span>
          <select
            value={selectedDraftId}
            onChange={(e) => setSelectedDraftId(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-semibold font-sans max-w-xs transition-all shadow-inner"
          >
            <option value="" disabled>-- Vui lòng chọn bản nháp --</option>
            {drafts.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        {activeDraft && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePreviewMode('interactive')}
              className={`px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border cursor-pointer transition-all font-bold ${
                activePreviewMode === 'interactive' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-950 bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Bài Hoàn Thiện</span>
            </button>

            <button
              onClick={() => setActivePreviewMode('source')}
              className={`px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border cursor-pointer transition-all font-bold ${
                activePreviewMode === 'source' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-950 bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Mã Nguồn HTML</span>
            </button>

            <button
              onClick={() => copyToClipboard(activeDraft.draftHtml)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-xs"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-extrabold">Đã sao chép ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao Chép HTML</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!activeDraft ? (
        <div className="py-20 text-center bg-white border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
          <div className="text-slate-800 font-bold uppercase tracking-wider">Hệ Thống Chưa Có Bài Viết Khả Dụng</div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm leading-relaxed">
            Bài viết nháp sẽ tự động khởi sinh khi chạy Giai đoạn 2: "Biên soạn Nội dung".
          </p>
        </div>
      ) : (
        <>
          {/* Panel Tự Động Sinh Ảnh AI (Imagen) */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <h3 className="text-slate-900 font-extrabold text-[12px] uppercase tracking-wider">Tự Động Sinh Ảnh Minh Họa Bằng AI (Imagen)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Presets List */}
              <div className="md:col-span-1 space-y-2">
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Gợi ý prompt chủ đề</span>
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {presets.map((p, idx) => {
                    const isSelected = selectedPrompt === p;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(p)}
                        className={`text-left p-2.5 rounded-xl border text-[10.5px] font-medium leading-relaxed transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold shadow-xs' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Chủ đề #{idx + 1}: {p.length > 55 ? p.substring(0, 55) + '...' : p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Editor & Action */}
              <div className="md:col-span-2 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Tinh chỉnh prompt của riêng bạn</span>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white min-h-[75px] resize-none leading-relaxed shadow-xs"
                    placeholder="Nhập prompt mô tả hình ảnh mong ước..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
                  {generationMsg ? (
                    <div className={`text-[11px] font-bold ${generationMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {generationMsg.text}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Hình ảnh sinh ra có tỷ lệ vàng HD 16:9 và lưu trữ tự động vào E_drive.</span>
                  )}

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !customPrompt.trim()}
                    className={`px-4 py-2 text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all font-bold min-w-[140px] shadow-xs ${
                      isGenerating || !customPrompt.trim()
                        ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 border border-slate-950 text-white hover:bg-slate-850 hover:shadow-xs'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Đang tạo ảnh bằng Imagen...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>Tạo Ảnh Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Article Render */}
          <div className="border border-slate-200/80 rounded-2xl bg-white overflow-y-auto max-h-[460px] min-h-[300px] shadow-xs pb-6">
            {activePreviewMode === 'interactive' ? (
              <div className="p-6 text-slate-755 max-w-none font-sans leading-relaxed space-y-4">
                <h1 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">{activeDraft.title}</h1>
                <div 
                  className="text-sm font-medium font-sans text-slate-705 leading-relaxed space-y-3 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeDraft.draftHtml }} 
                />
              </div>
            ) : (
              <pre className="p-5 font-mono text-[11.5px] text-blue-700 bg-slate-50 rounded-b-2xl border-t border-slate-100 overflow-x-auto whitespace-pre leading-relaxed select-text shadow-inner">
                <code>{activeDraft.draftHtml}</code>
              </pre>
            )}
          </div>
        </>
      )}

    </div>
  );
}
