import { Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Memuat halaman...' }: LoadingScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content - RESPONSIVE */}
      <div className={`relative flex flex-col items-center transform transition-all duration-500 px-4 ${fadeIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Crown decoration with bounce - RESPONSIVE */}
        <div className="mb-3 md:mb-4 animate-bounce">
          <Crown className="w-14 h-14 md:w-20 md:h-20 text-yellow-500 drop-shadow-2xl" fill="currentColor" strokeWidth={1.5} />
        </div>

        {/* Logo container with pulse and rotate - RESPONSIVE */}
        <div className="relative -mt-7 md:-mt-10 mb-6 md:mb-8">
          {/* Outer rotating glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-3xl opacity-50 animate-spin" style={{ animationDuration: '3s' }}></div>

          {/* Logo */}
          <div className="relative bg-white rounded-full p-6 md:p-8 shadow-2xl border-2 md:border-4 border-red-100 animate-pulse">
            <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  AZKO
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text - RESPONSIVE */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            CROWN System
          </h2>
          <p className="text-gray-600 text-base md:text-lg animate-pulse">{message}</p>
        </div>

        {/* Progress bar - RESPONSIVE */}
        <div className="w-64 md:w-72 h-2 md:h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full animate-loading-bar shadow-lg"></div>
        </div>

        {/* Dots animation - RESPONSIVE */}
        <div className="flex gap-2 md:gap-3 mt-6 md:mt-8">
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-red-500 rounded-full animate-bounce shadow-lg"></div>
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-orange-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-yellow-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Developer credit - RESPONSIVE */}
        <div className="mt-8 md:mt-12 text-center opacity-80">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-white/50 backdrop-blur-sm rounded-full border border-red-100 shadow-sm">
            <p className="text-xs font-medium text-gray-600">
              Management Trainee Batch 16 - Muhammad Ihsan
            </p>
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
