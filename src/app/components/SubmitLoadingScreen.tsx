import { Crown } from 'lucide-react';

interface SubmitLoadingScreenProps {
  message?: string;
}

export default function SubmitLoadingScreen({ message = 'Mengirim Data...' }: SubmitLoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        {/* Animated Crown */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Crown
              className="w-20 h-20 text-yellow-500 relative animate-bounce"
              fill="currentColor"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            {message}
          </h2>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full animate-loading-bar"></div>
          </div>

          {/* Sub Message */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">
              Mohon tunggu, jangan tutup halaman ini...
            </p>
            <p className="text-xs text-gray-500">
              Proses bisa 10-60 detik tergantung koneksi
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Jika gagal, data otomatis tersimpan & dikirim ulang
            </p>
          </div>

          {/* Dots Animation */}
          <div className="flex justify-center gap-2 pt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
