import { useState, useCallback, useEffect } from 'react';
import { getLauncherLayout, saveLauncherLayout, LauncherLayoutDoc } from '../lib/launcherLayout';

export function useLauncherLayout(uid: string | undefined, isAnonymous: boolean, env: string) {
  const [orderedSiteIds, setOrderedSiteIds] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setOrderedSiteIds(null);
      setLayoutLoading(true);

      if (!uid) {
        if (active) {
          setLayoutLoading(false);
        }
        return;
      }

      try {
        const layout = await getLauncherLayout(uid, isAnonymous, env);
        if (active) {
          if (layout && layout.orderedSiteIds) {
            setOrderedSiteIds(layout.orderedSiteIds);
          } else {
            setOrderedSiteIds(null);
          }
        }
      } catch (e) {
        if (active) {
          console.warn("Failed to load launcher layout", e);
          setOrderedSiteIds(null);
        }
      } finally {
        if (active) {
          setLayoutLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [uid, isAnonymous, env]);

  const saveOrder = useCallback(async (ids: string[]) => {
    if (!uid) return;

    // Optimistic UI update
    setOrderedSiteIds(ids);
    setSaving(true);
    setSaveWarning(null);

    try {
      await saveLauncherLayout(uid, isAnonymous, ids, env);
    } catch (e) {
      console.warn("Failed to save layout order", e);
      setSaveWarning("Could not save your layout to the server. Your changes are visible locally but will not persist.");
    }
    setSaving(false);
  }, [uid, isAnonymous, env]);

  const clearWarning = useCallback(() => {
    setSaveWarning(null);
  }, []);

  return {
    orderedSiteIds,
    saving,
    saveWarning,
    layoutLoading,
    saveOrder,
    clearWarning
  };
}
