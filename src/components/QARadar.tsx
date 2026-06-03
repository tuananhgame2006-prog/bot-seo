import React from 'react';
import { Draft } from '../types';
import { Award } from 'lucide-react';

interface QARadarProps {
  activeDraft: Draft | undefined;
  drafts: Draft[];
  selectedDraftId: string;
  setSelectedDraftId: (id: string) => void;
  getRadarSVGCoordinates: (attrs: any) => string;
}

export default function QARadar({
  activeDraft,
  drafts,
  selectedDraftId,
  setSelectedDraftId,
  getRadarSVGCoordinates
}: QARadarProps) {

  const metricsMap = activeDraft && activeDraft.attributes ? [
    activeDraft.attributes.readability || 0,
    activeDraft.attributes.keywordDensity || 0,
    activeDraft.attributes.wordCountScore || 0,
    activeDraft.attributes.structure || 0,
    activeDraft.attributes.metadata || 0,
    activeDraft.attributes.backlinkPotential || 0
  ] : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch text-xs font-sans">
      
      {/* Dynamic Radar Visualization Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white border border-slate-200/80 rounded-2xl relative shadow-sm">
        <div className="mb-4 text-center">
          <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase">
            Radar Kiểm duyệt Chất lượng SEO
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 max-w-md leading-relaxed">
            Thuật toán đánh giá cấu trúc bài viết, tính tương quan mỏ neo, tối ưu hóa siêu dữ liệu và kiểm chứng mức độ liên kết.
          </p>
        </div>

        {!activeDraft || activeDraft.seoScore === 0 ? (
          <div className="w-72 h-72 rounded-full border border-dashed border-slate-200 flex flex-col items-center justify-center p-5 text-center my-6">
            <Award className="w-8 h-8 text-slate-300 animate-pulse mb-3" />
            <p className="text-[11px] text-slate-400 font-medium">
              Đang chờ dữ liệu thẩm định. Vui lòng chạy hoặc chọn bản ghi đã chấm điểm SEO.
            </p>
          </div>
        ) : (
          <div className="relative my-2">
            <svg width="380" height="380" className="max-w-full">
              
              {/* Polar grid levels */}
              {[25, 50, 75, 100].map((level) => {
                const r = (level / 100) * 115;
                const gridPoints = Array.from({ length: 6 }).map((_, i) => {
                  const angle = i * (Math.PI / 3) - Math.PI / 2;
                  return `${190 + r * Math.cos(angle)},${190 + r * Math.sin(angle)}`;
                }).join(' ');

                return (
                  <polygon 
                    key={level}
                    points={gridPoints}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                );
              })}

              {/* Angle Spokes and Text labels */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = i * (Math.PI / 3) - Math.PI / 2;
                const targetX = 190 + 115 * Math.cos(angle);
                const targetY = 190 + 115 * Math.sin(angle);

                const axisLabels = [
                  "Độ Khả Đọc",
                  "Mật Độ Từ Khóa",
                  "Độ Dài Văn Bản",
                  "Cấu Trúc Thẻ H",
                  "Siêu Dữ Liệu SEO",
                  "Liên Kết Hữu Cơ"
                ];

                const lblX = 190 + 142 * Math.cos(angle);
                const lblY = 190 + 142 * Math.sin(angle);

                return (
                  <g key={i}>
                    <line 
                      x1="190" y1="190" 
                      x2={targetX} y2={targetY} 
                      stroke="#E2E8F0" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={lblX} y={lblY}
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-sans)"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="font-medium"
                    >
                      {axisLabels[i]}
                    </text>
                  </g>
                );
              })}

              {/* Actual Filled Radar Boundary */}
              {activeDraft && activeDraft.attributes && (
                <polygon 
                  points={getRadarSVGCoordinates(activeDraft.attributes).replace(/200/g, '190').replace(/120/g, '115')}
                  fill="rgba(37, 99, 235, 0.08)"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
              )}

              {/* Data points markers */}
              {activeDraft && activeDraft.attributes && metricsMap.map((val, i) => {
                const angle = i * (Math.PI / 3) - Math.PI / 2;
                const r = (val / 100) * 115;
                const x = 190 + r * Math.cos(angle);
                const y = 190 + r * Math.sin(angle);

                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
                    <text x={x} y={y - 10} fill="#1D4ED8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {val}%
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        )}
      </div>

      {/* Audit Logging and Detail Selection Panel */}
      <div className="w-full lg:w-80 flex flex-col justify-between shrink-0 gap-4 font-sans">
        
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex-1 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">BÁO CÁO THẨM ĐỊNH (AUDIT)</span>
            <span className="font-extrabold text-blue-600 text-sm">
              {activeDraft && activeDraft.seoScore ? `${activeDraft.seoScore}/100đ` : 'Chưa điểm'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] space-y-1 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Đường dẫn Từ khóa Liên hợp</div>
            <div className="text-slate-800 font-bold">“{activeDraft ? activeDraft.keyword : 'Trống'}”</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col min-h-[160px] shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-2">Nhận xét của Chuyên gia SEO AI</span>
            <div className="text-[11.5px] leading-relaxed text-slate-600 max-h-[180px] overflow-y-auto whitespace-pre-line pr-1 font-sans font-medium">
              {activeDraft && activeDraft.reviewerNotes ? (
                activeDraft.reviewerNotes
              ) : (
                <span className="text-slate-400 italic">Vui lòng chọn bài viết nháp ở phía dưới và thực hiện tác vụ kiểm tra để hệ thống phân tích.</span>
              )}
            </div>
          </div>
        </div>

        {/* Action interactive Selection */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">
            Lựa chọn Bản nháp Thẩm định
          </label>
          <select
            value={selectedDraftId}
            onChange={(e) => setSelectedDraftId(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 border border-slate-200/80 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-semibold font-sans transition-all shadow-inner"
          >
            <option value="" disabled>-- Vui lòng chọn bản nháp --</option>
            {drafts.map(d => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.seoScore > 0 ? `${d.seoScore}%` : 'Chưa thẩm định'})
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}
