import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ChevronDown, ChevronUp, Home, ArrowLeft } from 'lucide-react';

interface Section {
  title: string;
  content: string | string[];
}

export default function Documentation() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      title: "📖 Pengenalan CROWN System",
      content: [
        "CROWN (Cabang Retail Operation Workflow Navigator) adalah sistem manajemen indikator harian untuk staff AZKO.",
        "",
        "Fitur Utama:",
        "• Multi-role authentication (Super Admin, Branch Admin, Staff)",
        "• Daily indicators tracking dengan foto",
        "• Export data ke Excel/CSV",
        "• Real-time notifications",
        "• Responsive design untuk desktop dan mobile"
      ]
    },
    {
      title: "🛠️ Tech Stack",
      content: [
        "Frontend:",
        "• React 18.3.1 dengan TypeScript",
        "• Tailwind CSS v4 untuk styling",
        "• Lucide React untuk icons",
        "• Sonner untuk notifications",
        "• ExcelJS untuk export Excel",
        "",
        "Backend:",
        "• Supabase Edge Functions",
        "• Hono framework",
        "• KV Store sebagai database",
        "",
        "Build Tools:",
        "• Vite untuk bundling",
        "• pnpm untuk package management"
      ]
    },
    {
      title: "📁 Struktur Folder",
      content: [
        "/workspaces/default/code/",
        "├── src/",
        "│   ├── app/",
        "│   │   ├── components/         # Semua React components",
        "│   │   │   ├── ui/             # Reusable UI components",
        "│   │   │   ├── BranchSelector.tsx",
        "│   │   │   ├── LoginPage.tsx",
        "│   │   │   ├── StaffDashboard.tsx",
        "│   │   │   ├── AdminDashboard.tsx",
        "│   │   │   ├── SuperAdminDashboard.tsx",
        "│   │   │   └── LoadingScreen.tsx",
        "│   │   ├── utils/",
        "│   │   │   └── api.ts          # API calls ke backend",
        "│   │   ├── types.ts            # TypeScript type definitions",
        "│   │   └── App.tsx             # Main app component",
        "│   ├── imports/                # Assets (images, SVGs)",
        "│   └── styles/                 # CSS files",
        "├── supabase/",
        "│   └── functions/",
        "│       └── server/",
        "│           └── index.tsx       # Backend API endpoints",
        "└── package.json"
      ]
    },
    {
      title: "🔄 Alur Aplikasi",
      content: [
        "1. Halaman Awal (BranchSelector)",
        "   • User memilih cabang/toko",
        "   • Atau login sebagai Super Admin",
        "   • Loading screen 1 detik",
        "",
        "2. Halaman Login (LoginPage)",
        "   • Input NIK dan Nama",
        "   • Auto-detect Branch Admin (password mode)",
        "   • Loading screen 1 detik setelah login",
        "",
        "3. Dashboard (berdasarkan role)",
        "   • Staff: Input indicators, view history",
        "   • Branch Admin: Lihat semua staff data, export Excel/CSV",
        "   • Super Admin: Kelola semua cabang, settings global",
        "",
        "4. Submit Indicator",
        "   • Staff pilih indicator type",
        "   • Upload foto (max 3)",
        "   • Input nilai",
        "   • Submit → tersimpan di KV Store",
        "",
        "5. Export Data",
        "   • Auto-detect: Ada foto → Excel, Tidak ada → CSV",
        "   • Excel: Foto embedded per kolom",
        "   • CSV: Lebih cepat untuk data text saja"
      ]
    },
    {
      title: "📄 File Penting - App.tsx",
      content: [
        "Main component yang mengatur routing dan state management:",
        "",
        "State Management:",
        "• selectedBranch: Branch yang dipilih user",
        "• user: Session data (NIK, nama, role)",
        "• isLoading: Loading state untuk transitions",
        "",
        "Functions:",
        "• handleBranchSelect(): Pilih cabang + loading 1 detik",
        "• handleLogin(): Login user + loading 1 detik",
        "• handleLogout(): Clear session data",
        "• handleBackToBranches(): Kembali ke pilih cabang",
        "",
        "Conditional Rendering:",
        "1. isLoading → LoadingScreen",
        "2. isSuperAdmin → SuperAdminDashboard",
        "3. isBranchAdmin + selectedBranch → AdminDashboard",
        "4. user + selectedBranch → StaffDashboard",
        "5. selectedBranch → LoginPage",
        "6. default → BranchSelector"
      ]
    },
    {
      title: "📄 File Penting - BranchSelector.tsx",
      content: [
        "Halaman pertama untuk memilih cabang:",
        "",
        "Features:",
        "• Load branches dari API",
        "• Display dalam grid cards",
        "• Super Admin login dialog",
        "• CROWN theme dengan mahkota dan logo AZKO",
        "",
        "Design Elements:",
        "• Crown icon: w-24 h-24 (besar)",
        "• Logo AZKO: w-44 h-44 dengan border merah",
        "• Gradient background: red-orange-yellow",
        "• Animated pulse effect pada logo",
        "• Hover effects pada cards",
        "",
        "Security:",
        "• Admin name TIDAK ditampilkan di cards (keamanan)",
        "• Super Admin code: IHSANAZKO",
        "• Super Admin NIK: SUPER001"
      ]
    },
    {
      title: "📄 File Penting - LoginPage.tsx",
      content: [
        "Halaman login untuk masuk ke dashboard:",
        "",
        "Smart Features:",
        "• Auto-detect admin: NIK match → password mode",
        "• Password mode: Input nama jadi type='password'",
        "• Staff mode: Input nama tetap visible",
        "",
        "Security Check:",
        "• Monthly admin name change reminder (30 hari)",
        "• Secret code untuk forgot admin: AZKOIHSAN",
        "",
        "Design:",
        "• Crown icon: w-14 h-14",
        "• Logo: w-24 h-24",
        "• Same gradient theme",
        "• Customizable title dari settings"
      ]
    },
    {
      title: "📄 File Penting - StaffDashboard.tsx",
      content: [
        "Dashboard untuk staff input indicators:",
        "",
        "Main Features:",
        "1. Quick Submit Card",
        "   • Pilih indicator type (dropdown)",
        "   • Upload foto (max 3, 5MB each)",
        "   • Input nilai",
        "   • Submit button",
        "",
        "2. Today's Indicators",
        "   • List indicators hari ini",
        "   • Show photos dalam gallery",
        "   • Update/delete options",
        "",
        "3. Recent History",
        "   • 7 hari terakhir",
        "   • Grouped by date",
        "",
        "Photo Handling:",
        "• File validation (size, type)",
        "• Preview before submit",
        "• Convert to base64 untuk storage",
        "• Display dalam grid 3 columns"
      ]
    },
    {
      title: "📄 File Penting - AdminDashboard.tsx",
      content: [
        "Dashboard untuk Branch Admin:",
        "",
        "Features:",
        "1. Statistics Cards",
        "   • Total submissions hari ini",
        "   • Active staff count",
        "   • Completion rate",
        "",
        "2. Staff Performance Table",
        "   • List semua staff",
        "   • Jumlah indicators per staff",
        "   • Last activity timestamp",
        "",
        "3. Export Functions",
        "   • Smart Export: Auto-detect Excel/CSV",
        "   • Date range filter",
        "   • Staff filter",
        "",
        "4. Settings",
        "   • Ganti nama admin (monthly)",
        "   • Manage indicator types",
        "   • Customize login title/subtitle",
        "",
        "Export Logic:",
        "• Check if data has photos",
        "• Photos exists → Excel (with embedded images)",
        "• No photos → CSV (faster download)"
      ]
    },
    {
      title: "📄 File Penting - SuperAdminDashboard.tsx",
      content: [
        "Dashboard untuk Super Admin (akses penuh):",
        "",
        "Features:",
        "1. Manage Branches",
        "   • Add new branch",
        "   • Edit branch details",
        "   • Delete branch",
        "   • View all staff per branch",
        "",
        "2. Global Settings",
        "   • App title/subtitle",
        "   • Default indicator types",
        "   • System configurations",
        "",
        "3. All Data Overview",
        "   • Total branches",
        "   • Total staff across all branches",
        "   • System-wide statistics",
        "",
        "Add Branch Form:",
        "• Branch NIK (unique ID)",
        "• Branch Name",
        "• Display Name (optional)",
        "• Admin Name (default: AZKO)",
        "• Auto-save to KV Store"
      ]
    },
    {
      title: "📄 File Penting - LoadingScreen.tsx",
      content: [
        "Loading screen dengan animasi profesional:",
        "",
        "Animations:",
        "1. Background",
        "   • Gradient: red-orange-yellow",
        "   • Animated circles dengan pulse",
        "",
        "2. Crown",
        "   • animate-bounce",
        "   • w-20 h-20",
        "   • Yellow color dengan shadow",
        "",
        "3. Logo",
        "   • Rotating glow (animate-spin 3s)",
        "   • Pulse animation",
        "   • w-36 h-36",
        "",
        "4. Progress Bar",
        "   • Custom @keyframes loading-bar",
        "   • Gradient animation",
        "   • 1.5s duration infinite",
        "",
        "5. Dots",
        "   • 3 dots dengan staggered bounce",
        "   • Different colors: red, orange, yellow",
        "",
        "Credit Text:",
        "• 'Management Trainee Batch 16 - Muhammad Ihsan'",
        "• Styled badge dengan backdrop-blur"
      ]
    },
    {
      title: "📄 File Penting - api.ts",
      content: [
        "Utility file untuk semua API calls:",
        "",
        "API_URL: https://YOUR_PROJECT.supabase.co/functions/v1/server",
        "",
        "Main Functions:",
        "• getBranches(): Fetch all branches",
        "• getBranchAdmin(): Get admin data",
        "• updateBranchAdmin(): Update admin name",
        "• getSettings(): Get branch settings",
        "• updateSettings(): Update branch settings",
        "• getAppSettings(): Get global settings",
        "• updateAppSettings(): Update global settings",
        "• getIndicatorTypes(): Get available types",
        "• getIndicators(): Fetch indicators by branch/date",
        "• submitIndicator(): Submit new indicator",
        "• updateIndicator(): Update existing",
        "• deleteIndicator(): Delete indicator",
        "• createBranch(): Add new branch",
        "• updateBranch(): Update branch details",
        "• deleteBranch(): Remove branch",
        "",
        "Error Handling:",
        "• Response.ok checking",
        "• Content-type validation",
        "• JSON parse error catching",
        "• Detailed console logging"
      ]
    },
    {
      title: "📄 File Penting - types.ts",
      content: [
        "TypeScript type definitions:",
        "",
        "export interface Branch {",
        "  id: string;              // Unique ID",
        "  nik: string;             // Branch NIK",
        "  name: string;            // Branch name",
        "  displayName?: string;    // Display name (optional)",
        "  adminName: string;       // Admin name",
        "}",
        "",
        "export interface DailyIndicator {",
        "  id: string;",
        "  branchId: string;",
        "  staffNik: string;",
        "  staffName: string;",
        "  date: string;            // YYYY-MM-DD",
        "  type: string;            // Indicator type",
        "  value: number;           // Numeric value",
        "  photos?: string[];       // Base64 or URLs",
        "  timestamp: string;       // ISO datetime",
        "}",
        "",
        "export interface AppSettings {",
        "  mainTitle: string;",
        "  mainSubtitle: string;",
        "  secondarySubtitle: string;",
        "}"
      ]
    },
    {
      title: "🎨 Tailwind CSS v4 Guide",
      content: [
        "Tailwind classes yang sering dipakai:",
        "",
        "Layout:",
        "• flex, flex-col, flex-row",
        "• items-center, justify-center",
        "• gap-4, space-y-4",
        "• grid, grid-cols-3",
        "",
        "Sizing:",
        "• w-24 (width: 6rem = 96px)",
        "• h-24 (height: 6rem = 96px)",
        "• max-w-5xl (max-width: 64rem)",
        "",
        "Colors & Gradients:",
        "• bg-gradient-to-r from-red-600 to-orange-600",
        "• text-yellow-500",
        "• border-red-100",
        "",
        "Effects:",
        "• shadow-2xl, drop-shadow-2xl",
        "• blur-3xl, backdrop-blur-sm",
        "• opacity-40, opacity-100",
        "",
        "Animations:",
        "• animate-pulse (fade in/out)",
        "• animate-bounce (up/down)",
        "• animate-spin (rotate)",
        "",
        "Responsive:",
        "• md:grid-cols-2 (medium screens)",
        "• lg:grid-cols-3 (large screens)",
        "",
        "Hover States:",
        "• hover:shadow-xl",
        "• hover:scale-110",
        "• group-hover:opacity-100",
        "",
        "Transitions:",
        "• transition-all duration-300",
        "• transform scale-100"
      ]
    },
    {
      title: "🚀 Deployment Guide",
      content: [
        "1. Setup Supabase Project",
        "   • Buat project di supabase.com",
        "   • Copy project URL",
        "   • Generate anon key",
        "",
        "2. Deploy Edge Function",
        "   $ supabase login",
        "   $ supabase link --project-ref YOUR_PROJECT_REF",
        "   $ supabase functions deploy server",
        "",
        "3. Update API URL",
        "   • Edit src/app/utils/api.ts",
        "   • Ganti API_URL dengan URL Supabase Anda",
        "   const API_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/server';",
        "",
        "4. Deploy Frontend (Figma Make)",
        "   • Click 'Publish' button di Figma Make",
        "   • Atau export dan deploy ke Vercel/Netlify",
        "",
        "5. Testing",
        "   • Test login Super Admin",
        "   • Add branch baru",
        "   • Test staff login",
        "   • Submit indicator dengan foto",
        "   • Test export Excel/CSV"
      ]
    },
    {
      title: "🔐 Security Features",
      content: [
        "1. Authentication",
        "   • Multi-role: Super Admin, Branch Admin, Staff",
        "   • Session storage di localStorage",
        "   • Auto-detect admin dengan NIK matching",
        "",
        "2. Password Protection",
        "   • Admin name sebagai password",
        "   • Input type='password' untuk admin",
        "   • Monthly change reminder (30 hari)",
        "",
        "3. Secret Codes",
        "   • Super Admin: IHSANAZKO",
        "   • Forgot Admin: AZKOIHSAN",
        "   • Hardcoded untuk security",
        "",
        "4. Data Privacy",
        "   • Admin names hidden di branch selector",
        "   • Photo validation (size, type)",
        "   • Branch-specific data isolation",
        "",
        "5. Input Validation",
        "   • Required fields checking",
        "   • File size limit (5MB)",
        "   • File type validation (images only)",
        "   • NIK format validation"
      ]
    },
    {
      title: "📊 Excel Export Details",
      content: [
        "ExcelJS Implementation:",
        "",
        "Header Structure:",
        "• Tanggal, Nama Staff, NIK Staff, Tipe Indicator, Nilai",
        "• Foto 1, Foto 2, Foto 3 (separate columns)",
        "",
        "Photo Handling:",
        "1. Convert File to base64",
        "   • FileReader.readAsDataURL()",
        "   • Extract base64 string",
        "",
        "2. Add to Excel",
        "   • workbook.addImage()",
        "   • ws.addImage() with cell position",
        "   • Set column width for photos",
        "",
        "3. Row Height",
        "   • Auto-adjust untuk photo visibility",
        "   • Default: 100 pixels per row",
        "",
        "Styling:",
        "• Header: Bold, yellow background",
        "• Borders: Thin on all cells",
        "• Alignment: Center untuk headers",
        "",
        "Download:",
        "• workbook.xlsx.writeBuffer()",
        "• Create Blob",
        "• Download via anchor click"
      ]
    },
    {
      title: "🐛 Common Issues & Solutions",
      content: [
        "1. Logo tidak muncul",
        "   • Pastikan import: import azkoLogo from '../../imports/image-8.png'",
        "   • Gunakan relative path, bukan absolute",
        "",
        "2. Crown terpotong border",
        "   • Gunakan flex-col layout",
        "   • Crown dan logo sebagai sibling elements",
        "   • Negative margin untuk overlap: -mt-10",
        "",
        "3. React ref warning",
        "   • Use React.forwardRef untuk custom components",
        "   • Add displayName untuk debugging",
        "",
        "4. JSON parse error",
        "   • Check response.ok sebelum parsing",
        "   • Validate content-type header",
        "   • Add error logging",
        "",
        "5. Photo tidak muncul di Excel",
        "   • Convert File to base64 string",
        "   • Validate base64 format",
        "   • Check file size < 5MB",
        "",
        "6. Loading screen tidak muncul",
        "   • Check isLoading state",
        "   • Pastikan setTimeout duration (1000ms)",
        "   • Verify conditional rendering di App.tsx"
      ]
    },
    {
      title: "💡 Tips & Best Practices",
      content: [
        "1. State Management",
        "   • Use useState untuk local state",
        "   • localStorage untuk session persistence",
        "   • useEffect untuk data fetching",
        "",
        "2. Component Structure",
        "   • One component per file",
        "   • Descriptive names (BranchSelector, not BS)",
        "   • Props interfaces untuk TypeScript",
        "",
        "3. Styling",
        "   • Tailwind classes inline",
        "   • Consistent color scheme (red-orange-yellow)",
        "   • Responsive design (md:, lg: breakpoints)",
        "",
        "4. Performance",
        "   • Lazy loading untuk large data",
        "   • Debounce untuk search inputs",
        "   • Smart export (auto-detect Excel/CSV)",
        "",
        "5. User Experience",
        "   • Loading states untuk transitions",
        "   • Toast notifications untuk feedback",
        "   • Confirmation dialogs untuk delete actions",
        "",
        "6. Code Organization",
        "   • Utils folder untuk helper functions",
        "   • Types file untuk TypeScript definitions",
        "   • Separate API calls dari components"
      ]
    },
    {
      title: "📚 Learning Resources",
      content: [
        "React:",
        "• https://react.dev/learn",
        "• https://react.dev/reference/react",
        "",
        "TypeScript:",
        "• https://www.typescriptlang.org/docs/",
        "• https://react-typescript-cheatsheet.netlify.app/",
        "",
        "Tailwind CSS:",
        "• https://tailwindcss.com/docs",
        "• https://nerdcave.com/tailwind-cheat-sheet",
        "",
        "Supabase:",
        "• https://supabase.com/docs",
        "• https://supabase.com/docs/guides/functions",
        "",
        "ExcelJS:",
        "• https://github.com/exceljs/exceljs",
        "",
        "Icons (Lucide):",
        "• https://lucide.dev/icons/"
      ]
    },
    {
      title: "👨‍💻 Developer Info",
      content: [
        "Project: CROWN System",
        "Developer: Muhammad Ihsan",
        "Position: Management Trainee Batch 16",
        "Company: AZKO",
        "",
        "Project Features:",
        "✅ Multi-role authentication",
        "✅ Daily indicators tracking",
        "✅ Photo upload & management",
        "✅ Excel/CSV export",
        "✅ Real-time notifications",
        "✅ Responsive design",
        "✅ Loading animations",
        "✅ CROWN theme branding",
        "",
        "Technical Highlights:",
        "• TypeScript for type safety",
        "• Tailwind CSS v4 for modern styling",
        "• Supabase Edge Functions for serverless backend",
        "• ExcelJS for advanced Excel export with images",
        "• Smart auto-detection for export format",
        "",
        "Last Updated: April 2026"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Halaman Sebelumnya
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            CROWN System - Panduan Lengkap
          </h1>
          <p className="text-gray-600">
            Dokumentasi step-by-step untuk Development & Maintenance
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-red-100">
            <p className="text-xs font-medium text-gray-600">
              Management Trainee Batch 16 - Muhammad Ihsan
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index} className="border-2 border-red-100 hover:border-red-300 transition-all">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-red-50/50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                  {expandedSections.has(index) ? (
                    <ChevronUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-red-600" />
                  )}
                </button>

                {expandedSections.has(index) && (
                  <div className="px-6 pb-6 border-t border-red-100">
                    <div className="mt-4 bg-white rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {Array.isArray(section.content) ? section.content.join('\n') : section.content}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border-2 border-red-100">
            <p className="text-sm text-gray-600 mb-2">
              💡 <strong>Tip:</strong> Klik setiap section untuk expand/collapse
            </p>
            <p className="text-xs text-gray-500">
              Dokumentasi ini bisa di-print dengan Ctrl+P atau Cmd+P untuk PDF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}