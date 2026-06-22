import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ReportTableHeaderProps {
  setColumnGuideModal: (column: string | null) => void;
}

export const ReportTableHeader: React.FC<ReportTableHeaderProps> = ({ setColumnGuideModal }) => {
  return (
    <thead className="bg-slate-50 font-mono">
      <tr>
        <th scope="col" className="sticky top-0 z-50 bg-slate-50 px-1 py-2 text-center font-bold text-slate-400 uppercase text-[10px] border-r border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          #
        </th>
        <th scope="col" className="sticky top-0 z-50 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-r border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="whitespace-normal break-words [overflow-wrap:anywhere] leading-tight font-sans">
              Repository
            </span>
            <button
              type="button"
              onClick={() => setColumnGuideModal('repository')}
              className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors self-start cursor-pointer"
              title="View Repository details"
              aria-label="Explain Repository column"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </th>
        <th scope="col" className="sticky top-0 z-40 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="whitespace-normal break-words [overflow-wrap:anywhere] leading-tight font-sans">
              Pages Status
            </span>
            <button
              type="button"
              onClick={() => setColumnGuideModal('pagesStatus')}
              className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors self-start cursor-pointer"
              title="View Pages Status details"
              aria-label="Explain Pages Status column"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </th>
        <th scope="col" className="sticky top-0 z-40 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="whitespace-normal break-words [overflow-wrap:anywhere] leading-tight font-sans">
              Deploy Source
            </span>
            <button
              type="button"
              onClick={() => setColumnGuideModal('deploySource')}
              className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors self-start cursor-pointer"
              title="View Deploy Source details"
              aria-label="Explain Deploy Source column"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </th>
        <th scope="col" className="sticky top-0 z-40 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="whitespace-normal break-words [overflow-wrap:anywhere] leading-tight font-sans">
              Custom Domain
            </span>
            <button
              type="button"
              onClick={() => setColumnGuideModal('customDomain')}
              className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors self-start font-sans cursor-pointer"
              title="View Custom Domain details"
              aria-label="Explain Custom Domain column"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </th>
        <th scope="col" className="sticky top-0 z-40 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="whitespace-normal break-words [overflow-wrap:anywhere] leading-tight font-sans">
              HTTPS & Security
            </span>
            <button
              type="button"
              onClick={() => setColumnGuideModal('https')}
              className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors self-start cursor-pointer"
              title="View HTTPS & Security details"
              aria-label="Explain HTTPS & Security column"
                >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </th>
      </tr>
    </thead>
  );
};
