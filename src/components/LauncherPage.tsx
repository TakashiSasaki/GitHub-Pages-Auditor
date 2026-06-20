import React from 'react';
import { useAuth } from '../AuthContext';
import { getEnvironmentName } from '../lib/firestorePaths';
import LauncherGrid from './LauncherGrid';
import { useLatestAuditResults } from '../hooks/useLatestAuditResults';
import { useLauncherLayout } from '../hooks/useLauncherLayout';
import { useLauncherSitesFromResults } from '../hooks/useLauncherSitesFromResults';
import { applyLocalOrderChange } from '../lib/launcherSites';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LauncherPage() {
  const { user } = useAuth();
  const isAnonymous = !!user?.isAnonymous;
  const env = getEnvironmentName(import.meta.env.MODE);

  const { results, loading: resultsLoading, error } = useLatestAuditResults(user?.uid, isAnonymous, env);
  const { orderedSiteIds, saving, saveWarning, layoutLoading, saveOrder } = useLauncherLayout(user?.uid, isAnonymous, env);

  const { sites, defaultOrderedSiteIds } = useLauncherSitesFromResults(results, orderedSiteIds);

  const loading = resultsLoading || layoutLoading;

  const handleMove = async (index: number, direction: -1 | 1) => {
    const currentIds = sites.map(s => s.id);
    const newIds = applyLocalOrderChange(currentIds, index, direction);
    await saveOrder(newIds);
  };

  const handleReset = async () => {
    if (!user || isAnonymous) return;
    await saveOrder(defaultOrderedSiteIds);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  let emptyMessage = 'Run an audit from the dashboard to populate the launcher.';
  if (!user) {
    emptyMessage = 'You must be logged in to view the launcher.';
  } else if (isAnonymous) {
    emptyMessage = 'Guest launcher is available after a persisted audit. Sign in with Google or run an audit from the dashboard.';
  }

  return (
    <LauncherGrid
      sites={sites}
      saving={saving}
      saveWarning={saveWarning}
      emptyMessage={emptyMessage}
      emptyActionLabel="Go to Dashboard"
      emptyActionTo="/"
      showEmptyAction={true}
      onMove={handleMove}
      onReset={handleReset}
      showReset={true}
      readOnly={false}
    />
  );
}
