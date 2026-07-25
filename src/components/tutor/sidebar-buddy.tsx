import React from 'react';

interface SidebarBuddyProps {
  hint?: string;
  onNudgeClick?: () => void;
}

export const SidebarBuddy: React.FC<SidebarBuddyProps> = ({
  hint = "Think about the relationship between velocity and mass. If the mass doubles but the velocity stays the same, what happens to the total energy?",
  onNudgeClick
}) => {
  return (
    <aside className="w-80 border-r border-gray-800 bg-[#121214] p-4 text-gray-300 flex flex-col gap-6 text-xs shrink-0">
      {/* Hint Buddy Box */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
            <span>💡</span> HINT BUDDY
          </div>
          <span className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[9px] text-amber-300">
            Nudge Ready
          </span>
        </div>

        <p className="italic text-gray-300 leading-relaxed my-2">
          "{hint}"
        </p>

        <button 
          onClick={onNudgeClick}
          className="text-amber-400 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 mt-3 transition-colors"
        >
          Tell me more &rsaquo;
        </button>
      </div>

      {/* Quick Review Section */}
      <div>
        <div className="flex items-center justify-between mb-3 text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
          <span>📋 QUICK REVIEW</span>
          <span className="text-gray-500">4 Cards</span>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-gray-800 bg-[#18181b] p-3">
            <h4 className="font-semibold text-gray-200 text-xs">Work-Energy Principle</h4>
            <p className="text-gray-400 text-[11px] mt-1 leading-snug">
              The net work done on an object equals its change in KE.
            </p>
          </div>

          <div className="rounded-lg border border-gray-800/60 bg-[#18181b]/50 p-3 opacity-70">
            <h4 className="font-semibold text-gray-300 text-xs">Conservative Forces</h4>
            <p className="text-gray-500 text-[11px] mt-1 leading-snug">
              Forces where total work done is independent of path.
            </p>
          </div>
        </div>
      </div>

      {/* Mini Map Placeholder */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2 text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
          <span className="flex items-center gap-1">📍 MINI MAP</span>
          <span className="text-gray-500 cursor-pointer hover:text-gray-300">⤢</span>
        </div>
        <div className="h-28 rounded-lg border border-gray-800 bg-[#18181b] flex items-center justify-center text-gray-600 text-[10px]">
          Concept Tree Preview
        </div>
      </div>
    </aside>
  );
};