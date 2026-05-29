import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";

// ─── oklch → rgb conversion for html2canvas compatibility ────────────────────
function replaceOklch(text: string): string {
  return text.replace(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/g,
    (_m, l, c, _h, a) => {
      const lv = Math.round(parseFloat(l) * 255);
      const cv = parseFloat(c);
      // achromatic (gray) → exact; chromatic → approximate warm-neutral fallback
      const r = cv < 0.02 ? lv : Math.round(lv * 0.92);
      const g = cv < 0.02 ? lv : Math.round(lv * 0.89);
      const b = cv < 0.02 ? lv : lv;
      return a ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
    }
  );
}

// ─── Mockup: Phone Frame wrapper ─────────────────────────────────────────────
function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "24px 0" }}>
      <div style={{
        background: "#1e293b", borderRadius: 32, padding: "12px 10px 16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", width: 280
      }}>
        <div style={{ background: "#0f172a", borderRadius: 6, height: 20, width: 80, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, background: "#334155", borderRadius: 2 }} />
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 20, overflow: "hidden", minHeight: 460 }}>
          {children}
        </div>
      </div>
      <div style={{ marginTop: 10, background: "#1a56db", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 12, letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Mockup: Login Screen ─────────────────────────────────────────────────────
function MockupLogin() {
  return (
    <PhoneFrame label="Tampilan Login">
      <div style={{ background: "linear-gradient(160deg,#0f172a,#1a56db)", minHeight: 460, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px 20px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, background: "#1a56db", borderRadius: 12, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 22 }}>📊</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Daily Indicators</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Branch A336</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Username</div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#94a3b8", background: "#f8fafc" }}>budi.santoso</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Password</div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#94a3b8", background: "#f8fafc" }}>••••••••</div>
          </div>
          <div style={{ background: "#1a56db", color: "white", borderRadius: 8, padding: "9px 0", textAlign: "center", fontWeight: 700, fontSize: 13 }}>Masuk</div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Mockup: Dashboard ────────────────────────────────────────────────────────
function MockupDashboard() {
  const indicators = [
    { name: "Sales", value: 7500000, target: 6000000, pct: 100, weight: "30%" },
    { name: "Transaksi", value: 8, target: 6, pct: 100, weight: "10%" },
    { name: "WA Personal", value: 15, target: 20, pct: 75, weight: "10%" },
    { name: "Proteksi", value: 1, target: 1, pct: 100, weight: "10%" },
    { name: "MGB", value: 6, target: 10, pct: 60, weight: "10%" },
  ];
  return (
    <PhoneFrame label="Dashboard Indikator">
      <div style={{ background: "#f8fafc", minHeight: 460 }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1a56db,#0ea5e9)", padding: "16px 14px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10 }}>Selamat pagi,</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>Budi Santoso</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "white", fontWeight: 700 }}>Advisor</div>
          </div>
          <div style={{ marginTop: 10, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9 }}>Skor Hari Ini</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 20 }}>72%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9 }}>Jumat, 23 Mei 2026</div>
              <div style={{ color: "#86efac", fontSize: 10, fontWeight: 600, marginTop: 2 }}>4/9 Tercapai ✓</div>
            </div>
          </div>
        </div>
        {/* Indicator list */}
        <div style={{ padding: "10px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Indikator Hari Ini</div>
          {indicators.map((ind) => (
            <div key={ind.name} style={{ background: "white", borderRadius: 10, padding: "8px 10px", marginBottom: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{ind.name}</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "#94a3b8" }}>{ind.weight}</span>
                  {ind.pct >= 100
                    ? <span style={{ fontSize: 12 }}>✅</span>
                    : <span style={{ fontSize: 10, background: "#1a56db", color: "white", borderRadius: 6, padding: "1px 5px", fontWeight: 700 }}>Input</span>
                  }
                </div>
              </div>
              <div style={{ background: "#f1f5f9", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div style={{ background: ind.pct >= 100 ? "#16a34a" : "#1a56db", width: `${Math.min(ind.pct, 100)}%`, height: "100%", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 9, color: "#64748b" }}>{ind.value.toLocaleString("id-ID")}</span>
                <span style={{ fontSize: 9, color: "#94a3b8" }}>target {ind.target.toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Mockup: Submit Form ──────────────────────────────────────────────────────
function MockupSubmitForm() {
  return (
    <PhoneFrame label="Form Submit Indikator">
      <div style={{ background: "#f8fafc", minHeight: 460, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 16 }}>←</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>Submit Indikator</div>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>WA Personal</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Target: 20 pesan + 1 foto</div>
            </div>
            <div style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 700, fontSize: 10, padding: "2px 7px", borderRadius: 8 }}>10%</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Jumlah WA dikirim hari ini</div>
            <div style={{ border: "1.5px solid #1a56db", borderRadius: 8, padding: "9px 10px", fontSize: 18, fontWeight: 800, color: "#1a56db", background: "#eff6ff" }}>18</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Catatan (opsional)</div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#64748b", background: "#f8fafc", minHeight: 40 }}>
              Sudah blast ke customer lama...
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 4 }}>📷 Foto Bukti (Wajib)</div>
            <div style={{ border: "1.5px dashed #94a3b8", borderRadius: 8, padding: "12px 0", textAlign: "center", background: "#f8fafc" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📸</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Tap untuk upload foto</div>
            </div>
          </div>
          <div style={{ background: "#1a56db", color: "white", borderRadius: 9, padding: "10px 0", textAlign: "center", fontWeight: 800, fontSize: 13 }}>
            ✓ Submit
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Mockup: History Page ─────────────────────────────────────────────────────
function MockupHistory() {
  const entries = [
    { indicator: "Sales", value: "Rp 7.500.000", time: "Jumat (23/05/2026 | 09:15)", note: "Alhamdulillah melebihi target", photo: true },
    { indicator: "Transaksi", value: "8 trx", time: "Jumat (23/05/2026 | 09:16)", note: "", photo: false },
    { indicator: "WA Personal", value: "18 pesan", time: "Jumat (23/05/2026 | 11:30)", note: "Sudah blast ke customer lama", photo: true },
  ];
  return (
    <PhoneFrame label="Riwayat Submission">
      <div style={{ background: "#f8fafc", minHeight: 460 }}>
        <div style={{ background: "white", padding: "12px 12px 10px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 8 }}>Riwayat Saya</div>
          <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
            <span>Filter tanggal...</span>
            <span>📅</span>
          </div>
        </div>
        <div style={{ padding: "10px 10px" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px 12px", marginBottom: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>{e.indicator}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{e.time}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#1a56db" }}>{e.value}</div>
              </div>
              {e.note && (
                <div style={{ marginTop: 6, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 8px", fontSize: 10, color: "#854d0e" }}>
                  📝 {e.note}
                </div>
              )}
              {e.photo && (
                <div style={{ marginTop: 6, background: "#e2e8f0", borderRadius: 6, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>📷 Foto bukti tersimpan</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Mockup: Admin Panel ──────────────────────────────────────────────────────
function MockupAdmin() {
  const roles = [
    { name: "Advisor", desc: "Sales Advisor", badge: "#dbeafe", tc: "#1d4ed8" },
    { name: "Cashier", desc: "Kasir Toko", badge: "#dcfce7", tc: "#15803d" },
    { name: "CS", desc: "Customer Service", badge: "#fce7f3", tc: "#9d174d" },
  ];
  return (
    <PhoneFrame label="Panel Admin">
      <div style={{ background: "#f8fafc", minHeight: 460 }}>
        <div style={{ background: "linear-gradient(135deg,#1a56db,#1240a8)", padding: "14px 14px 12px" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>Masuk sebagai</div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>Admin Panel</div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", background: "white", borderBottom: "1px solid #e2e8f0" }}>
          {["Roles", "Indikator", "Users"].map((t, i) => (
            <div key={t} style={{ flex: 1, textAlign: "center", padding: "9px 0", fontSize: 11, fontWeight: 700, borderBottom: i === 0 ? "2px solid #1a56db" : "2px solid transparent", color: i === 0 ? "#1a56db" : "#94a3b8" }}>{t}</div>
          ))}
        </div>
        <div style={{ padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Daftar Role</div>
            <div style={{ background: "#1a56db", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>+ Tambah</div>
          </div>
          {roles.map((r) => (
            <div key={r.name} style={{ background: "white", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: r.badge, color: r.tc, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 8 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{r.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 14, cursor: "pointer" }}>✏️</span>
                <span style={{ fontSize: 14, cursor: "pointer" }}>🗑️</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Export Data</div>
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>Download laporan CSV</span>
              <span style={{ background: "#16a34a", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 7 }}>⬇ Export</span>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Mockup: Google Sheets DB View ───────────────────────────────────────────
function MockupSheets() {
  return (
    <div style={{ margin: "20px 0", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      {/* Chrome bar */}
      <div style={{ background: "#3c4043", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ background: "#5f6368", borderRadius: 4, padding: "3px 12px", fontSize: 10, color: "#e8eaed", flex: 1 }}>
          docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
        </div>
      </div>
      {/* Sheets tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 0, padding: "0 8px" }}>
        {["Users","Submissions","Indicators","Roles","Config"].map((t, i) => (
          <div key={t} style={{ padding: "7px 12px", fontSize: 11, fontWeight: i === 1 ? 700 : 400, color: i === 1 ? "#1a56db" : "#5f6368", borderBottom: i === 1 ? "2px solid #1a56db" : "2px solid transparent", cursor: "pointer" }}>{t}</div>
        ))}
      </div>
      {/* Spreadsheet content */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, background: "white" }}>
          <thead>
            <tr style={{ background: "#f1f3f4" }}>
              {["A:id","B:branchId","C:userNik","D:userName","E:date","F:createdAt","G:totalScore","H:sales","I:trx","J:basket","K:wa_personal","L:no_baru","M:after_sales","N:proteksi","O:google_review","P:mgb","Q:photos","R:notes"].map(h => (
                <td key={h} style={{ padding: "4px 8px", border: "1px solid #e2e8f0", fontWeight: 600, color: "#3c4043", whiteSpace: "nowrap", background: h.startsWith("H:")||h.startsWith("I:")||h.startsWith("J:")||h.startsWith("K:")||h.startsWith("L:")||h.startsWith("M:")||h.startsWith("N:")||h.startsWith("O:")||h.startsWith("P:") ? "#e8f0fe" : "#f1f3f4" }}>{h}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["sub-001","A336","NIK001","Budi","2026-05-23","2026-05-23T09:15:00Z","85","7500000","8","180000","18","2","3","1","4","6","","Target sales lewat"],
            ].map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8f9fa" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "4px 8px", border: "1px solid #e2e8f0", color: "#3c4043", whiteSpace: "nowrap", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", background: j>=7&&j<=15 ? "#f0f4ff" : "inherit" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Mockup: Apps Script Editor ───────────────────────────────────────────────
function MockupAppsScript() {
  return (
    <div style={{ margin: "20px 0", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ background: "#3c4043", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ background: "#5f6368", borderRadius: 4, padding: "3px 12px", fontSize: 10, color: "#e8eaed", flex: 1 }}>
          script.google.com — Apps Script Editor
        </div>
        <div style={{ background: "#1a56db", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 5, cursor: "pointer" }}>▶ Deploy</div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ background: "#f1f3f4", width: 120, padding: "10px 0", borderRight: "1px solid #e2e8f0" }}>
          {["Code.gs","README.md"].map((f, i) => (
            <div key={f} style={{ padding: "6px 12px", fontSize: 11, color: i === 0 ? "#1a56db" : "#5f6368", background: i === 0 ? "#e8f0fe" : "transparent", fontWeight: i === 0 ? 700 : 400 }}>{f}</div>
          ))}
        </div>
        <div style={{ background: "#1e293b", flex: 1, padding: "12px 16px", fontFamily: "monospace", fontSize: 11, lineHeight: 1.7, color: "#e2e8f0", minHeight: 160 }}>
          <span style={{ color: "#64748b" }}>// Google Apps Script API</span><br />
          <span style={{ color: "#c084fc" }}>const</span> <span style={{ color: "#f9a8d4" }}>SPREADSHEET_ID</span> = <span style={{ color: "#86efac" }}>'YOUR_ID'</span>;<br />
          <span style={{ color: "#c084fc" }}>const</span> <span style={{ color: "#f9a8d4" }}>ss</span> = SpreadsheetApp.openById(<span style={{ color: "#f9a8d4" }}>SPREADSHEET_ID</span>);<br />
          <br />
          <span style={{ color: "#c084fc" }}>function</span> <span style={{ color: "#60a5fa" }}>doGet</span>(e) {"{"}<br />
          &nbsp;&nbsp;<span style={{ color: "#c084fc" }}>const</span> action = e.parameter.action;<br />
          &nbsp;&nbsp;<span style={{ color: "#64748b" }}>// Route ke fungsi yang tepat</span><br />
          &nbsp;&nbsp;<span style={{ color: "#c084fc" }}>return</span> ContentService<br />
          &nbsp;&nbsp;&nbsp;&nbsp;.createTextOutput(JSON.stringify(result))<br />
          &nbsp;&nbsp;&nbsp;&nbsp;.setMimeType(ContentService.MimeType.<span style={{ color: "#86efac" }}>JSON</span>);<br />
          {"}"}
        </div>
      </div>
      <div style={{ background: "#0f172a", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ color: "#86efac", fontSize: 11, fontWeight: 600 }}>Deployed: https://script.google.com/macros/s/[ID]/exec</span>
      </div>
    </div>
  );
}

// ─── Main Tutorial Component ───────────────────────────────────────────────────
export default function TutorialPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Tutorial Aplikasi Daily Indicators A336";
  }, []);

  const handleSavePDF = async () => {
    if (!contentRef.current) return;
    setSaving(true);
    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: "Tutorial-Daily-Indicators-A336.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f8fafc",
            // onclone fires on the CLONED document html2canvas renders —
            // this is where we must fix oklch, not document.head
            onclone: (clonedDoc: Document) => {
              // 1. Replace oklch in every <style> element in <head>
              clonedDoc.head.querySelectorAll("style").forEach((el) => {
                if (el.textContent?.includes("oklch")) {
                  el.textContent = replaceOklch(el.textContent);
                }
              });
              // 2. Disable external <link> stylesheets that may carry oklch
              clonedDoc.head.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
                (el as HTMLLinkElement).disabled = true;
              });
              // 3. Add a safe baseline
              const s = clonedDoc.createElement("style");
              s.textContent = `
                body { background: #f8fafc !important; color: #0f172a !important; }
                .tut-print-btn { display: none !important; }
              `;
              clonedDoc.head.appendChild(s);
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(contentRef.current)
        .save();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={contentRef}
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", color: "#0f172a", lineHeight: 1.7, fontSize: 15 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .tut-cover {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1a56db 100%);
          padding: 80px 60px; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          min-height: 100vh; justify-content: center;
        }
        .tut-badge {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
          color: #93c5fd; font-size: 11px; font-weight: 700; letter-spacing: 2.5px;
          text-transform: uppercase; padding: 6px 20px; border-radius: 20px; margin-bottom: 32px;
        }
        .tut-cover-h1 { font-size: 52px; font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 16px; max-width: 800px; }
        .tut-cover-h1 span { color: #60a5fa; }
        .tut-cover-sub { font-size: 19px; color: #93c5fd; max-width: 560px; margin-bottom: 0; }
        .tut-cover-meta { display: flex; gap: 48px; margin-top: 40px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.12); }
        .tut-cover-meta-item .label { font-size: 10px; color: #7dd3fc; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px; }
        .tut-cover-meta-item .val { font-size: 16px; color: #fff; font-weight: 700; }
        .tut-divider { width: 60px; height: 3px; background: linear-gradient(90deg,#60a5fa,#818cf8); border-radius: 2px; margin: 28px auto; }
        .tut-print-btn {
          position: fixed; bottom: 28px; right: 28px;
          background: #1a56db; color: white; border: none;
          padding: 14px 26px; border-radius: 50px; font-size: 14px; font-weight: 700;
          cursor: pointer; box-shadow: 0 4px 24px rgba(26,86,219,0.4);
          z-index: 9999; transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .tut-print-btn:hover { background: #1240a8; transform: translateY(-2px); }
        .tut-print-btn:disabled { opacity: 0.6; transform: none; cursor: wait; }
        .tut-wrap { max-width: 860px; margin: 0 auto; padding: 48px 56px; }
        .tut-chapter {
          background: linear-gradient(135deg, #1a56db 0%, #1240a8 100%);
          color: white; padding: 44px 56px; margin: 0 -56px 40px; page-break-before: always;
        }
        .tut-chapter-num { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #93c5fd; margin-bottom: 10px; }
        .tut-chapter h2 { font-size: 30px; font-weight: 800; margin: 0 0 10px; color: white; }
        .tut-chapter p { font-size: 14px; color: #bfdbfe; margin: 0; max-width: 580px; }
        .tut-h3 { font-size: 19px; font-weight: 700; color: #0f172a; margin: 32px 0 14px; padding-left: 14px; border-left: 4px solid #1a56db; }
        .tut-h4 { font-size: 14px; font-weight: 700; color: #1240a8; margin: 18px 0 8px; }
        .tut-p { margin-bottom: 12px; font-size: 14px; color: #1e293b; }
        .tut-step { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .tut-step-hd { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
        .tut-step-num { width: 30px; height: 30px; border-radius: 50%; background: #1a56db; color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tut-step-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .tut-step-body { padding: 18px; }
        .tut-code { background: #1e293b; border-radius: 8px; padding: 18px 20px; margin: 14px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 12.5px; line-height: 1.65; color: #e2e8f0; overflow-x: auto; white-space: pre; position: relative; }
        .tut-code-label { position: absolute; top: 8px; right: 10px; font-size: 10px; color: #475569; font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 0.5px; }
        .kw { color: #c084fc; } .fn { color: #60a5fa; } .str { color: #86efac; }
        .cmt { color: #475569; font-style: italic; } .num { color: #fb923c; } .var { color: #f9a8d4; }
        .tut-callout { border-radius: 8px; padding: 14px 18px; margin: 14px 0; display: flex; gap: 12px; align-items: flex-start; }
        .tut-callout-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .tut-callout-title { font-weight: 700; font-size: 13px; margin-bottom: 3px; }
        .tut-callout-text { font-size: 12.5px; }
        .callout-info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .callout-info .tut-callout-title { color: #1d4ed8; }
        .callout-warn { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .callout-warn .tut-callout-title { color: #b45309; }
        .callout-success { background: #f0fdf4; border-left: 4px solid #22c55e; }
        .callout-success .tut-callout-title { color: #15803d; }
        .callout-danger { background: #fef2f2; border-left: 4px solid #ef4444; }
        .callout-danger .tut-callout-title { color: #b91c1c; }
        .tut-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
        .tut-table th { background: #1a56db; color: white; padding: 9px 12px; text-align: left; font-weight: 600; font-size: 12px; }
        .tut-table td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        .tut-table tr:nth-child(even) td { background: #f8fafc; }
        .tut-ind-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
        .tut-ind-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; background: white; position: relative; }
        .tut-ind-name { font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 3px; }
        .tut-ind-target { font-size: 11.5px; color: #64748b; }
        .tut-ind-weight { position: absolute; top: 10px; right: 10px; background: #1a56db; color: white; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .tut-arch { background: #0f172a; border-radius: 12px; padding: 28px 32px; margin: 16px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 2.2; color: #e2e8f0; }
        .arch-box-b { display: inline-block; border: 2px solid #3b82f6; border-radius: 7px; padding: 6px 16px; margin: 3px; color: #60a5fa; font-weight: 600; }
        .arch-box-g { border-color: #22c55e !important; color: #86efac !important; }
        .arch-box-y { border-color: #f59e0b !important; color: #fcd34d !important; }
        .arch-box-p { border-color: #a855f7 !important; color: #d8b4fe !important; }
        .arch-arrow { color: #475569; margin: 0 6px; }
        .badge-adv { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #dbeafe; color: #1d4ed8; }
        .badge-cash { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; }
        .badge-cs { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #fce7f3; color: #9d174d; }
        .badge-admin { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #fef3c7; color: #92400e; }
        .tut-toc { background: white; padding: 52px 56px; page-break-after: always; }
        .tut-toc h2 { font-size: 26px; font-weight: 800; color: #1a56db; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
        .tut-toc-item { display: flex; align-items: center; padding: 7px 0; border-bottom: 1px dotted #e2e8f0; font-size: 13.5px; }
        .tut-toc-num { font-weight: 700; color: #1a56db; min-width: 40px; }
        .tut-toc-sub { padding-left: 18px; }
        .tut-ul { padding-left: 22px; margin-bottom: 12px; }
        .tut-ul li { margin-bottom: 5px; font-size: 13.5px; }
        .tut-sep { height: 1px; background: #e2e8f0; margin: 28px 0; }
        .tut-footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 28px 0; border-top: 1px solid #e2e8f0; margin-top: 40px; }
        .mockup-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin: 24px 0; }
        @media print {
          .tut-print-btn { display: none !important; }
          .tut-cover { page-break-after: always; min-height: auto; }
          .tut-toc { page-break-after: always; }
          .tut-chapter { page-break-before: always; }
          .tut-code { font-size: 11px; }
          .tut-wrap { padding: 36px 44px; }
          .tut-chapter { padding: 36px 44px; margin: 0 -44px 36px; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── SAVE PDF BUTTON ── */}
      <button className="tut-print-btn" onClick={handleSavePDF} disabled={saving}>
        {saving ? "⏳ Memproses..." : "⬇ Simpan PDF"}
      </button>

      {/* ══════════════════ COVER ══════════════════ */}
      <div className="tut-cover">
        <div className="tut-badge">Tutorial Lengkap · Step by Step · 2026</div>
        <h1 className="tut-cover-h1">Aplikasi <span>Daily Indicators</span><br />Branch A336</h1>
        <p className="tut-cover-sub">Panduan Lengkap Membangun Sistem Monitoring KPI Harian dengan React + Google Apps Script + Google Sheets — Dari Nol Hingga Deploy</p>
        <div className="tut-divider" />
        <div className="tut-cover-meta">
          <div className="tut-cover-meta-item"><div className="label">Frontend</div><div className="val">React 18 + Tailwind</div></div>
          <div className="tut-cover-meta-item"><div className="label">Backend</div><div className="val">Google Apps Script</div></div>
          <div className="tut-cover-meta-item"><div className="label">Database</div><div className="val">Google Sheets (Gratis)</div></div>
          <div className="tut-cover-meta-item"><div className="label">Total Bab</div><div className="val">10 Bab</div></div>
        </div>
      </div>

      {/* ══════════════════ TOC ══════════════════ */}
      <div className="tut-toc">
        <h2>📋 Daftar Isi</h2>
        {[
          { num: "BAB 1", title: "Gambaran Umum & Arsitektur Aplikasi" },
          { num: "1.1", title: "Latar Belakang & Tujuan", sub: true },
          { num: "1.2", title: "Arsitektur Sistem", sub: true },
          { num: "1.3", title: "9 Indikator & Bobot", sub: true },
          { num: "1.4", title: "Sistem Role & Hak Akses", sub: true },
          { num: "BAB 2", title: "Setup Google Sheets sebagai Database" },
          { num: "2.1", title: "Membuat Spreadsheet & 5 Sheet", sub: true },
          { num: "2.2", title: "Struktur Kolom Tiap Sheet", sub: true },
          { num: "BAB 3", title: "Google Apps Script — Backend API" },
          { num: "3.1", title: "Membuat Project & Deploy Web App", sub: true },
          { num: "3.2", title: "doGet / doPost Router", sub: true },
          { num: "3.3", title: "CRUD: Submit, Read, Delete", sub: true },
          { num: "BAB 4", title: "Setup Project React (Frontend)" },
          { num: "4.1", title: "Vite + TypeScript + Tailwind", sub: true },
          { num: "4.2", title: "Struktur Folder & API Service Layer", sub: true },
          { num: "BAB 5", title: "Sistem Login & Role-Based Access" },
          { num: "BAB 6", title: "Form Submit Indikator + Foto" },
          { num: "BAB 7", title: "Riwayat & History User" },
          { num: "BAB 8", title: "Fitur Admin — Manajemen Role & Target" },
          { num: "BAB 9", title: "Export Data CSV" },
          { num: "BAB 10", title: "Deploy & Troubleshooting" },
        ].map((item, i) => (
          <div key={i} className={item.sub ? "tut-toc-sub" : ""}>
            <div className="tut-toc-item">
              <span className="tut-toc-num">{item.num}</span>
              <span>{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════ BAB 1 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 1</div>
          <h2>Gambaran Umum & Arsitektur Aplikasi</h2>
          <p>Memahami apa yang dibangun, mengapa, dan bagaimana semua komponen bekerja bersama.</p>
        </div>

        <h3 className="tut-h3">1.1 Latar Belakang & Tujuan</h3>
        <p className="tut-p">Aplikasi <strong>Daily Indicators Branch A336</strong> adalah sistem monitoring KPI harian berbasis web. Awalnya menggunakan Supabase (berbayar), kemudian bermigrasi ke <strong>Google Sheets + Apps Script</strong> yang gratis dan multi-device.</p>

        <div className="tut-callout callout-info">
          <span className="tut-callout-icon">💡</span>
          <div>
            <div className="tut-callout-title">Mengapa Google Sheets?</div>
            <div className="tut-callout-text">Database REST API gratis, tidak perlu server, bisa dilihat/edit manual via spreadsheet, aksesibel dari browser/mobile manapun, quota 20.000 request/hari.</div>
          </div>
        </div>

        <h3 className="tut-h3">1.2 Arsitektur Sistem</h3>
        <div className="tut-arch">
          <div style={{ color: "#475569", fontFamily: "Inter, sans-serif", fontSize: 12, marginBottom: 8 }}>ARSITEKTUR KESELURUHAN</div>
          <br />
          <span className="arch-box-b">React App (Frontend)</span>
          <span className="arch-arrow">⟷ HTTPS ⟷</span>
          <span className="arch-box-b arch-box-g">Google Apps Script (API)</span>
          <span className="arch-arrow">⟷ Read/Write ⟷</span>
          <span className="arch-box-b arch-box-y">Google Sheets (DB)</span>
          <br /><br />
          <span className="arch-box-b arch-box-p">Google Drive (Foto)</span>
          <span className="arch-arrow">⟷</span>
          <span className="arch-box-b arch-box-g">Apps Script Upload Handler</span>
        </div>

        <h3 className="tut-h3">1.3 Daftar 9 Indikator Utama</h3>
        <div className="tut-ind-grid">
          {[
            ["1. Sales", "Target: Rp 6.000.000/hari", "30%"],
            ["2. Jumlah Transaksi", "Target: 6 trx/hari", "10%"],
            ["3. Basket Size", "Otomatis: Sales ÷ Trx", "10%"],
            ["4. WA Personal", "Target: 20 WA + 1 foto", "10%"],
            ["5. No. Baru Customer", "50% dari total transaksi", "10%"],
            ["6. After Sales", "Target: 1 foto/hari", "5%"],
            ["7. Proteksi", "Target: 1 item/hari", "10%"],
            ["8. Google Review", "Target: 1 review/hari", "5%"],
            ["9. MGB", "Target: 10 + 3 foto", "10%"],
          ].map(([name, target, weight]) => (
            <div className="tut-ind-card" key={name}>
              <div className="tut-ind-weight">{weight}</div>
              <div className="tut-ind-name">{name}</div>
              <div className="tut-ind-target">{target}</div>
            </div>
          ))}
        </div>

        <h3 className="tut-h3">1.4 Sistem Role & Hak Akses</h3>
        <table className="tut-table">
          <thead><tr><th>Role</th><th>Indikator Aktif</th><th>Admin?</th></tr></thead>
          <tbody>
            <tr><td><span className="badge-adv">Advisor</span></td><td>Sales, Trx, Basket, WA, No.Baru, AfterSales, Proteksi, GoogleReview, MGB</td><td>Tidak</td></tr>
            <tr><td><span className="badge-cash">Cashier</span></td><td>Sales, Trx, Basket, Proteksi, GoogleReview</td><td>Tidak</td></tr>
            <tr><td><span className="badge-cs">CS</span></td><td>WA, AfterSales, GoogleReview, MGB</td><td>Tidak</td></tr>
            <tr><td><span className="badge-admin">Admin</span></td><td>View semua</td><td>Ya — CRUD Role, Target, User</td></tr>
          </tbody>
        </table>
      </div>

      {/* ══════════════════ BAB 2 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 2</div>
          <h2>Setup Google Sheets sebagai Database</h2>
          <p>Membangun fondasi database gratis dengan struktur tabel yang tepat sejak awal.</p>
        </div>

        <h3 className="tut-h3">2.1 Membuat Spreadsheet & 5 Sheet</h3>
        <div className="tut-step">
          <div className="tut-step-hd"><div className="tut-step-num">1</div><div className="tut-step-title">Buka sheets.google.com → "+ Spreadsheet kosong"</div></div>
          <div className="tut-step-body">
            <p className="tut-p">Beri nama: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>Daily Indicators A336 - Database</code></p>
            <div className="tut-callout callout-info">
              <span className="tut-callout-icon">📌</span>
              <div>
                <div className="tut-callout-title">Catat Spreadsheet ID dari URL!</div>
                <div className="tut-callout-text">URL: <code>docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit</code> — ID ini dipakai di Apps Script.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="tut-step">
          <div className="tut-step-hd"><div className="tut-step-num">2</div><div className="tut-step-title">Buat 5 tab Sheet dengan klik "+" di bawah</div></div>
          <div className="tut-step-body">
            <ul className="tut-ul">
              <li><strong>Users</strong> — data pengguna, username, password, role</li>
              <li><strong>Submissions</strong> — semua data submit indikator harian</li>
              <li><strong>Indicators</strong> — konfigurasi indikator & bobot</li>
              <li><strong>Roles</strong> — daftar role yang tersedia</li>
              <li><strong>Config</strong> — pengaturan global</li>
            </ul>
          </div>
        </div>

        <h3 className="tut-h3">Hasil Akhir: Tampilan Google Sheets Database</h3>
        <p className="tut-p">Begini tampilan spreadsheet setelah data diisi — perhatikan tab sheet di bawah dan struktur kolom sheet <strong>Submissions</strong>:</p>
        <MockupSheets />

        <h3 className="tut-h3">2.2 Struktur Kolom Tiap Sheet</h3>
        <h4 className="tut-h4">Sheet: Users</h4>
        <table className="tut-table">
          <thead><tr><th>A: id</th><th>B: name</th><th>C: username</th><th>D: password</th><th>E: role</th></tr></thead>
          <tbody>
            <tr><td>USR001</td><td>Budi Santoso</td><td>budi</td><td>pass123</td><td>Advisor</td></tr>
            <tr><td>USR002</td><td>Siti Rahayu</td><td>siti</td><td>pass123</td><td>Cashier</td></tr>
          </tbody>
        </table>
        <h4 className="tut-h4">Sheet: Submissions (18 kolom — 1 baris = 1 submission harian)</h4>
        <table className="tut-table">
          <thead>
            <tr>
              <th>A: id</th><th>B: branchId</th><th>C: userNik</th><th>D: userName</th><th>E: date</th><th>F: createdAt</th><th>G: totalScore</th>
              <th style={{ background: "#2563eb" }}>H: sales</th><th style={{ background: "#2563eb" }}>I: trx</th><th style={{ background: "#2563eb" }}>J: basket</th>
              <th style={{ background: "#2563eb" }}>K: wa_personal</th><th style={{ background: "#2563eb" }}>L: no_baru</th><th style={{ background: "#2563eb" }}>M: after_sales</th>
              <th style={{ background: "#2563eb" }}>N: proteksi</th><th style={{ background: "#2563eb" }}>O: google_review</th><th style={{ background: "#2563eb" }}>P: mgb</th>
              <th>Q: photos</th><th>R: notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sub-001</td><td>A336</td><td>NIK001</td><td>Budi</td><td>2026-05-23</td><td>2026-05-23T09:15Z</td><td>85</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>7500000</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>8</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>180000</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>18</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>2</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>3</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>1</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>4</td>
              <td style={{ background: "#eff6ff", fontWeight: 600 }}>6</td>
              <td style={{ fontSize: 11 }}>https://drive...</td><td>Target sales lewat</td>
            </tr>
          </tbody>
        </table>
        <div className="tut-callout callout-info" style={{ marginTop: 8 }}>
          <span className="tut-callout-icon">💡</span>
          <div>
            <div className="tut-callout-title">Kenapa per kolom, bukan JSON?</div>
            <div className="tut-callout-text">Google Sheets membatasi satu cell maksimal <strong>50.000 karakter</strong>. Format JSON yang menggabungkan semua indikator + foto bisa melampaui batas itu dan <strong>tidak bisa di-copy-paste ke spreadsheet lain</strong>. Dengan 1 indikator = 1 kolom, setiap cell hanya berisi angka kecil (~10 karakter).</div>
          </div>
        </div>
        <h4 className="tut-h4">Sheet: Indicators</h4>
        <table className="tut-table">
          <thead><tr><th>id</th><th>name</th><th>weight</th><th>target</th><th>roles</th><th>requirePhoto</th></tr></thead>
          <tbody>
            <tr><td>IND001</td><td>Sales</td><td>30</td><td>6000000</td><td>Advisor,Cashier</td><td>false</td></tr>
            <tr><td>IND004</td><td>WA Personal</td><td>10</td><td>20</td><td>Advisor</td><td>true</td></tr>
          </tbody>
        </table>
      </div>

      {/* ══════════════════ BAB 3 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 3</div>
          <h2>Google Apps Script — Backend API</h2>
          <p>Membangun REST API serverless tanpa biaya server menggunakan Google Apps Script.</p>
        </div>

        <h3 className="tut-h3">3.1 Membuat Project & Deploy</h3>
        <div className="tut-step">
          <div className="tut-step-hd"><div className="tut-step-num">1</div><div className="tut-step-title">Dari Google Sheets → Extensions → Apps Script</div></div>
          <div className="tut-step-body"><p className="tut-p">IDE Apps Script terbuka dan sudah terhubung ke spreadsheet secara otomatis.</p></div>
        </div>
        <div className="tut-step">
          <div className="tut-step-hd"><div className="tut-step-num">2</div><div className="tut-step-title">Deploy → New deployment → Web app → Anyone</div></div>
          <div className="tut-step-body">
            <ol className="tut-ul" style={{ listStyle: "decimal" }}>
              <li>Klik <strong>Deploy → New deployment</strong></li>
              <li>Type: <strong>Web app</strong></li>
              <li>Execute as: <strong>Me</strong></li>
              <li>Who has access: <strong>Anyone</strong></li>
              <li>Klik <strong>Deploy</strong> → izinkan permissions</li>
              <li>Salin URL: <code>https://script.google.com/macros/s/[ID]/exec</code></li>
            </ol>
          </div>
        </div>

        <h3 className="tut-h3">Tampilan Apps Script Editor</h3>
        <MockupAppsScript />

        <h3 className="tut-h3">3.2 doGet & doPost Router</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<div class="tut-code-label">Code.gs</div>
<span class="kw">const</span> <span class="var">SPREADSHEET_ID</span> = <span class="str">'YOUR_SPREADSHEET_ID'</span>;
<span class="kw">const</span> <span class="var">GDRIVE_FOLDER_ID</span> = <span class="str">''</span>; <span class="cmt">// opsional — isi untuk upload foto ke Drive</span>

<span class="kw">function</span> <span class="fn">doGet</span>(e) {
  <span class="kw">return</span> ContentService
    .createTextOutput(JSON.stringify({ status: <span class="str">'ok'</span>, message: <span class="str">'API running'</span> }))
    .setMimeType(ContentService.MimeType.JSON);
}

<span class="kw">function</span> <span class="fn">doPost</span>(e) {
  <span class="kw">try</span> {
    <span class="kw">var</span> params = JSON.parse(e.postData.contents);
    <span class="kw">switch</span>(params.action) {
      <span class="kw">case</span> <span class="str">'addSubmission'</span>:   <span class="kw">return</span> <span class="fn">ok</span>(<span class="fn">addSubmission</span>(params.data));
      <span class="kw">case</span> <span class="str">'updateSettings'</span>:  <span class="kw">return</span> <span class="fn">ok</span>(<span class="fn">updateSettings</span>(params.data));
      <span class="kw">case</span> <span class="str">'deleteSubmission'</span>: <span class="kw">return</span> <span class="fn">ok</span>(<span class="fn">deleteSubmission</span>(params.data));
      <span class="kw">default</span>: <span class="kw">throw new</span> Error(<span class="str">'Invalid action: '</span> + params.action);
    }
  } <span class="kw">catch</span>(err) {
    <span class="kw">return</span> ContentService
      .createTextOutput(JSON.stringify({ success: <span class="kw">false</span>, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

<span class="kw">function</span> <span class="fn">ok</span>(result) {
  <span class="kw">return</span> ContentService
    .createTextOutput(JSON.stringify({ success: <span class="kw">true</span>, data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}` }} />

        <h3 className="tut-h3">3.3 addSubmission — Simpan Per Kolom Indikator</h3>
        <p className="tut-p">Setiap submission disimpan sebagai <strong>satu baris</strong> dengan masing-masing indikator di kolomnya sendiri (H–P). Tidak ada lagi JSON besar di satu cell.</p>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<div class="tut-code-label">Code.gs</div>
<span class="cmt">// Urutan kolom H–P di sheet Submissions</span>
<span class="kw">var</span> INDICATOR_ORDER = [<span class="str">'sales'</span>,<span class="str">'trx'</span>,<span class="str">'basket'</span>,<span class="str">'wa_personal'</span>,<span class="str">'no_baru'</span>,<span class="str">'after_sales'</span>,<span class="str">'proteksi'</span>,<span class="str">'google_review'</span>,<span class="str">'mgb'</span>];

<span class="kw">function</span> <span class="fn">addSubmission</span>(submission) {
  <span class="kw">var</span> sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(<span class="str">'submissions'</span>);
  <span class="kw">if</span> (!sheet) <span class="kw">throw new</span> Error(<span class="str">'Sheet "submissions" not found'</span>);

  <span class="cmt">// Ekstrak nilai per indikator — support format array maupun object</span>
  <span class="kw">var</span> ind = extractIndicatorValues(submission.data);

  <span class="cmt">// Foto: upload ke Drive (jika dikonfigurasi) atau simpan thumbnail kecil</span>
  <span class="kw">var</span> photosStr = processPhotos(submission.photos || {}, submission.photosThumbs || {}, submission.id);

  <span class="cmt">// A–G = metadata, H–P = nilai tiap indikator, Q = foto URL, R = notes</span>
  <span class="kw">var</span> row = [
    submission.id,                                          <span class="cmt">// A</span>
    submission.branchId,                                    <span class="cmt">// B</span>
    submission.user ? submission.user.nik  : <span class="str">''</span>,           <span class="cmt">// C</span>
    submission.user ? submission.user.nama : <span class="str">''</span>,           <span class="cmt">// D</span>
    submission.date,                                        <span class="cmt">// E</span>
    submission.createdAt || <span class="kw">new</span> Date().toISOString(),      <span class="cmt">// F</span>
    submission.totalScore || <span class="num">0</span>,                           <span class="cmt">// G</span>
    ind[<span class="str">'sales'</span>]         || <span class="num">0</span>,                           <span class="cmt">// H</span>
    ind[<span class="str">'trx'</span>]           || <span class="num">0</span>,                           <span class="cmt">// I</span>
    ind[<span class="str">'basket'</span>]        || <span class="num">0</span>,                           <span class="cmt">// J</span>
    ind[<span class="str">'wa_personal'</span>]   || <span class="num">0</span>,                           <span class="cmt">// K</span>
    ind[<span class="str">'no_baru'</span>]       || <span class="num">0</span>,                           <span class="cmt">// L</span>
    ind[<span class="str">'after_sales'</span>]   || <span class="num">0</span>,                           <span class="cmt">// M</span>
    ind[<span class="str">'proteksi'</span>]      || <span class="num">0</span>,                           <span class="cmt">// N</span>
    ind[<span class="str">'google_review'</span>] || <span class="num">0</span>,                           <span class="cmt">// O</span>
    ind[<span class="str">'mgb'</span>]           || <span class="num">0</span>,                           <span class="cmt">// P</span>
    photosStr,                                              <span class="cmt">// Q</span>
    submission.notes ? JSON.stringify(submission.notes) : <span class="str">''</span>  <span class="cmt">// R</span>
  ];
  sheet.appendRow(row);
  <span class="kw">return</span> { id: submission.id, success: <span class="kw">true</span> };
}

<span class="cmt">/**
 * processPhotos — upload ke Drive jika GDRIVE_FOLDER_ID diisi,
 * atau simpan thumbnail 64px (dikirim frontend) langsung di cell.
 * Thumbnail ~3KB per foto — aman untuk batas 50k karakter Google Sheets.
 */</span>
<span class="kw">function</span> <span class="fn">processPhotos</span>(photos, thumbs, submissionId) {
  <span class="kw">if</span> (GDRIVE_FOLDER_ID) {
    <span class="cmt">// Upload full-size photo ke Drive → simpan URL</span>
    <span class="kw">try</span> {
      <span class="kw">var</span> folder = DriveApp.getFolderById(GDRIVE_FOLDER_ID);
      <span class="kw">var</span> result = {};
      <span class="kw">for</span> (<span class="kw">var</span> indId <span class="kw">in</span> photos) {
        result[indId] = [];
        <span class="kw">var</span> arr = photos[indId];
        <span class="kw">for</span> (<span class="kw">var</span> i = <span class="num">0</span>; i &lt; arr.length; i++) {
          <span class="kw">try</span> {
            <span class="kw">var</span> b64 = arr[i].indexOf(<span class="str">','</span>) &gt; -<span class="num">1</span> ? arr[i].split(<span class="str">','</span>)[<span class="num">1</span>] : arr[i];
            <span class="kw">var</span> bytes = Utilities.base64Decode(b64);
            <span class="kw">var</span> blob  = Utilities.newBlob(bytes, <span class="str">'image/jpeg'</span>, submissionId + <span class="str">'_'</span> + indId + <span class="str">'_'</span> + i + <span class="str">'.jpg'</span>);
            <span class="kw">var</span> file  = folder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            result[indId].push(<span class="str">'https://drive.google.com/thumbnail?id='</span> + file.getId() + <span class="str">'&sz=w300'</span>);
          } <span class="kw">catch</span>(e) { <span class="cmt">/* skip foto gagal upload */</span> }
        }
      }
      <span class="kw">return</span> JSON.stringify(result);
    } <span class="kw">catch</span>(e) {
      Logger.log(<span class="str">'Drive upload error: '</span> + e.message);
    }
  }
  <span class="cmt">// Fallback: simpan thumbnail kecil (64px, ~3KB/foto) langsung di cell</span>
  <span class="kw">if</span> (thumbs &amp;&amp; Object.keys(thumbs).length &gt; <span class="num">0</span>) {
    <span class="kw">return</span> JSON.stringify(thumbs);
  }
  <span class="kw">return</span> <span class="str">''</span>;
}` }} />

        <h3 className="tut-h3">3.4 Migrasi Data Lama ke Format Per Kolom</h3>
        <p className="tut-p">Jika spreadsheet lama menyimpan semua data indikator sebagai JSON di satu cell (kolom H), jalankan fungsi migrasi sekali untuk memecahnya ke per-kolom. <strong>Backup spreadsheet dulu!</strong></p>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<div class="tut-code-label">Code.gs — jalankan sekali dari Apps Script Editor</div>
<span class="kw">function</span> <span class="fn">migrateToColumnsFormat</span>() {
  <span class="kw">var</span> sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(<span class="str">'submissions'</span>);

  <span class="cmt">// Update header row ke format baru</span>
  <span class="kw">var</span> newHeaders = [
    <span class="str">'id'</span>,<span class="str">'branchId'</span>,<span class="str">'userNik'</span>,<span class="str">'userName'</span>,<span class="str">'date'</span>,<span class="str">'createdAt'</span>,<span class="str">'totalScore'</span>,
    <span class="str">'sales'</span>,<span class="str">'trx'</span>,<span class="str">'basket'</span>,<span class="str">'wa_personal'</span>,<span class="str">'no_baru'</span>,<span class="str">'after_sales'</span>,
    <span class="str">'proteksi'</span>,<span class="str">'google_review'</span>,<span class="str">'mgb'</span>,<span class="str">'photos'</span>,<span class="str">'notes'</span>
  ];
  sheet.getRange(<span class="num">1</span>, <span class="num">1</span>, <span class="num">1</span>, newHeaders.length).setValues([newHeaders]);

  <span class="kw">var</span> lastRow = sheet.getLastRow();
  <span class="kw">for</span> (<span class="kw">var</span> row = <span class="num">2</span>; row &lt;= lastRow; row++) {
    <span class="kw">var</span> vals = sheet.getRange(row, <span class="num">1</span>, <span class="num">1</span>, <span class="num">18</span>).getValues()[<span class="num">0</span>];
    <span class="kw">var</span> colH = String(vals[<span class="num">7</span>] || <span class="str">\'\'</span>);
    <span class="cmt">// Skip baris yang sudah format baru (nilai numerik, bukan JSON)</span>
    <span class="kw">if</span> (!colH.startsWith(<span class="str">\'[\'</span>) &amp;&amp; !colH.startsWith(<span class="str">\'{\'</span>)) <span class="kw">continue</span>;

    <span class="kw">var</span> ind = extractIndicatorValues(JSON.parse(colH));
    <span class="kw">var</span> newPart = INDICATOR_ORDER.map(<span class="kw">function</span>(id) { <span class="kw">return</span> ind[id] || <span class="num">0</span>; });
    newPart.push(<span class="str">\'\'</span>);                       <span class="cmt">// Q: photos (base64 dibuang)</span>
    newPart.push(String(vals[<span class="num">9</span>] || <span class="str">\'\'</span>));  <span class="cmt">// R: notes lama</span>
    sheet.getRange(row, <span class="num">8</span>, <span class="num">1</span>, newPart.length).setValues([newPart]);
    <span class="kw">if</span> (row % <span class="num">20</span> === <span class="num">0</span>) Utilities.sleep(<span class="num">300</span>); <span class="cmt">// hindari timeout</span>
  }
  Logger.log(<span class="str">\'Migrasi selesai!\'</span>);
}` }} />

        <div className="tut-callout callout-warn">
          <span className="tut-callout-icon">⚠️</span>
          <div>
            <div className="tut-callout-title">Cara Menjalankan Migrasi</div>
            <div className="tut-callout-text">
              1. Buka Apps Script Editor → pilih fungsi <code>migrateToColumnsFormat</code> dari dropdown<br />
              2. Klik <strong>▶ Run</strong> → cek Execution Log untuk progress<br />
              3. Fungsi ini aman dijalankan berulang (data yang sudah format baru akan di-skip)<br />
              4. <strong>Foto base64 tidak bisa di-recover</strong> — hanya URL Drive yang disimpan ulang
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ BAB 4 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 4</div>
          <h2>Setup Project React (Frontend)</h2>
          <p>Membangun antarmuka pengguna dengan React 18, TypeScript, dan Tailwind CSS.</p>
        </div>

        <h3 className="tut-h3">4.1 Inisialisasi Project</h3>
        <div className="tut-code">
          <span className="cmt"># Buat project dengan Vite + TypeScript</span>
{`
`}npm create vite@latest daily-indicators -- --template react-ts
{`
`}cd daily-indicators && npm install
{`
`}
{`
`}<span className="cmt"># Install Tailwind CSS</span>
{`
`}npm install -D tailwindcss postcss autoprefixer
{`
`}npx tailwindcss init -p
{`
`}
{`
`}<span className="cmt"># Install library tambahan</span>
{`
`}npm install lucide-react motion clsx tailwind-merge</div>

        <h3 className="tut-h3">4.2 Struktur Folder</h3>
        <div className="tut-code">
          src/
{`
`}├── app/
{`
`}│   ├── App.tsx              <span className="cmt">// Auth gate + routing</span>
{`
`}│   └── routes.tsx
{`
`}├── components/
{`
`}│   ├── LoginPage.tsx        <span className="cmt">// Halaman login</span>
{`
`}│   ├── Dashboard.tsx        <span className="cmt">// Dashboard indikator harian</span>
{`
`}│   ├── IndicatorForm.tsx    <span className="cmt">// Form submit per indikator</span>
{`
`}│   ├── HistoryPage.tsx      <span className="cmt">// Riwayat submission</span>
{`
`}│   ├── AdminPanel.tsx       <span className="cmt">// Panel admin</span>
{`
`}│   └── ExportButton.tsx     <span className="cmt">// Download CSV</span>
{`
`}├── services/
{`
`}│   └── api.ts               <span className="cmt">// Semua API calls ke Apps Script</span>
{`
`}└── types/
{`
`}    └── index.ts             <span className="cmt">// TypeScript interfaces</span></div>

        <h3 className="tut-h3">4.3 API Service Layer</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<div class="tut-code-label">src/services/api.ts</div>
<span class="kw">const</span> <span class="var">API_URL</span> = <span class="str">'https://script.google.com/macros/s/[ID]/exec'</span>;

<span class="kw">export async function</span> <span class="fn">apiGet</span>(action: string, params = {}) {
  <span class="kw">const</span> q = <span class="kw">new</span> URLSearchParams({ action, ...params });
  <span class="kw">return</span> (<span class="kw">await</span> fetch(API_URL + '?' + q)).json();
}

<span class="kw">export async function</span> <span class="fn">apiPost</span>(action: string, body = {}) {
  <span class="kw">return</span> (<span class="kw">await</span> fetch(API_URL, {
    method: <span class="str">'POST'</span>,
    headers: { <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span> },
    body: JSON.stringify({ action, ...body })
  })).json();
}

<span class="kw">export const</span> api = {
  login:          (u, p) => <span class="fn">apiPost</span>(<span class="str">'login'</span>, { username: u, password: p }),
  getIndicators:  () => <span class="fn">apiGet</span>(<span class="str">'getIndicators'</span>),
  getRoles:       () => <span class="fn">apiGet</span>(<span class="str">'getRoles'</span>),
  getSubmissions: (userId?, date?) =>
    <span class="fn">apiGet</span>(<span class="str">'getSubmissions'</span>, {...(userId &amp;&amp; {userId}), ...(date &amp;&amp; {date}) }),
  submitIndicator: (data) => <span class="fn">apiPost</span>(<span class="str">'submitIndicator'</span>, data),
};` }} />
      </div>

      {/* ══════════════════ BAB 5 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 5</div>
          <h2>Sistem Login & Role-Based Access</h2>
          <p>Autentikasi ringan dengan localStorage persistence dan kontrol akses per role.</p>
        </div>

        <div className="mockup-row">
          <MockupLogin />
        </div>

        <h3 className="tut-h3">5.1 Login Handler di Apps Script</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<span class="kw">function</span> <span class="fn">login</span>(data) {
  <span class="kw">const</span> sheet = ss.getSheetByName(<span class="str">'Users'</span>);
  <span class="kw">const</span> rows  = sheet.getDataRange().getValues();
  <span class="kw">const</span> hdr   = rows[<span class="num">0</span>];

  <span class="kw">const</span> found = rows.slice(<span class="num">1</span>).find(row => {
    <span class="kw">const</span> obj = {}; hdr.forEach((h,i) => obj[h] = row[i]);
    <span class="cmt">// .trim() untuk handle spasi tersembunyi di cell Sheet</span>
    <span class="kw">return</span> String(obj.username).trim() === data.username.trim()
        &amp;&amp; String(obj.password).trim() === data.password.trim();
  });

  <span class="kw">if</span> (!found) <span class="kw">return</span> { success: <span class="kw">false</span>, error: <span class="str">'Username/password salah'</span> };

  <span class="kw">const</span> user = {}; hdr.forEach((h,i) => user[h] = found[i]);
  <span class="kw">delete</span> user.password; <span class="cmt">// JANGAN kirim password ke frontend!</span>
  <span class="kw">return</span> { success: <span class="kw">true</span>, user };
}` }} />

        <h3 className="tut-h3">5.2 useAuth Hook (React)</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<div class="tut-code-label">hooks/useAuth.ts</div>
<span class="kw">export function</span> <span class="fn">useAuth</span>() {
  <span class="cmt">// Persist login state di localStorage</span>
  <span class="kw">const</span> [user, setUser] = useState(() => {
    <span class="kw">try</span> { <span class="kw">return</span> JSON.parse(localStorage.getItem(<span class="str">'currentUser'</span>) || <span class="str">'null'</span>); }
    <span class="kw">catch</span> { <span class="kw">return null</span>; }
  });

  <span class="kw">const</span> login = <span class="kw">async</span> (username: string, password: string) => {
    <span class="kw">const</span> res = <span class="kw">await</span> api.login(username, password);
    <span class="kw">if</span> (res.success) {
      localStorage.setItem(<span class="str">'currentUser'</span>, JSON.stringify(res.user));
      setUser(res.user);
    }
    <span class="kw">return</span> res;
  };

  <span class="kw">const</span> logout = () => {
    localStorage.removeItem(<span class="str">'currentUser'</span>);
    setUser(<span class="kw">null</span>);
  };

  <span class="kw">return</span> { user, login, logout };
}` }} />
      </div>

      {/* ══════════════════ BAB 6 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 6</div>
          <h2>Form Submit Indikator + Catatan & Foto</h2>
          <p>Form cerdas yang hanya menampilkan indikator sesuai role, mendukung catatan dan upload foto.</p>
        </div>

        <div className="mockup-row">
          <MockupDashboard />
          <MockupSubmitForm />
        </div>

        <h3 className="tut-h3">6.1 Filter Indikator per Role</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<span class="cmt">// Hanya tampilkan indikator yang sesuai role user</span>
<span class="kw">const</span> myIndicators = useMemo(
  () => indicators.filter(ind => ind.roles.includes(user.role)),
  [indicators, user.role]
);

<span class="cmt">// Basket Size dihitung otomatis — tidak perlu input</span>
<span class="kw">const</span> basketSize = useMemo(() => {
  <span class="kw">const</span> s = submissions.find(s => s.indicatorName === <span class="str">'Sales'</span>     &amp;&amp; s.date === today);
  <span class="kw">const</span> t = submissions.find(s => s.indicatorName === <span class="str">'Transaksi'</span> &amp;&amp; s.date === today);
  <span class="kw">return</span> s &amp;&amp; t &amp;&amp; t.value > <span class="num">0</span> ? Math.round(s.value / t.value) : <span class="num">0</span>;
}, [submissions, today]);` }} />

        <h3 className="tut-h3">6.2 Upload Foto ke Google Drive</h3>
        <div className="tut-code">
          <div className="tut-code-label">Code.gs — uploadPhoto</div>
          <span className="kw">function</span> <span className="fn">uploadPhoto</span>(data) {"{"}
{`
`}  <span className="kw">const</span> folder = DriveApp.getFolderById(<span className="str">'YOUR_GDRIVE_FOLDER_ID'</span>);
{`
`}  <span className="kw">const</span> bytes  = Utilities.base64Decode(data.fileData.split(<span className="str">','</span>)[<span className="num">1</span>]);
{`
`}  <span className="kw">const</span> blob   = Utilities.newBlob(bytes, data.mimeType, data.fileName);
{`
`}  <span className="kw">const</span> file   = folder.createFile(blob);
{`
`}  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
{`
`}  <span className="kw">return</span> {"{"} success: <span className="kw">true</span>, url: <span className="str">{"`"}https://drive.google.com/uc?id=${"{"}file.getId(){"}"}{"`"}</span> {"}"};
{`
`}{"}"}</div>

        <div className="tut-callout callout-info">
          <span className="tut-callout-icon">📸</span>
          <div>
            <div className="tut-callout-title">Tips: Resize Foto Sebelum Upload</div>
            <div className="tut-callout-text">Gunakan Canvas API untuk resize ke max 800×600 sebelum kirim. Ukuran dari ~2MB turun ke ~150KB, waktu upload dari ~15 detik ke ~2 detik.</div>
          </div>
        </div>
      </div>

      {/* ══════════════════ BAB 7 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 7</div>
          <h2>Riwayat & History User</h2>
          <p>Menampilkan data submission dengan format tanggal Indonesia dan filter per tanggal.</p>
        </div>

        <div className="mockup-row">
          <MockupHistory />
        </div>

        <div className="tut-callout callout-warn">
          <span className="tut-callout-icon">🐛</span>
          <div>
            <div className="tut-callout-title">Bug Umum: Riwayat Tidak Muncul</div>
            <div className="tut-callout-text">Penyebab: parameter <code>userId</code> terkirim sebagai string <code>"undefined"</code>. Solusi: tambahkan guard di Apps Script: <code>if (params.userId && params.userId !== 'undefined')</code></div>
          </div>
        </div>

        <h3 className="tut-h3">7.1 getSubmissions dengan Filter yang Benar</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<span class="kw">function</span> <span class="fn">getSubmissions</span>(params) {
  <span class="kw">const</span> sheet = ss.getSheetByName(<span class="str">'Submissions'</span>);
  <span class="kw">if</span> (sheet.getLastRow() &lt;= <span class="num">1</span>) <span class="kw">return</span> []; <span class="cmt">// sheet kosong</span>

  <span class="kw">const</span> data = sheet.getDataRange().getValues();
  <span class="kw">const</span> hdr  = data[<span class="num">0</span>];
  <span class="kw">let</span> rows = data.slice(<span class="num">1</span>)
    .filter(r => r[<span class="num">0</span>] !== <span class="str">''</span>)
    .map(r => { <span class="kw">const</span> o = {}; hdr.forEach((h,i) => o[h] = r[i]); <span class="kw">return</span> o; });

  <span class="kw">if</span> (params.userId &amp;&amp; params.userId !== <span class="str">'undefined'</span>)
    rows = rows.filter(r => String(r.userId) === String(params.userId));

  <span class="kw">if</span> (params.date &amp;&amp; params.date !== <span class="str">'undefined'</span>)
    rows = rows.filter(r => String(r.date).substring(<span class="num">0</span>,<span class="num">10</span>) === params.date);

  <span class="kw">return</span> rows.reverse(); <span class="cmt">// terbaru di atas</span>
}` }} />
      </div>

      {/* ══════════════════ BAB 8 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 8</div>
          <h2>Fitur Admin — Manajemen Role & Target</h2>
          <p>Panel admin untuk CRUD role, edit target indikator, dan kelola user tanpa menyentuh kode.</p>
        </div>

        <div className="mockup-row">
          <MockupAdmin />
        </div>

        <h3 className="tut-h3">8.1 CRUD Role di Apps Script</h3>
        <div className="tut-code">
          <span className="kw">function</span> <span className="fn">addRole</span>(data) {"{"}
{`
`}  ss.getSheetByName(<span className="str">'Roles'</span>).appendRow([<span className="str">'ROL'</span>+Date.now(), data.name, data.description]);
{`
`}  <span className="kw">return</span> {"{"} success: <span className="kw">true</span> {"}"};
{`
`}{"}"}
{`
`}
{`
`}<span className="kw">function</span> <span className="fn">deleteRole</span>(data) {"{"}
{`
`}  <span className="kw">const</span> sheet = ss.getSheetByName(<span className="str">'Roles'</span>);
{`
`}  <span className="kw">const</span> rows  = sheet.getDataRange().getValues();
{`
`}  <span className="kw">for</span> (<span className="kw">let</span> i = <span className="num">1</span>; i {"<"} rows.length; i++) {"{"}
{`
`}    <span className="kw">if</span> (rows[i][<span className="num">0</span>] === data.id) {"{"} sheet.deleteRow(i + <span className="num">1</span>); <span className="kw">return</span> {"{"} success: <span className="kw">true</span> {"}"}; {"}"}
{`
`}  {"}"}
{`
`}  <span className="kw">return</span> {"{"} error: <span className="str">'Role tidak ditemukan'</span> {"}"};
{`
`}{"}"}
{`
`}
{`
`}<span className="kw">function</span> <span className="fn">updateIndicator</span>(data) {"{"}
{`
`}  <span className="kw">const</span> sheet = ss.getSheetByName(<span className="str">'Indicators'</span>);
{`
`}  <span className="kw">const</span> rows  = sheet.getDataRange().getValues();
{`
`}  <span className="kw">const</span> hdr   = rows[<span className="num">0</span>];
{`
`}  <span className="kw">for</span> (<span className="kw">let</span> i = <span className="num">1</span>; i {"<"} rows.length; i++) {"{"}
{`
`}    <span className="kw">if</span> (rows[i][<span className="num">0</span>] === data.id) {"{"}
{`
`}      sheet.getRange(i+<span className="num">1</span>, hdr.indexOf(<span className="str">'target'</span>)+<span className="num">1</span>).setValue(data.target);
{`
`}      sheet.getRange(i+<span className="num">1</span>, hdr.indexOf(<span className="str">'roles'</span>)+<span className="num">1</span>).setValue(data.roles.join(<span className="str">','</span>));
{`
`}      <span className="kw">return</span> {"{"} success: <span className="kw">true</span> {"}"};
{`
`}    {"}"}
{`
`}  {"}"}
{`
`}  <span className="kw">return</span> {"{"} error: <span className="str">'Indikator tidak ditemukan'</span> {"}"};
{`
`}{"}"}</div>
      </div>

      {/* ══════════════════ BAB 9 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 9</div>
          <h2>Export Data CSV</h2>
          <p>Download laporan lengkap dengan filter tanggal dan link foto, kompatibel dengan Excel.</p>
        </div>

        <h3 className="tut-h3">9.1 Export Handler + BOM untuk Excel</h3>
        <div className="tut-code" dangerouslySetInnerHTML={{ __html: `<span class="cmt">// React: Download CSV dengan BOM agar Excel baca UTF-8 dengan benar</span>
<span class="kw">const</span> handleExport = <span class="kw">async</span> () => {
  <span class="kw">const</span> res = <span class="kw">await</span> <span class="fn">apiPost</span>(<span class="str">'exportData'</span>, { userId, startDate, endDate });
  <span class="kw">const</span> BOM  = <span class="str">'\uFEFF'</span>; <span class="cmt">// BOM = Byte Order Mark untuk Excel UTF-8</span>
  <span class="kw">const</span> blob = <span class="kw">new</span> Blob([BOM + res.csv], { type: <span class="str">'text/csv;charset=utf-8'</span> });
  <span class="kw">const</span> url  = URL.createObjectURL(blob);
  <span class="kw">const</span> a   = document.createElement(<span class="str">'a'</span>);
  a.href = url; a.download = \`laporan-\${startDate}-sd-\${endDate}.csv\`;
  a.click(); URL.revokeObjectURL(url);
}` }} />

        <div className="tut-callout callout-success">
          <span className="tut-callout-icon">📊</span>
          <div>
            <div className="tut-callout-title">Kolom photoUrl di CSV</div>
            <div className="tut-callout-text">Link foto Google Drive ikut tersimpan di kolom <code>photoUrl</code> sehingga bisa diklik langsung dari Excel atau Google Sheets.</div>
          </div>
        </div>
      </div>

      {/* ══════════════════ BAB 10 ══════════════════ */}
      <div className="tut-wrap">
        <div className="tut-chapter">
          <div className="tut-chapter-num">BAB 10</div>
          <h2>Deploy & Troubleshooting</h2>
          <p>Checklist deployment dan solusi untuk masalah yang paling sering ditemui.</p>
        </div>

        <h3 className="tut-h3">10.1 Checklist Sebelum Go-Live</h3>
        <ul className="tut-ul">
          <li>✅ <code>SPREADSHEET_ID</code> di Apps Script sudah benar</li>
          <li>✅ Google Drive Folder ID untuk foto dikonfigurasi</li>
          <li>✅ Apps Script di-deploy sebagai Web App → Anyone</li>
          <li>✅ URL Apps Script sudah diisi di <code>src/services/api.ts</code></li>
          <li>✅ <code>npm run build</code> berhasil tanpa error TypeScript</li>
          <li>✅ Test login, submit, riwayat, export di localhost</li>
          <li>✅ Upload folder <code>dist/</code> ke Vercel / Netlify</li>
        </ul>

        <h3 className="tut-h3">10.2 Tabel Troubleshooting</h3>
        <table className="tut-table">
          <thead><tr><th>Masalah</th><th>Penyebab</th><th>Solusi</th></tr></thead>
          <tbody>
            {[
              ["CORS Error","MimeType salah","Pastikan semua response pakai setMimeType(MimeType.JSON)"],
              ["Riwayat kosong","userId = 'undefined'","Guard: if (params.userId && params.userId !== 'undefined')"],
              ["Data tidak update","Belum redeploy","Deploy → Manage deployments → Edit → Deploy"],
              ["Foto tidak tampil","Drive belum public","Pastikan setSharing() dipanggil setelah createFile()"],
              ["Login gagal","Spasi di cell Sheet","Tambahkan .trim() saat bandingkan username & password"],
              ["Waktu salah 7 jam","Tidak pakai timezone","Utilities.formatDate(now, 'Asia/Jakarta', '...')"],
              ["Excel rusak / kotak","Encoding tanpa BOM","Tambahkan '\\uFEFF' sebelum CSV string saat download"],
              ["Cell > 50.000 karakter / tidak bisa copy-paste ke sheet lain","JSON indikator + foto base64 tersimpan di satu cell","Jalankan migrateToColumnsFormat() dari Apps Script Editor — data dipecah ke kolom H–P, base64 foto dibuang"],
            ].map(([m, s, sol], i) => (
              <tr key={i}>
                <td><strong>{m}</strong></td>
                <td style={{ fontSize: 12 }}>{s}</td>
                <td style={{ fontSize: 12 }}>{sol}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tut-sep" />

        <div className="tut-callout callout-success" style={{ padding: 24 }}>
          <span className="tut-callout-icon" style={{ fontSize: 28 }}>🎉</span>
          <div>
            <div className="tut-callout-title" style={{ fontSize: 16 }}>Selamat! Aplikasi Siap Digunakan</div>
            <div className="tut-callout-text" style={{ marginTop: 8 }}>
              Anda telah membangun sistem monitoring KPI yang:
              <ul className="tut-ul" style={{ marginTop: 8 }}>
                <li>✅ Gratis sepenuhnya — tidak ada biaya server/database</li>
                <li>✅ Multi-device — bisa diakses dari HP, tablet, laptop</li>
                <li>✅ 4 role: Advisor, Cashier, CS, Admin</li>
                <li>✅ 9 indikator KPI dengan total bobot 100%</li>
                <li>✅ Foto bukti per indikator (WA, AfterSales, MGB)</li>
                <li>✅ Riwayat format "Hari (TANGGAL | WAKTU)"</li>
                <li>✅ Export laporan CSV kompatibel Excel</li>
                <li>✅ Admin panel CRUD tanpa sentuh kode</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tut-footer">
          Tutorial Aplikasi Daily Indicators Branch A336 · React + Google Apps Script + Google Sheets · 2026<br />
          <span style={{ fontSize: 11, marginTop: 4, display: "block" }}>
            Klik tombol biru "⬇ Simpan PDF" di pojok kanan bawah untuk download
          </span>
        </div>
      </div>
    </div>
  );
}
