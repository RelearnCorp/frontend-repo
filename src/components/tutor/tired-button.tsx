import React from 'react';

interface TiredButtonProps {
  mode: 'socratic' | 'explainable';
  onClick: () => void;
}

export const TiredButton: React.FC<TiredButtonProps> = ({ mode, onClick }) => {
  const isSocratic = mode === 'socratic';

  return (
    <div className="flex justify-center my-3">
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center gap-3 rounded-full border border-gray-700 bg-[#18181b] px-5 py-2 text-xs font-medium text-gray-200 hover:border-gray-500 hover:bg-[#202024] transition-all shadow-md active:scale-95"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-gray-300 group-hover:bg-gray-700 text-[10px]">
          ⚡
        </span>
        <div className="text-left">
          <p className="leading-tight font-semibold">
            {isSocratic ? "I'm Tired / I Give Up" : "Back to Socratic Mode"}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight">
            {isSocratic ? "Switch to Step-by-Step Explanation" : "Re-enable Guided Questioning"}
          </p>
        </div>
      </button>
    </div>
  );
};