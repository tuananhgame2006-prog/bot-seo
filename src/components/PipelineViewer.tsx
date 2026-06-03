import React from 'react';
import { Keyword, Draft, PublishedPost } from '../types';
import { ExternalLink } from 'lucide-react';

interface PipelineViewerProps {
  keywords: Keyword[];
  drafts: Draft[];
  published: PublishedPost[];
  isLoading: boolean;
  runStage: (stageNum: number, forceKeywordId?: string, forceDraftId?: string) => Promise<void>;
  setSelectedDraftId: (id: string) => void;
  setActiveTab: (tab: number) => void;
}

export default function PipelineViewer({
  keywords,
  drafts,
  published,
  isLoading,
  runStage,
  setSelectedDraftId,
  setActiveTab
}: PipelineViewerProps) {
  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Table 1: Discoveries */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Kho Khai thác Từ khóa Tiềm năng (Discoveries)
          </span>
          <span className="text-slate-500 font-semibold">SL Khớp: {keywords.length} từ khóa</span>
        </div>

        {keywords.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-medium">
            Chưa phát hiện từ khóa khả dụng. Vui lòng khởi động tiến trình "Phân tích Từ khóa" ở bảng điều khiển bên trái.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="p-3">Từ khóa chính</th>
                  <th className="p-3 text-center">Lượng Tìm kiếm (Vol)</th>
                  <th className="p-3 text-center">Độ khó (KD)</th>
                  <th className="p-3">Nhóm Ý định (Intent)</th>
                  <th className="p-3 text-center">Liên quan (Relevancy)</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Tác vụ Biên soạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {keywords.map(kw => (
                  <tr key={kw.id} className="hover:bg-slate-50/70 transition-all font-sans">
                    <td className="p-3 font-semibold text-slate-900">{kw.keyword}</td>
                    <td className="p-3 text-center font-mono font-medium">{kw.volume.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        kw.difficulty > 60 ? 'bg-rose-50 text-rose-700 border border-rose-200/50' :
                        kw.difficulty > 35 ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      }`}>
                        {kw.difficulty}/100
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-medium text-slate-500">{kw.intent}</span>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-slate-800">{kw.relevance}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        kw.status === 'drafted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {kw.status === 'drafted' ? 'Đã lên nháp' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {kw.status !== 'drafted' ? (
                        <button 
                          onClick={() => runStage(2, kw.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-bold cursor-pointer text-[11px] transition-all shadow-xs"
                        >
                          Lập Đề cương NHÁP
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold mr-2">Hoàn tất ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table 2: Compositions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Chỉ mục Bài viết Blueprint (Compositions)
          </span>
          <span className="text-slate-500 font-semibold">SL Nháp: {drafts.length} bản ghi</span>
        </div>

        {drafts.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-medium">
            Không có mẫu bài viết nháp nào trong hệ thống dữ liệu. Vui lòng kích hoạt "Biên soạn Nội dung" (Stage 2).
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="p-3">Tiêu đề bản thảo cấu trúc</th>
                  <th className="p-3">Từ khóa mỏ neo (Anchor)</th>
                  <th className="p-3 text-center border-r border-slate-100">Thẩm định SEO</th>
                  <th className="p-3 text-center">Kênh lưu trữ</th>
                  <th className="p-3 text-right">Luồng tác nghiệp chuyên nghiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {drafts.map(dr => (
                  <tr key={dr.id} className="hover:bg-slate-50/70 transition-all font-sans">
                    <td className="p-3 font-semibold text-slate-900 max-w-sm truncate" title={dr.title}>{dr.title}</td>
                    <td className="p-3 text-blue-600 font-semibold font-mono">{dr.keyword}</td>
                    <td className="p-3 text-center border-r border-slate-100">
                      {dr.seoScore > 0 ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          dr.seoScore >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}>
                          {dr.seoScore}/100
                        </span>
                      ) : (
                        <button 
                          onClick={() => runStage(3, undefined, dr.id)}
                          disabled={isLoading}
                          className="px-2 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 font-bold cursor-pointer text-[10px] transition-all"
                        >
                          Chạy Đánh giá SEO
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        dr.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {dr.status === 'published' ? 'Đã Xuất Bản' : 'Nháp Hệ Thống'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 font-sans">
                      <button
                        onClick={() => {
                          setSelectedDraftId(dr.id);
                          setActiveTab(1); // Inspect Audit
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-55 hover:border-slate-300 font-bold cursor-pointer text-[10px] transition-all shadow-xs"
                      >
                        Kiểm chứng SEO
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDraftId(dr.id);
                          setActiveTab(3); // HTML preview
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-55 hover:border-slate-300 font-bold cursor-pointer text-[10px] transition-all shadow-xs"
                      >
                        Xem trước HTML
                      </button>
                      {dr.seoScore > 0 && dr.status !== 'published' && (
                        <button
                          onClick={() => runStage(4, undefined, dr.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer text-[10px] transition-all shadow-sm"
                        >
                          Xuất bản CMS
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table 3: Published */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Danh mục Xuất bản Thực tế (Distributed Links)
          </span>
          <span className="text-slate-500 font-semibold">SL Trực tuyến: {published.length} kết quả</span>
        </div>

        {published.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-medium">
            Hiện tại các kênh CMS chưa ghi nhận liên kết xuất bản. Vui lòng tiến hành "Xuất bản CMS".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="p-3">Tiêu đề bài viết Live</th>
                  <th className="p-3">Hệ thống CMS</th>
                  <th className="p-3">Đường dẫn bài viết thực tế</th>
                  <th className="p-3">Thời điểm đăng tải</th>
                  <th className="p-3 text-right">Trạng thái Google index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {published.map(pub => (
                  <tr key={pub.id} className="hover:bg-slate-50/70 transition-all font-sans">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate" title={pub.title}>{pub.title}</td>
                    <td className="p-3 font-mono font-medium">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100/50">
                        {pub.platform}
                      </span>
                    </td>
                    <td className="p-3 text-blue-600 hover:text-blue-800 font-semibold">
                      <a href={pub.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 inline-flex">
                        <span className="truncate max-w-xs">{pub.url}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 text-slate-500 font-medium font-mono">{pub.date}</td>
                    <td className="p-3 text-right">
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                        ĐÃ CHỈ MỤC ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
