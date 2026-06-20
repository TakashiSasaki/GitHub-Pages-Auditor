import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuditCollectionPath, getEnvironmentName } from '../lib/firestorePaths';
import { extractLauncherSites, applySavedOrder, LauncherSite } from '../lib/launcherSites';
import { getLauncherLayout, saveLauncherLayout } from '../lib/launcherLayout';
import { AlertCircle, ChevronLeft, ChevronRight, RotateCcw, ExternalLink, Loader2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LauncherPage() {
  const { user } = useAuth();
  const isAnonymous = !!user?.isAnonymous;
  const env = getEnvironmentName(import.meta.env.MODE);

  const [sites, setSites] = useState<LauncherSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }

      if (isAnonymous) {
        setLoading(false);
        return;
      }

      try {
        const path = getAuditCollectionPath(env, user.uid);
        const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setLoading(false);
          return;
        }

        const data = snap.docs[0].data();
        if (!data.results || !Array.isArray(data.results)) {
          setLoading(false);
          return;
        }

        const rawSites = extractLauncherSites(data.results);
        const layout = await getLauncherLayout(user.uid, isAnonymous, env);
        
        if (layout && layout.orderedSiteIds) {
          setSites(applySavedOrder(rawSites, layout.orderedSiteIds));
        } else {
          setSites(rawSites);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load launcher sites.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isAnonymous, env]);

  const handleMove = async (index: number, direction: -1 | 1) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === sites.length - 1)) return;
    const newSites = [...sites];
    const temp = newSites[index];
    newSites[index] = newSites[index + direction];
    newSites[index + direction] = temp;
    setSites(newSites);
    
    // Save
    setSaving(true);
    try {
      await saveLauncherLayout(user!.uid, isAnonymous, newSites.map(s => s.id), env);
    } catch (e) {
      console.warn("Failed to save layout order", e);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!user || isAnonymous) return;
    setSaving(true);
    try {
      const path = getAuditCollectionPath(env, user.uid);
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(1));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const rawSites = extractLauncherSites(snap.docs[0].data().results || []);
        setSites(rawSites);
        await saveLauncherLayout(user.uid, isAnonymous, rawSites.map(s => s.id), env);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
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

  if (!user || sites.length === 0) {
    let message = 'Run an audit from the dashboard to populate the launcher.';
    if (!user) {
      message = 'You must be logged in to view the launcher.';
    } else if (isAnonymous) {
      message = 'Guest launcher is available after a persisted audit. Sign in with Google or run an audit from the dashboard.';
    }

    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans p-6 items-center justify-center">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-500 shadow-sm">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No GitHub Pages sites detected.</h2>
        <p className="text-slate-600 mb-6 text-center max-w-sm">
          {message}
        </p>
        <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 bg-slate-50 p-6 md:p-10 font-sans h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Launcher</h1>
            <p className="text-sm text-slate-500">Launch detected GitHub Pages sites</p>
          </div>
          <button 
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Order</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sites.map((site, index) => (
            <div key={site.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xl uppercase tracking-wider select-none shrink-0 border border-slate-200">
                  {site.name.charAt(0)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0 || saving}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move earlier"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMove(index, 1)}
                    disabled={index === sites.length - 1 || saving}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move later"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 flex-grow">
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-1 inline-flex items-center gap-1 group/link"
                >
                  {site.name}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
                <p className="text-xs text-slate-500 truncate" title={site.ownerRepo}>{site.ownerRepo}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[140px]" title={site.hostname}>
                  {site.hostname}
                </span>
                {site.httpsState === 'enforced' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                    HTTPS
                  </span>
                )}
                {site.deploymentMethod === 'workflow' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    Workflow
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
