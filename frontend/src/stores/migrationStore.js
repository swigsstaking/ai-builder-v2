import { create } from 'zustand';
import { migrationApi } from '../services/api';

const useMigrationStore = create((set, get) => ({
  migration: null,
  status: 'idle', // idle | analyzing | analyzed | mapping | mapped | creating | done | error
  error: null,

  /** Start analysis of a URL */
  startAnalysis: async (sourceUrl, mode = 'faithful') => {
    set({ status: 'analyzing', error: null, migration: null });
    try {
      const { migrationId } = await migrationApi.analyze({ sourceUrl, mode });
      set({ migration: { _id: migrationId, sourceUrl, status: 'pending' } });
      return migrationId;
    } catch (err) {
      set({ status: 'error', error: err.error || err.message || 'Erreur' });
      throw err;
    }
  },

  /** Poll migration status until it reaches a terminal state */
  pollStatus: async (migrationId) => {
    const poll = async () => {
      try {
        const { migration } = await migrationApi.getStatus(migrationId);
        set({ migration, status: migration.status });

        if (['analyzed', 'mapped', 'done', 'error'].includes(migration.status)) {
          if (migration.status === 'error') {
            set({ error: migration.error });
          }
          return migration;
        }

        // Continue polling
        await new Promise(r => setTimeout(r, 2000));
        return poll();
      } catch (err) {
        set({ status: 'error', error: err.error || 'Erreur de communication' });
        throw err;
      }
    };
    return poll();
  },

  /** Update extracted content (user edits) */
  updateExtracted: async (migrationId, extractedContent, designStyle) => {
    const data = {};
    if (extractedContent) data.extractedContent = extractedContent;
    if (designStyle) data.designStyle = designStyle;
    const { migration } = await migrationApi.updateExtracted(migrationId, data);
    set({ migration });
    return migration;
  },

  /** Trigger content-to-section mapping */
  triggerMapping: async (migrationId, designStyle) => {
    set({ status: 'mapping' });
    try {
      const { migration } = await migrationApi.triggerMapping(migrationId, { designStyle });
      set({ migration, status: migration.status });
      return migration;
    } catch (err) {
      set({ status: 'error', error: err.error || 'Erreur de mapping' });
      throw err;
    }
  },

  /** Update section mapping (user edits) */
  updateMapping: async (migrationId, sectionMapping, designStyle) => {
    const data = { sectionMapping };
    if (designStyle) data.designStyle = designStyle;
    const { migration } = await migrationApi.updateMapping(migrationId, data);
    set({ migration });
    return migration;
  },

  /** Create site from migration */
  createSite: async (migrationId, siteData = {}) => {
    set({ status: 'creating' });
    try {
      const result = await migrationApi.createSite(migrationId, siteData);
      set({ migration: result.migration, status: 'done' });
      return result;
    } catch (err) {
      set({ status: 'error', error: err.error || 'Erreur de création' });
      throw err;
    }
  },

  /** Cancel and cleanup */
  cancel: async (migrationId) => {
    try {
      await migrationApi.cancel(migrationId);
    } catch {}
    set({ migration: null, status: 'idle', error: null });
  },

  /** Reset store */
  reset: () => set({ migration: null, status: 'idle', error: null }),
}));

export default useMigrationStore;
