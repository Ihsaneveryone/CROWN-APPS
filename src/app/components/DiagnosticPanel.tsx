import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { AlertCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticPanelProps {
  onClose?: () => void;
}

export default function DiagnosticPanel({ onClose }: DiagnosticPanelProps) {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostic = () => {
    setIsChecking(true);
    console.log('');
    console.log('🔍 ===== DIAGNOSTIC START =====');

    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // Check 1: User Session
    try {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        results.checks.push({
          name: 'User Session',
          status: parsed.role ? 'OK' : 'WARNING',
          data: parsed,
          message: parsed.role
            ? `✅ Role found: ${parsed.role}`
            : '⚠️ No role in session!'
        });
        console.log('1️⃣ User Session:', parsed);
      } else {
        results.checks.push({
          name: 'User Session',
          status: 'ERROR',
          message: '❌ No user session found!'
        });
        console.log('1️⃣ User Session: NONE');
      }
    } catch (e) {
      results.checks.push({
        name: 'User Session',
        status: 'ERROR',
        message: '❌ Corrupted session data!'
      });
      console.error('1️⃣ User Session ERROR:', e);
    }

    // Check 2: Indicators Cache
    const indicatorKeys = Object.keys(localStorage).filter(k => k.startsWith('indicators_'));
    console.log('2️⃣ Indicators cache keys:', indicatorKeys);

    let hasRoleField = false;
    let totalIndicators = 0;

    indicatorKeys.forEach(key => {
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        if (cached.data && Array.isArray(cached.data)) {
          totalIndicators += cached.data.length;
          const withRole = cached.data.filter((ind: any) => ind.role);
          if (withRole.length > 0) {
            hasRoleField = true;
            console.log(`   ${key}: ${cached.data.length} indicators, ${withRole.length} with role`);
            const sample = withRole[0];
            console.log(`   Sample: ${sample.id} → role: ${sample.role}`);
          } else {
            console.log(`   ${key}: ${cached.data.length} indicators, ⚠️ NO ROLE FIELD!`);
          }
        }
      } catch (e) {
        console.error(`   ${key}: ERROR parsing`, e);
      }
    });

    results.checks.push({
      name: 'Indicators Cache',
      status: hasRoleField ? 'OK' : 'ERROR',
      data: {
        totalKeys: indicatorKeys.length,
        totalIndicators,
        hasRoleField
      },
      message: hasRoleField
        ? `✅ ${totalIndicators} indicators with role field`
        : `❌ No role field in ${totalIndicators} indicators!`
    });

    // Check 3: All localStorage keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    results.checks.push({
      name: 'localStorage Size',
      status: 'INFO',
      data: { totalKeys: allKeys.length, keys: allKeys },
      message: `📊 Total ${allKeys.length} keys in localStorage`
    });

    console.log('3️⃣ All localStorage keys:', allKeys);
    console.log('===== DIAGNOSTIC END =====');
    console.log('');

    setDiagnostic(results);
    setIsChecking(false);
  };

  const superClearCache = () => {
    console.log('');
    console.log('🧹 ===== SUPER CLEAR CACHE START =====');

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }

    console.log(`Found ${keysToRemove.length} keys to remove:`);
    keysToRemove.forEach(key => {
      console.log(`  ❌ ${key}`);
      localStorage.removeItem(key);
    });

    // Also clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    console.log('✅ All cache cleared!');
    console.log('===== SUPER CLEAR CACHE END =====');
    console.log('');

    toast.success('🧹 All cache cleared! Reloading...', { duration: 2000 });

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            🔍 System Diagnostic & Cache Manager
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Check system status and clear corrupted cache
          </p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Actions */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={runDiagnostic}
              disabled={isChecking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              {isChecking ? 'Checking...' : '🔍 Run Diagnostic Check'}
            </Button>

            <Button
              onClick={superClearCache}
              variant="destructive"
              className="w-full h-12"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              🧹 SUPER CLEAR ALL CACHE (Fix Corrupted Data)
            </Button>
          </div>

          {/* Diagnostic Results */}
          {diagnostic && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Diagnostic Results:</h3>

              {diagnostic.checks.map((check: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${
                    check.status === 'OK'
                      ? 'border-green-300 bg-green-50'
                      : check.status === 'WARNING'
                      ? 'border-yellow-300 bg-yellow-50'
                      : check.status === 'ERROR'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {check.status === 'OK' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : check.status === 'ERROR' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-700">
                        {check.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {check.message}
                      </div>
                      {check.data && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Show details
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-x-auto text-xs">
                            {JSON.stringify(check.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  💡 What to do next:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {!diagnostic.checks.find((c: any) => c.name === 'User Session')?.data?.role && (
                    <li>❌ No role in session → Click "SUPER CLEAR ALL CACHE"</li>
                  )}
                  {!diagnostic.checks.find((c: any) => c.name === 'Indicators Cache')?.data?.hasRoleField && (
                    <li>❌ Indicators missing role → Click "SUPER CLEAR ALL CACHE" then login again</li>
                  )}
                  {diagnostic.checks.every((c: any) => c.status === 'OK') && (
                    <li>✅ Everything looks good! If you still see errors, check spreadsheet "indicators" sheet.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
