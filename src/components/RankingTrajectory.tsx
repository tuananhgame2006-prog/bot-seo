import React from 'react';
import { TrajectoryData } from '../types';
import { TrendingUp } from 'lucide-react';

interface RankingTrajectoryProps {
  trajectory: TrajectoryData[];
  maxImpressions: number;
  maxClicks: number;
  getImpressionsSVGPoints: () => string;
  getClicksSVGPoints: () => string;
  getPositionSVGPoints: () => string;
}

export default function RankingTrajectory({
  trajectory,
  maxImpressions,
  maxClicks,
  getImpressionsSVGPoints,
  getClicksSVGPoints,
  getPositionSVGPoints
}: RankingTrajectoryProps) {
  const hasTrajectoryData = trajectory.length > 0 && !trajectory.every(t => t.impressions === 0);

  return (
    <div className="space-y-4 font-sans text-xs">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-150 pb-3 gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase">
            Biểu đồ Tăng trưởng Google Search Console (Mô phỏng)
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Ghi nhận hiệu suất tích lũy tự nhiên (Lượt hiển thị, tỷ lệ nhấp chuột thực tế, và biến động thứ hạng trung bình).
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-sans mt-2 md:mt-0">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-3 h-1.5 bg-blue-600 rounded-full" />
            Lượt hiển thị (Max: {maxImpressions.toLocaleString()})
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-3 h-1.5 bg-amber-500 rounded-full" />
            Lượt nhấp chuột (Max: {maxClicks.toLocaleString()})
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-3 h-1 border-t-2 border-dashed border-emerald-500" />
            Vị trí trung bình (1-100)
          </span>
        </div>
      </div>

      {!hasTrajectoryData ? (
        <div className="py-20 text-center bg-white border border-slate-205 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 shadow-xs">
          <TrendingUp className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-700">Biểu đồ GSC Chưa Khởi Chạy</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-md leading-relaxed">
            Để theo dõi biểu đồ tăng trưởng, vui lòng tiến hành "Xuất bản CMS" (Stage 4) bài viết của bạn, sau đó nhấp vào "Theo dõi Thứ hạng" (Stage 5).
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-center min-h-[220px] shadow-sm">
          <div className="w-full h-[220px] relative">
            <svg width="100%" height="200" viewBox="0 0 720 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="clkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Help lines */}
              {Array.from({ length: 5 }).map((_, i) => {
                const y = 40 + i * 36;
                return (
                  <line 
                    key={i}
                    x1="55" y1={y} x2="665" y2={y} 
                    stroke="#F1F3F5" 
                    strokeWidth="1" 
                    strokeDasharray="2,3"
                  />
                );
              })}

              {/* Fills under curves if available */}
              {(() => {
                const imp = getImpressionsSVGPoints();
                return imp ? <polygon points={`${imp} 665,200 55,200`} fill="url(#impGrad)" /> : null;
              })()}

              {(() => {
                const clk = getClicksSVGPoints();
                return clk ? <polygon points={`${clk} 665,200 55,200`} fill="url(#clkGrad)" /> : null;
              })()}

              {/* Polylines lines */}
              <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={getImpressionsSVGPoints()} strokeLinecap="round" />
              <polyline fill="none" stroke="#d97706" strokeWidth="2.2" points={getClicksSVGPoints()} strokeLinecap="round" />
              <polyline fill="none" stroke="#059669" strokeWidth="1.8" strokeDasharray="4,2" points={getPositionSVGPoints()} />

              {/* Axises */}
              <line x1="55" y1="30" x2="55" y2="200" stroke="#E2E8F0" />
              <line x1="55" y1="200" x2="665" y2="200" stroke="#E2E8F0" />

              {/* Scalings markers */}
              <text x="47" y="34" fill="#94A3B8" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="end">{maxImpressions.toLocaleString()}</text>
              <text x="47" y="115" fill="#94A3B8" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="end">{(maxImpressions/2).toLocaleString()}</text>
              <text x="47" y="195" fill="#94A3B8" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="end">0</text>

              <text x="673" y="34" fill="#059669" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="start">Thứ hạng: 1</text>
              <text x="673" y="115" fill="#059669" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="start">Thứ hạng: 50</text>
              <text x="673" y="195" fill="#059669" fontSize="8" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="start">Thứ hạng: 100</text>

              <text x="55" y="212" fill="#94A3B8" fontSize="9" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="middle">Ngày -30</text>
              <text x="360" y="212" fill="#94A3B8" fontSize="9" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="middle">Ngày -15</text>
              <text x="665" y="212" fill="#94A3B8" fontSize="9" fontWeight="605" fontFamily="var(--font-sans)" textAnchor="middle">Hôm nay (D0)</text>
            </svg>
          </div>
        </div>
      )}

    </div>
  );
}
