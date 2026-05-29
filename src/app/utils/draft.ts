/**
 * Draft management for auto-save functionality
 */

import { IndicatorData } from '../types';

const DRAFT_PREFIX = 'draft_';
const AUTO_SAVE_INTERVAL = 5000; // ⚡ 5 seconds (faster auto-save)
const DEBOUNCE_DELAY = 2000; // ⚡ 2 seconds debounce (prevent spam)

export class DraftManager {
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastSaveData: string | null = null;

  /**
   * Save draft to localStorage (with deduplication)
   */
  saveDraft(branchId: string, userNik: string, data: Record<string, IndicatorData>) {
    const draftKey = `${DRAFT_PREFIX}${branchId}_${userNik}`;
    const draft = {
      data,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };

    try {
      const draftJson = JSON.stringify(draft);

      // 🔥 DEDUPLICATION: Skip if data hasn't changed
      if (this.lastSaveData === draftJson) {
        console.log('⏭️ Draft unchanged, skipping save');
        return true;
      }

      localStorage.setItem(draftKey, draftJson);
      this.lastSaveData = draftJson;
      console.log('💾 Draft saved:', draftKey);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }

  /**
   * Save draft with debouncing (prevent spam)
   */
  saveDraftDebounced(branchId: string, userNik: string, data: Record<string, IndicatorData>) {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.saveDraft(branchId, userNik, data);
      this.debounceTimer = null;
    }, DEBOUNCE_DELAY);
  }

  /**
   * Load draft from localStorage
   */
  loadDraft(branchId: string, userNik: string): Record<string, IndicatorData> | null {
    const draftKey = `${DRAFT_PREFIX}${branchId}_${userNik}`;

    try {
      const draftJson = localStorage.getItem(draftKey);
      if (!draftJson) return null;

      const draft = JSON.parse(draftJson);

      // Check if draft is not too old (24 hours)
      const hoursSinceSave = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSave > 24) {
        this.clearDraft(branchId, userNik);
        return null;
      }

      console.log('Draft loaded:', draftKey);
      return draft.data;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  clearDraft(branchId: string, userNik: string) {
    const draftKey = `${DRAFT_PREFIX}${branchId}_${userNik}`;
    localStorage.removeItem(draftKey);
    console.log('Draft cleared:', draftKey);
  }

  /**
   * Get draft info (timestamp, etc.)
   */
  getDraftInfo(branchId: string, userNik: string): { timestamp: number; date: string } | null {
    const draftKey = `${DRAFT_PREFIX}${branchId}_${userNik}`;

    try {
      const draftJson = localStorage.getItem(draftKey);
      if (!draftJson) return null;

      const draft = JSON.parse(draftJson);
      return {
        timestamp: draft.timestamp,
        date: draft.date,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if draft exists
   */
  hasDraft(branchId: string, userNik: string): boolean {
    const draftKey = `${DRAFT_PREFIX}${branchId}_${userNik}`;
    return localStorage.getItem(draftKey) !== null;
  }

  /**
   * Clear debounce timer
   */
  clearDebounce() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(
    branchId: string,
    userNik: string,
    getData: () => Record<string, IndicatorData>
  ) {
    this.stopAutoSave();

    this.autoSaveTimer = setInterval(() => {
      const data = getData();
      // Only save if there's actual data
      const hasData = Object.values(data).some(
        (d) => d.value || (d.photos && d.photos.length > 0) || d.textValue || d.dropdownValue || d.checkboxValue
      );

      if (hasData) {
        this.saveDraft(branchId, userNik, data);
      }
    }, AUTO_SAVE_INTERVAL);

    console.log('Auto-save started (every 30s)');
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('Auto-save stopped');
    }
  }

  /**
   * Get all drafts for cleanup
   */
  getAllDrafts(): string[] {
    const drafts: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        drafts.push(key);
      }
    }
    return drafts;
  }

  /**
   * Clean old drafts (older than 7 days)
   */
  cleanOldDrafts() {
    const drafts = this.getAllDrafts();
    let cleaned = 0;

    drafts.forEach((key) => {
      try {
        const draftJson = localStorage.getItem(key);
        if (draftJson) {
          const draft = JSON.parse(draftJson);
          const daysSinceSave = (Date.now() - draft.timestamp) / (1000 * 60 * 60 * 24);

          if (daysSinceSave > 7) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        // Remove corrupted drafts
        localStorage.removeItem(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} old drafts`);
    }
  }
}

// Singleton instance
export const draftManager = new DraftManager();
