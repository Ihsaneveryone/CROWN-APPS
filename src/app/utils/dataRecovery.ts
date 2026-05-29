import { Branch, Submission, Indicator } from '../types';

/**
 * 🆘 EMERGENCY DATA RECOVERY SYSTEM
 * Untuk restore data yang hilang karena server error
 */

const STORAGE_KEYS = {
  BRANCHES_BACKUP: 'branches_backup',
  SUBMISSIONS_BACKUP: 'submissions_backup',
  INDICATORS_BACKUP: 'indicators_backup',
  LAST_SYNC: 'last_sync_timestamp',
  RECOVERY_LOG: 'recovery_log'
};

interface RecoveryLog {
  timestamp: string;
  action: string;
  dataType: string;
  itemCount: number;
  success: boolean;
}

export class DataRecovery {
  // ============= LOGGING =============
  private static log(action: string, dataType: string, itemCount: number, success: boolean) {
    const logEntry: RecoveryLog = {
      timestamp: new Date().toISOString(),
      action,
      dataType,
      itemCount,
      success
    };

    const logs = this.getRecoveryLogs();
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem(STORAGE_KEYS.RECOVERY_LOG, JSON.stringify(logs));
    console.log(`📝 Recovery Log: ${action} ${dataType} (${itemCount} items) - ${success ? '✅' : '❌'}`);
  }

  static getRecoveryLogs(): RecoveryLog[] {
    try {
      const logs = localStorage.getItem(STORAGE_KEYS.RECOVERY_LOG);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  // ============= BRANCHES =============
  static backupBranches(branches: Branch[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCHES_BACKUP, JSON.stringify(branches));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      this.log('BACKUP', 'branches', branches.length, true);
      console.log('💾 Branches backed up:', branches.length);
    } catch (error) {
      console.error('Failed to backup branches:', error);
      this.log('BACKUP', 'branches', 0, false);
    }
  }

  static recoverBranches(): Branch[] | null {
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.BRANCHES_BACKUP);
      if (backup) {
        const branches = JSON.parse(backup);
        this.log('RECOVER', 'branches', branches.length, true);
        console.log('🆘 Recovered branches from backup:', branches.length);
        return branches;
      }
      return null;
    } catch (error) {
      console.error('Failed to recover branches:', error);
      this.log('RECOVER', 'branches', 0, false);
      return null;
    }
  }

  // ============= SUBMISSIONS =============
  static backupSubmissions(branchId: string, submissions: Submission[]) {
    try {
      const allBackups = this.getAllSubmissionBackups();
      allBackups[branchId] = submissions;
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS_BACKUP, JSON.stringify(allBackups));
      this.log('BACKUP', `submissions_${branchId}`, submissions.length, true);
      console.log(`💾 Submissions backed up for ${branchId}:`, submissions.length);
    } catch (error) {
      console.error('Failed to backup submissions:', error);
      this.log('BACKUP', `submissions_${branchId}`, 0, false);
    }
  }

  static recoverSubmissions(branchId: string): Submission[] | null {
    try {
      const allBackups = this.getAllSubmissionBackups();
      const submissions = allBackups[branchId];
      if (submissions) {
        this.log('RECOVER', `submissions_${branchId}`, submissions.length, true);
        console.log(`🆘 Recovered submissions for ${branchId}:`, submissions.length);
        return submissions;
      }
      return null;
    } catch (error) {
      console.error('Failed to recover submissions:', error);
      this.log('RECOVER', `submissions_${branchId}`, 0, false);
      return null;
    }
  }

  private static getAllSubmissionBackups(): Record<string, Submission[]> {
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS_BACKUP);
      return backup ? JSON.parse(backup) : {};
    } catch {
      return {};
    }
  }

  // ============= INDICATORS =============
  static backupIndicators(branchId: string, indicators: Indicator[]) {
    try {
      const allBackups = this.getAllIndicatorBackups();
      allBackups[branchId] = indicators;
      localStorage.setItem(STORAGE_KEYS.INDICATORS_BACKUP, JSON.stringify(allBackups));
      this.log('BACKUP', `indicators_${branchId}`, indicators.length, true);
      console.log(`💾 Indicators backed up for ${branchId}:`, indicators.length);
    } catch (error) {
      console.error('Failed to backup indicators:', error);
      this.log('BACKUP', `indicators_${branchId}`, 0, false);
    }
  }

  static recoverIndicators(branchId: string): Indicator[] | null {
    try {
      const allBackups = this.getAllIndicatorBackups();
      const indicators = allBackups[branchId];
      if (indicators) {
        this.log('RECOVER', `indicators_${branchId}`, indicators.length, true);
        console.log(`🆘 Recovered indicators for ${branchId}:`, indicators.length);
        return indicators;
      }
      return null;
    } catch (error) {
      console.error('Failed to recover indicators:', error);
      this.log('RECOVER', `indicators_${branchId}`, 0, false);
      return null;
    }
  }

  private static getAllIndicatorBackups(): Record<string, Indicator[]> {
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.INDICATORS_BACKUP);
      return backup ? JSON.parse(backup) : {};
    } catch {
      return {};
    }
  }

  // ============= FULL RECOVERY =============
  static performFullRecovery() {
    console.log('🆘🆘🆘 PERFORMING FULL DATA RECOVERY 🆘🆘🆘');
    
    const recovered = {
      branches: this.recoverBranches(),
      submissions: this.getAllSubmissionBackups(),
      indicators: this.getAllIndicatorBackups()
    };

    console.log('🆘 Recovery Result:', {
      branches: recovered.branches?.length || 0,
      submissionBranches: Object.keys(recovered.submissions).length,
      indicatorBranches: Object.keys(recovered.indicators).length
    });

    return recovered;
  }

  // ============= STATUS =============
  static getBackupStatus() {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const branches = this.recoverBranches();
    const submissions = this.getAllSubmissionBackups();
    const indicators = this.getAllIndicatorBackups();

    return {
      lastSync: lastSync ? new Date(lastSync).toLocaleString('id-ID') : 'Never',
      branches: branches?.length || 0,
      submissionBranches: Object.keys(submissions).length,
      totalSubmissions: Object.values(submissions).reduce((sum, subs) => sum + subs.length, 0),
      indicatorBranches: Object.keys(indicators).length,
      hasBackup: !!(branches && branches.length > 0)
    };
  }

  // ============= CLEAR (DANGEROUS!) =============
  static clearAllBackups() {
    console.warn('⚠️ CLEARING ALL BACKUPS - THIS CANNOT BE UNDONE!');
    localStorage.removeItem(STORAGE_KEYS.BRANCHES_BACKUP);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS_BACKUP);
    localStorage.removeItem(STORAGE_KEYS.INDICATORS_BACKUP);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    this.log('CLEAR', 'all', 0, true);
  }
}

// ============= AUTO-BACKUP MONITOR =============
export function initializeAutoBackup() {
  console.log('🔄 Initializing auto-backup monitor...');
  
  // Check backup status on load
  const status = DataRecovery.getBackupStatus();
  console.log('💾 Backup Status:', status);
  
  // Show recovery notification if data exists
  if (status.hasBackup) {
    console.log('✅ Backup available - Data can be recovered if needed!');
  } else {
    console.log('ℹ️ No backup yet - Will create on first data load');
  }
}
