import React from 'react';
import { Terminal, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  logFilter: string;
  setLogFilter: (filter: string) => void;
  logTerminalEndRef: React.RefObject<HTMLDivElement>;
}

export default function TerminalLog({
  logs,
  filteredLogs,
  logFilter,
  setLogFilter,
  logTerminalEndRef
}: TerminalLogProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  // Group all logs together in chronological descending/ascending order
  // We will display all logs (logs array instead of filteredLogs) for a unified feed.
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  React.useEffect(() => {
    // Auto-expand logs when a new entry arrives to alert the user
    if (logs.length > 0) {
      setIsCollapsed(false);
    }
  }, [logs.length]);

  return (
    <div className="p-5 pt-0 shrink-0 font-sans">
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl transition-all duration-300">
        
        {/* Terminal Header Bar */}
        <div className="bg-slate-950 px-4 py-3 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="p-1 px-1.5 bg-blue-500/10 text-blue-400 rounded-md shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Nhật ký Luồng Gộp (Consolidated Agent Log)
              </span>
              
              {/* If collapsed, show a nice preview of the last system activity */}
              {isCollapsed && latestLog ? (
                <p className="text-[11px] font-mono text-emerald-400 truncate animate-pulse">
                  [{new Date(latestLog.timestamp).toLocaleTimeString()}] [{latestLog.agent}] {latestLog.message}
                </p>
              ) : isCollapsed ? (
                <p className="text-[11px] font-mono text-slate-500 italic">
                  Chưa có hoạt động nào được ghi nhận.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4 shrink-0">
            {/* Collapse / Expand Toggle Button */}
            <button
              id="toggle-terminal-log"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer border border-slate-700 hover:border-slate-600 shadow-sm"
            >
              {isCollapsed ? (
                <>
                  <span>Mở Rộng Log</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Thu Nhỏ Log</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>
          </div>
        </div>

        {/* Scrollable log list - displayed only if expanded */}
        {!isCollapsed && (
          <div className="h-44 overflow-y-auto bg-slate-950/80 p-4 font-mono text-xs space-y-2 flex flex-col scrollbar-thin border-b border-slate-800">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic font-medium p-2">
                Hiện chưa ghi nhận nhật ký của hệ thống Swarm. Kích hoạt Swarm Agent từ thanh tác vụ để bắt đầu ghi nhật ký trực tiếp.
              </p>
            ) : (
              logs.map(log => {
                const colorMap = {
                  info: 'text-slate-300',
                  success: 'text-emerald-400 font-bold',
                  warning: 'text-amber-400 font-bold',
                  error: 'text-rose-400 font-semibold'
                };

                return (
                  <div key={log.id} className="flex items-start gap-2.5 leading-relaxed text-[11px] hover:bg-slate-900/50 p-1 rounded transition-colors">
                    <span className="text-slate-600 font-normal shrink-0 select-none">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-extrabold shrink-0 border ${
                      log.agent === 'Scout' ? 'bg-blue-950/80 text-blue-300 border-blue-900/50' :
                      log.agent === 'Writer' ? 'bg-amber-950/80 text-amber-300 border-amber-900/50' :
                      log.agent === 'Reviewer' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-900/50' :
                      log.agent === 'Publisher' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-900/50 font-bold' :
                      log.agent === 'Tracker' ? 'bg-purple-950/80 text-purple-300 border-purple-900/50 font-bold' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {log.agent}
                    </span>
                    <span className={`flex-grow font-mono ${colorMap[log.type]}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={logTerminalEndRef} />
          </div>
        )}

        {/* Footer info system status */}
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 p-2 px-4 bg-slate-950 select-none">
          <span className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
            <span>KẾT NỐI AN TOÀN SWARM EMPIRE PIPELINE • VIETNAMESE EDITION</span>
          </span>
          <span>SQLite ACTIVE • LOG AUTO-FLUSH</span>
        </div>

      </div>
    </div>
  );
}
