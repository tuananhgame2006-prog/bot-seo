import React from 'react';
import { PipelineStats, PublishedPost } from '../types';
import { Search, Edit3, Globe, Award, X, Trophy, Coins, ThumbsUp, Eye, Medal } from 'lucide-react';

interface MetricsBoardProps {
  stats: PipelineStats;
  published: PublishedPost[];
}

export default function MetricsBoard({ stats, published = [] }: MetricsBoardProps) {
  const [showRankingModal, setShowRankingModal] = React.useState(false);

  // Volume estimations
  const keywordPercent = Math.min((stats.keywordsFound / 20) * 100, 100);
  const draftsPercent = Math.min((stats.draftsPending / 10) * 100, 100);
  const postsPercent = Math.min((stats.postsPublished / 10) * 100, 100);

  // Sort published articles by APE score descending
  const sortedArticles = React.useMemo(() => {
    return [...published].sort((a, b) => (b.apeScore || 0) - (a.apeScore || 0));
  }, [published]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 shrink-0 border-b border-slate-200 bg-slate-50/50 relative">
      
      {/* Card 1: Keywords found */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350 select-none">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            01. TỪ KHÓA ĐÃ QUÉT
          </p>
          <Search className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.keywordsFound}</h2>
          <span className="text-[10px] text-slate-400 font-medium font-sans">tổng số</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: `${keywordPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 2: Drafts Pending */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350 select-none">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            02. BẢN NHÁP CHỜ DUYỆT
          </p>
          <Edit3 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.draftsPending}</h2>
          <span className="text-[10px] text-slate-400 font-medium font-sans">nội dung</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-500" 
            style={{ width: `${draftsPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 3: CMS Index */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350 select-none">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            03. ĐÃ XUẤT BẢN
          </p>
          <Globe className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.postsPublished}</h2>
          <span className="text-[10px] text-slate-400 font-medium font-sans font-sans">ở CMS</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
            style={{ width: `${postsPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 4: Average APE Ranking Score - Clickable to show modal leaderboard */}
      <button 
        type="button"
        id="btn-ape-ranking"
        onClick={() => setShowRankingModal(true)}
        className="text-left w-full bg-blue-50/70 border border-blue-200/80 hover:bg-blue-50 hover:border-blue-350 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-blue-700 tracking-wider font-sans flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>04. Xếp hạng APE trung bình</span>
          </p>
          <Award className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.averageApeScore !== undefined ? stats.averageApeScore.toFixed(2) : '0.00'}
          </h2>
          <span className="text-[10px] text-blue-600 font-bold group-hover:underline">
            BẢNG XẾP HẠNG ➔
          </span>
        </div>
        <div className="h-1 bg-blue-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: `${(stats.averageApeScore || 0) * 10}%` }} 
          />
        </div>
      </button>

      {/* LEAD_BOARD OVERLAY MODAL */}
      {showRankingModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">
                    Bảng Xếp Hạng Chất Lượng APE (Average Performance Evaluation)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-1.5">
                    Thứ tự bài viết có mức độ bám đuổi từ khóa và tương tác tốt nhất
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowRankingModal(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors font-semibold flex items-center justify-center border border-slate-200 cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="text-[11px] font-bold">ĐÓNG</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {sortedArticles.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Medal className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-500 font-semibold text-sm">
                    Chưa có bài viết nào hoạt động trên hệ thống!
                  </p>
                  <p className="text-slate-400 text-xs text-center max-w-md mx-auto">
                    Sau khi hoàn thành bước viết bài và phê duyệt thủ công, hãy tiến hành "Xuất bản Hệ thống" (Stage 03) để đồng bộ bài viết và thiết lập thứ hạng APE đầu tiên.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center w-16">Thứ hạng</th>
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider">Tiêu đề bài viết</th>
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Số Tokens</th>
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Lượt Likes</th>
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Lượt Truy Cập</th>
                        <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-right w-28">Điểm APE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {sortedArticles.map((article, index) => {
                        const rank = index + 1;
                        let rankPill = null;
                        if (rank === 1) {
                          rankPill = <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-full flex items-center justify-center gap-1 text-[10px] w-9 mx-auto">🥇 1</span>;
                        } else if (rank === 2) {
                          rankPill = <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-extrabold rounded-full flex items-center justify-center gap-1 text-[10px] w-9 mx-auto">🥈 2</span>;
                        } else if (rank === 3) {
                          rankPill = <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 font-extrabold rounded-full flex items-center justify-center gap-1 text-[10px] w-9 mx-auto">🥉 3</span>;
                        } else {
                          rankPill = <span className="font-mono text-slate-500 font-bold block text-center">{rank}</span>;
                        }

                        return (
                          <tr key={article.id || index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 text-center">{rankPill}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-sm truncate" title={article.title}>
                              {article.title}
                              {article.platform && (
                                <span className="ml-2 inline-block px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[8px] font-extrabold rounded uppercase tracking-wider border border-blue-105">
                                  {article.platform}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-mono font-bold text-slate-600 flex items-center justify-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-blue-500" />
                                {article.tokensConsumed !== undefined ? article.tokensConsumed?.toLocaleString() : 'N/A'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-mono font-bold text-emerald-600 flex items-center justify-center gap-1">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {article.likes !== undefined ? article.likes?.toLocaleString() : '0'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-mono font-bold text-slate-600 flex items-center justify-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {article.visits !== undefined ? article.visits?.toLocaleString() : '0'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="font-mono font-extrabold text-blue-700 text-sm">
                                  {(article.apeScore || 0).toFixed(2)}
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase font-medium">/ 10</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-200/80 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Hạ tầng phân tích Swarm APE Engine</span>
              <span>Tổng số: {published.length} bài viết xuất bản</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
