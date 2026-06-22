import React from 'react';
import { Settings, AlertCircle, GitBranch, Globe, Lock } from 'lucide-react';
import { RepositoryResult } from '../../types';

interface ReportRowProps {
  repo: RepositoryResult;
  serialNumber: number;
  style?: React.CSSProperties;
}

// Help component to render unlock icon gracefully
function UnlockWarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

export const ReportRow: React.FC<ReportRowProps> = React.memo(({ repo, serialNumber, style }) => {
  return (
    <tr style={style} className="hover:bg-slate-50 border-b border-slate-100 transition-colors group">
      
      {/* Serial Number */}
      <td className="text-center text-[10px] text-slate-400 font-mono px-1 py-2 border-r border-slate-100 align-middle">
        <div className="flex flex-col items-center justify-center gap-1">
          <span>{serialNumber}</span>
          <a 
            href={repo.pagesSettingsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 outline-none focus:ring-2 focus:ring-slate-300 rounded-sm"
            title="Pages Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>

      {/* Repository name with fork badge */}
      <td className="px-3 py-2 border-r border-slate-100 align-middle overflow-hidden">
        <div className="flex flex-col min-w-0 font-sans overflow-hidden">
          <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-xs whitespace-normal break-words [overflow-wrap:anywhere] min-w-0 max-w-full leading-tight" title={repo.fullName}>
            {repo.repoName}
          </a>
          <div className="flex flex-wrap items-center gap-1 mt-1 min-w-0 w-full overflow-hidden">
            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider leading-none shrink-0 ${repo.visibility === 'public' ? 'bg-sky-50 text-sky-700 border border-sky-150' : 'bg-amber-50 text-amber-700 border border-amber-150'}`}>
              {repo.visibility}
            </span>
            {repo.isFork && (
              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider leading-none bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                Fork
              </span>
            )}
            {repo.archived && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider leading-none bg-orange-50 text-orange-600 border border-orange-150 shrink-0">
                Archived
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Pages Status badge */}
      <td className="px-3 py-2 align-middle border-r border-slate-100 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <div className="truncate">
            {repo.hasPages ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-150 font-sans truncate max-w-full" title={`Active (${repo.pagesStatus || 'configured'})`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse shrink-0"></span>
                <span className="truncate">Active ({repo.pagesStatus || 'configured'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-550 border border-gray-200 font-sans select-none shrink-0 animate-none truncate max-w-full" title="Disabled">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-1 shrink-0"></span>
                Disabled
              </span>
            )}
          </div>
          {repo.errorClassification && (
            <div className="text-[9px] text-red-500 mt-0.5 flex items-center gap-1 font-sans truncate max-w-full" title={repo.errorClassification}>
              <AlertCircle className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
              <span className="truncate">{repo.errorClassification}</span>
            </div>
          )}
        </div>
      </td>

      {/* Deployment method & publishing branch */}
      <td className="px-3 py-2 align-middle border-r border-slate-100 overflow-hidden">
        <div className="flex flex-col min-w-0">
          {repo.hasPages ? (
            <div className="space-y-0.5 min-w-0 overflow-hidden">
              <div className="flex items-center text-gray-750 text-xs gap-1 min-w-0" title={repo.deploymentMethod}>
                <GitBranch className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="font-sans font-medium truncate">{repo.deploymentMethod}</span>
              </div>
              {repo.publishingSourceSummary && (
                <div className="text-[9px] text-gray-400 select-all font-mono truncate" title={repo.publishingSourceSummary}>
                  {repo.publishingSourceSummary}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </td>

      {/* Custom Domain and Verification Status */}
      <td className="px-3 py-2 align-middle border-r border-slate-100 overflow-hidden">
        <div className="flex flex-col min-w-0">
          {repo.cname ? (
            <div className="space-y-0.5 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 text-gray-800 font-sans leading-none min-w-0">
                <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-xs truncate block" title={repo.cname}>{repo.cname}</span>
              </div>
              
              <div className="truncate">
                {repo.customDomainStatus === 'custom_domain_verified' ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider leading-none uppercase bg-green-50 text-green-700 border border-green-150 font-sans truncate" title="Verified">
                    Verified
                  </span>
                ) : repo.customDomainStatus === 'custom_domain_pending' ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider leading-none uppercase bg-amber-50 text-amber-700 border border-amber-150 font-sans truncate" title="Pending Verification">
                    Pending Verification
                  </span>
                ) : (
                  <span 
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-105 cursor-help font-sans truncate"
                    title="カスタムドメイン（CNAME）が設定されています。GitHubの「ドメイン所有権検証」機能が未設定のためAPI上はUnverified/Unknownとなっていますが、HTTPS証明書が承認されていれば安全に動作しています。"
                  >
                    Configured
                  </span>
                )}
              </div>
            </div>
          ) : repo.hasPages ? (
            <span className="text-[11px] text-gray-400 font-normal font-sans truncate" title="GitHub standard URL">GitHub standard URL</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </td>

      {/* HTTPS and Enforcement */}
      <td className="px-3 py-2 align-middle overflow-hidden text-gray-500">
        <div className="flex flex-col min-w-0">
          {repo.hasPages ? (
            <div className="space-y-0.5 min-w-0 overflow-hidden">
              {repo.httpsCertificateStatus === 'https_certificate_ok' ? (
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-sans min-w-0" title="HTTPS Enforced & SSL OK">
                  <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">HTTPS Enforced & SSL OK</span>
                </div>
              ) : repo.httpsCertificateStatus === 'https_not_enforced' ? (
                <div className="flex items-center gap-1 text-amber-605 text-xs font-sans min-w-0" title="Approved but Not Enforced">
                  <UnlockWarningIcon className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">Approved but Not Enforced</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-650 text-xs font-sans min-w-0" title="SSL Configuration Issue">
                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span className="truncate">SSL Configuration Issue</span>
                </div>
              )}
              
              {repo.httpsCertificateState && (
                <div className="text-[9px] text-gray-450 font-sans truncate" title={`Cert status: ${repo.httpsCertificateState}`}>
                  Cert status: <span className="font-mono text-gray-550 select-all truncate">{repo.httpsCertificateState}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </td>
    </tr>
  );
});

ReportRow.displayName = 'ReportRow';
