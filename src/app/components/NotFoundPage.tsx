import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-gray-700">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">404</h1>
            <p className="text-gray-400 text-lg">
              Halaman tidak ditemukan
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-sm">
            <p className="text-gray-400">
              URL yang Anda akses tidak tersedia atau sudah tidak valid.
            </p>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              © 2026 CROWN System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
