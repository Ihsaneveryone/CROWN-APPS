import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { Suspense, useEffect } from 'react';
import { DataRecovery } from './utils/dataRecovery';
import LoadingScreen from './components/LoadingScreen';
import { testConnection } from './utils/googleSheets';
import { startVersionMonitoring } from './utils/versionCheck';

export default function App() {
  useEffect(() => {
    // 🚀 ULTRA LIGHTWEIGHT: Minimal initialization untuk kecepatan maksimal
    const init = async () => {
      try {
        // ✨ Check app version and auto-clear cache if updated
        console.log('🔍 Checking app version...');
        startVersionMonitoring();

        // Hanya initialize data recovery (ringan!)
        console.log('✅ Lightweight mode - ultra fast startup!');

        // 📊 Test Google Sheets connection
        console.log('🔗 Testing Google Sheets API connection...');
        const connected = await testConnection();
        if (connected) {
          console.log('✅ Google Sheets API connected successfully!');
          console.log('🎉 Multi-device sync READY!');
        } else {
          console.error('❌ Google Sheets API connection failed!');
          console.error('⚠️ Check API key and Spreadsheet ID in googleSheets.ts');
        }
      } catch (error) {
        console.log('ℹ️ Initialization error:', error);
      }
    };

    init();

    // 🆘 EXPOSE RECOVERY FUNCTIONS TO CONSOLE (for manual recovery)
    (window as any).CROWN_RECOVERY = {
      status: () => {
        const status = DataRecovery.getBackupStatus();
        console.log('🆘 CROWN DATA RECOVERY STATUS:');
        console.log('================================');
        console.log('Last Sync:', status.lastSync);
        console.log('Branches:', status.branches);
        console.log('Submission Branches:', status.submissionBranches);
        console.log('Total Submissions:', status.totalSubmissions);
        console.log('Indicator Branches:', status.indicatorBranches);
        console.log('Has Backup:', status.hasBackup ? '✅ YES' : '❌ NO');
        console.log('================================');
        return status;
      },

      fullRecovery: () => {
        console.log('🆘🆘🆘 PERFORMING FULL RECOVERY 🆘🆘🆘');
        const result = DataRecovery.performFullRecovery();
        console.log('Recovery complete! Please refresh page.');
        return result;
      },

      logs: () => {
        const logs = DataRecovery.getRecoveryLogs();
        console.table(logs);
        return logs;
      },

      help: () => {
        console.log('🆘 CROWN DATA RECOVERY COMMANDS:');
        console.log('================================');
        console.log('CROWN_RECOVERY.status()       - Check backup status');
        console.log('CROWN_RECOVERY.fullRecovery() - Perform full data recovery');
        console.log('CROWN_RECOVERY.logs()         - View recovery logs');
        console.log('CROWN_RECOVERY.help()         - Show this help');
        console.log('================================');
      }
    };

    console.log('💡 Type CROWN_RECOVERY.help() in console for data recovery commands');

    // 🔴 GLOBAL ERROR HANDLER - Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('🔴 GLOBAL ERROR:', event.error);
      console.error('🔴 Error message:', event.message);
      console.error('🔴 Stack:', event.error?.stack);

      // Don't show error to user - app should continue working with cache/backup
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔴 UNHANDLED PROMISE REJECTION:', event.reason);

      // Don't show error to user - app should continue working with cache/backup
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}
