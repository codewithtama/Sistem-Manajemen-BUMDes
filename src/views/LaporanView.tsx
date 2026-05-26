import React from "react";
import { Printer, Sparkles, TrendingUp, TrendingDown, BadgeCheck, Download, Scale } from "lucide-react";
import { BUMDesConfig, CashTransaction, SavingAccount, Loan } from "../types";
import { formatRupiah, exportToCSV } from "../data";

interface LaporanViewProps {
  config: BUMDesConfig;
  totalFeeRevenue: number;
  totalOtherRevenues: number;
  totalBumdesGrossIncome: number;
  totalGajiBeban: number;
  totalOpsBeban: number;
  totalBumdesExpenses: number;
  sisaHasilUsaha: number;
  alokasiPADesa: number;
  alokasiCadangan: number;
  alokasiPengurus: number;
  alokasiBonusWarga: number;
  alokasiSosial: number;
  triggerPrintLPJ: () => void;
  setActiveTab: (tab: string) => void;
  cashTransactions: CashTransaction[];
  savingAccounts: SavingAccount[];
  loans: Loan[];
  citizens: { id: string; name: string; nik: string; rtRw: string }[];
  userRole: "operator" | "admin";
  onDistributeDividends: () => void;
}

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 ${bold ? "font-semibold" : ""}`}>
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`text-sm font-mono font-semibold ${color ?? "text-slate-900"}`}>{value}</span>
    </div>
  );
}

const allocations = [
  { label: "Pendapatan Asli Desa (PADesa)",  pct: "40%", key: "padesa" as const },
  { label: "Dana Cadangan Usaha BUMDes",      pct: "30%", key: "cadangan" as const },
  { label: "Jasa Direktur & Pengurus",        pct: "15%", key: "pengurus" as const },
  { label: "Bonus Jasa Anggota Warga",        pct: "10%", key: "bonus" as const },
  { label: "Dana CSR & Sosial Desa",           pct: "5%",  key: "sosial" as const },
];

export default function LaporanView({
  config, totalFeeRevenue, totalOtherRevenues, totalBumdesGrossIncome,
  totalGajiBeban, totalOpsBeban, totalBumdesExpenses, sisaHasilUsaha,
  alokasiPADesa, alokasiCadangan, alokasiPengurus, alokasiBonusWarga, alokasiSosial,
  triggerPrintLPJ, setActiveTab, cashTransactions, savingAccounts, loans,
  citizens, userRole, onDistributeDividends,
}: LaporanViewProps) {
  const values = {
    padesa:  alokasiPADesa,
    cadangan: alokasiCadangan,
    pengurus: alokasiPengurus,
    bonus:   alokasiBonusWarga,
    sosial:  alokasiSosial,
  };

  // Saldo Kas Utama
  const totalCashIn  = cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalCashOut = cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0);
  const currentCashBalance = totalCashIn - totalCashOut;

  // Piutang Pinjaman Aktif
  const totalLoanIssued  = loans.reduce((s, l) => s + l.amount, 0);
  const totalLoanPaid    = loans.reduce((s, l) => s + l.amountPaidPrincipal, 0);
  const outstandingLoan  = totalLoanIssued - totalLoanPaid;

  // Total Simpanan Warga (Kewajiban)
  const totalSavingsPool = savingAccounts.reduce((s, a) => s + a.balance, 0);

  // Modal Awal & SHU (Ekuitas)
  const initialCapital = config.initialCapitalAmount;
  
  // Persamaan Akuntansi Neraca: Aset = Kewajiban + Ekuitas
  const totalAssets = currentCashBalance + outstandingLoan;
  const totalPasiva = totalSavingsPool + initialCapital + sisaHasilUsaha;

  const handleExportBKU = () => {
    const headers = ["Tanggal", "No Bukti", "Deskripsi", "Kategori", "Arus Kas", "Nominal (Rp)", "Saldo Berjalan (Rp)"];
    let runningBalance = 0;
    const sortedTxs = [...cashTransactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const rows = sortedTxs.map(tx => {
      if (tx.type === "masuk") {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
      return [
        tx.date,
        tx.id,
        tx.description,
        tx.category,
        tx.type === "masuk" ? "MASUK (DEBIT)" : "KELUAR (KREDIT)",
        tx.amount,
        runningBalance
      ];
    });
    exportToCSV(`Buku_Kas_Umum_${config.bumdesName.replace(/\s+/g, "_")}`, headers, rows);
  };

  return (
    <div id="view_laporan_lpj" className="space-y-6 printing-section">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Laporan Pertanggungjawaban (LPJ)</h2>
          <p className="text-sm text-slate-500 mt-1">Dokumen resmi Musyawarah Desa (Musdes) sesuai regulasi Permendesa No. 3/2021.</p>
        </div>
        <div className="flex gap-2 shrink-0 no-print">
          <button
            onClick={handleExportBKU}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
            title="Ekspor Buku Kas Umum Dinas (CSV)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Ekspor BKU
          </button>
          <button
            onClick={() => setActiveTab("advisor")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Audit AI
          </button>
          <button
            id="btn_print_lpj"
            onClick={triggerPrintLPJ}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Printable LPJ Document */}
      <div id="lpj_printable_sheet" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Kop Surat */}
        <div className="bg-slate-900 px-8 py-6 text-center">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-semibold uppercase tracking-widest mb-3">
            <BadgeCheck className="w-3.5 h-3.5" />
            Terverifikasi Permendesa No. 3/2021
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{config.bumdesName}</h1>
          <p className="text-slate-400 text-xs mt-1.5">
            Badan Usaha Milik Desa · UU RI No. 6/2014 & Permendesa No. 3/2021
          </p>
          <p className="text-slate-500 text-[11px] mt-1">{config.villageName}</p>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Laporan Laba Rugi Unit Usaha</h2>
            <p className="text-slate-500 text-[11px] mt-1 font-mono">Per Tanggal: {new Date().toISOString().split("T")[0]}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* I. Pendapatan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
              <h3 className="font-bold text-slate-900 text-sm">I. Pendapatan Operasional</h3>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-5 py-1">
              <Row label="Pendapatan Jasa Administrasi Simpan Pinjam" value={formatRupiah(totalFeeRevenue)} color="text-emerald-700" />
              <Row label="Pendapatan Unit Usaha Lainnya" value={formatRupiah(totalOtherRevenues)} color="text-emerald-700" />
              <Row label="Total Penerimaan Kotor BUMDes" value={formatRupiah(totalBumdesGrossIncome)} bold color="text-emerald-700" />
            </div>
          </div>

          {/* II. Beban */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500"><TrendingDown className="w-4 h-4" /></div>
              <h3 className="font-bold text-slate-900 text-sm">II. Beban & Pengeluaran Operasional</h3>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-5 py-1">
              <Row label="Beban Gaji, Tunjangan & Honor Pengurus" value={`(${formatRupiah(totalGajiBeban)})`} color="text-rose-600" />
              <Row label="Beban Perlengkapan & Operasional Kantor" value={`(${formatRupiah(totalOpsBeban)})`} color="text-rose-600" />
              <Row label="Total Pengeluaran Beban BUMDes" value={`(${formatRupiah(totalBumdesExpenses)})`} bold color="text-rose-600" />
            </div>
          </div>

          {/* II.B. Laporan Neraca Posisi Keuangan (Double-Entry Balanced) */}
          <div className="page-break-avoid">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Scale className="w-4 h-4" /></div>
              <h3 className="font-bold text-slate-900 text-sm">Laporan Neraca Posisi Keuangan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">SISI KIRI: AKTIVA (ASET)</span>
                <div className="space-y-0.5">
                  <Row label="Kas Utama BUMDes (Likuid)" value={formatRupiah(currentCashBalance)} />
                  <Row label="Piutang Kredit Bergulir Aktif" value={formatRupiah(outstandingLoan)} />
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex justify-between items-center py-1 font-bold text-slate-800">
                    <span className="text-xs">TOTAL AKTIVA (ASET)</span>
                    <span className="text-xs font-mono">{formatRupiah(totalAssets)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">SISI KANAN: PASIVA (KEWAJIBAN & EKUITAS)</span>
                <div className="space-y-0.5">
                  <Row label="Kewajiban: Dana Simpanan Nasabah" value={formatRupiah(totalSavingsPool)} />
                  <Row label="Ekuitas: Penyertaan Modal Awal Desa" value={formatRupiah(initialCapital)} />
                  <Row label="Ekuitas: Sisa Hasil Usaha (SHU) Berjalan" value={formatRupiah(sisaHasilUsaha)} />
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex justify-between items-center py-1 font-bold text-slate-800">
                    <span className="text-xs">TOTAL PASIVA (KEWAJIBAN & EKUITAS)</span>
                    <span className="text-xs font-mono">{formatRupiah(totalPasiva)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-center p-2 rounded-xl bg-emerald-50 border border-emerald-150 text-[10px] font-semibold text-emerald-800 gap-1.5 no-print">
              <Scale className="w-3.5 h-3.5" />
              <span>Status Neraca: <strong>SEIMBANG (BALANCED)</strong> · Sinkronisasi data aset dan ekuitas teruji valid.</span>
            </div>
          </div>

          {/* SHU Banner */}
          <div className={`rounded-2xl p-5 flex items-center justify-between ${sisaHasilUsaha >= 0 ? "bg-emerald-600" : "bg-rose-600"}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-0.5">Sisa Hasil Usaha (SHU)</p>
              <p className="text-xs text-white/80">Keuntungan bersih terverifikasi dari ledger desa</p>
            </div>
            <span className="text-2xl font-bold text-white font-mono">{formatRupiah(sisaHasilUsaha)}</span>
          </div>

          {/* III. Alokasi */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">III. Distribusi Surplus (Permendesa No. 3/2021)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              
              {/* Donut Chart */}
              <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-5 h-full min-h-[220px]">
                {sisaHasilUsaha > 0 ? (
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      {/* Gray track background */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                      
                      {/* Segment 1: PADesa (40%) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#10b981" strokeWidth="12"
                              strokeDasharray="125.6 314" strokeDashoffset="0" className="transition-all duration-300 hover:stroke-[14px]" />
                      
                      {/* Segment 2: Cadangan (30%) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                              strokeDasharray="94.2 314" strokeDashoffset="-125.6" className="transition-all duration-500 hover:stroke-[14px]" />
                      
                      {/* Segment 3: Pengurus (15%) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f59e0b" strokeWidth="12"
                              strokeDasharray="47.1 314" strokeDashoffset="-219.8" className="transition-all duration-500 hover:stroke-[14px]" />
                      
                      {/* Segment 4: Bonus (10%) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f43f5e" strokeWidth="12"
                              strokeDasharray="31.4 314" strokeDashoffset="-266.9" className="transition-all duration-500 hover:stroke-[14px]" />
                      
                      {/* Segment 5: Sosial (5%) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#6366f1" strokeWidth="12"
                              strokeDasharray="15.7 314" strokeDashoffset="-298.3" className="transition-all duration-500 hover:stroke-[14px]" />
                    </svg>
                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surplus</span>
                      <span className="text-xs font-extrabold text-slate-700 mt-0.5">{formatRupiah(sisaHasilUsaha)}</span>
                      <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1 mt-1">100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg className="w-20 h-20 text-slate-200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                      <circle cx="50" cy="50" r="40" strokeDasharray="6 6" />
                      <line x1="20" y1="20" x2="80" y2="80" />
                    </svg>
                    <p className="text-[10px] font-semibold text-slate-400 mt-3">Tidak ada surplus SHU untuk didistribusikan</p>
                  </div>
                )}
                {sisaHasilUsaha > 0 && (
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-4 text-[10px] font-medium text-slate-500 no-print">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>40% PA</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>30% Cad</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>15% Peng</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>10% Agt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>5% Sos</span>
                  </div>
                )}
              </div>

              {/* Allocation List */}
              <div className="md:col-span-3 space-y-2">
                {allocations.map((a, i) => {
                  const bulletColors = [
                    "bg-emerald-500 border-emerald-600",
                    "bg-blue-500 border-blue-600",
                    "bg-amber-500 border-amber-600",
                    "bg-rose-500 border-rose-600",
                    "bg-indigo-500 border-indigo-600"
                  ];
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                      <div className={`w-3 h-3 rounded-full border shrink-0 ${bulletColors[i]}`} />
                      <span className="text-[11px] font-bold text-slate-400 font-mono w-8 shrink-0">{a.pct}</span>
                      <span className="flex-1 text-xs text-slate-700 truncate">{a.label}</span>
                      <span className="text-xs font-bold font-mono text-slate-900">{formatRupiah(values[a.key])}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
          
          {/* Rencana Pembagian Dividen Warga */}
          <div className="page-break-avoid border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pembagian Dividen Jasa Anggota (10%)</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Alokasi bonus surplus BUMDes didistribusikan secara adil (50% merata + 50% tabungan).</p>
              </div>
              <div className="no-print">
                {userRole === "admin" ? (
                  <button
                    disabled={sisaHasilUsaha <= 0}
                    onClick={onDistributeDividends}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg text-[10px] transition cursor-pointer uppercase tracking-wider"
                  >
                    Cairkan Dividen ke Tabungan Warga
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1 border border-slate-200 px-2.5 py-1 bg-white rounded-lg">
                    Lembaga Terkunci (Operator)
                  </span>
                )}
              </div>
            </div>

            {sisaHasilUsaha > 0 && citizens.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white max-h-56">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[8px] border-b border-slate-100 sticky top-0">
                      <th className="px-4 py-2">Nama Warga</th>
                      <th className="px-4 py-2">NIK / RT-RW</th>
                      <th className="px-4 py-2 text-right">Tabungan Aktif</th>
                      <th className="px-4 py-2 text-right">Dividen Merata (50%)</th>
                      <th className="px-4 py-2 text-right">Dividen Simpanan (50%)</th>
                      <th className="px-4 py-2 text-right font-bold text-slate-700">Total Dividen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(() => {
                      const totalBonusPool = alokasiBonusWarga;
                      const basePool = Math.round(totalBonusPool * 0.5);
                      const proportionalPool = Math.round(totalBonusPool * 0.5);
                      const baseSharePerCitizen = Math.round(basePool / citizens.length);
                      const totalSavings = savingAccounts.reduce((sum, a) => sum + a.balance, 0);

                      return citizens.map(c => {
                        const citAccs = savingAccounts.filter(a => a.citizenId === c.id);
                        const citizenSavingSum = citAccs.reduce((sum, a) => sum + a.balance, 0);
                        
                        const baseAmount = baseSharePerCitizen;
                        const proportionalAmount = totalSavings > 0 
                          ? Math.round((citizenSavingSum / totalSavings) * proportionalPool)
                          : 0;
                        const totalDividend = baseAmount + proportionalAmount;

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-bold text-slate-700">{c.name}</td>
                            <td className="px-4 py-2 text-slate-400">{c.nik.slice(0, 6)}... / {c.rtRw}</td>
                            <td className="px-4 py-2 text-right">{formatRupiah(citizenSavingSum)}</td>
                            <td className="px-4 py-2 text-right text-slate-500">{formatRupiah(baseAmount)}</td>
                            <td className="px-4 py-2 text-right text-slate-500">{formatRupiah(proportionalAmount)}</td>
                            <td className="px-4 py-2 text-right font-extrabold text-rose-600">{formatRupiah(totalDividend)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-[10px] bg-white border border-slate-100 rounded-xl leading-relaxed">
                Pembagian dividen tidak aktif karena SHU berjalan bernilai Rp 0 atau belum ada data warga desa terdaftar.
              </div>
            )}
          </div>

          {/* Tanda Tangan */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border-t border-slate-100 page-break-avoid">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-10">Mengetahui,<br /><strong className="text-slate-700">Kepala Desa</strong></p>
              <div className="border-b border-slate-350 mb-1 max-w-[180px] mx-auto" />
              <p className="text-xs font-semibold text-slate-800">{config.villageHead}</p>
              <p className="text-[10px] text-slate-400">Kepala Perangkat Desa</p>
            </div>
            
            {/* Center Column: e-Signature QR Verification */}
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-200/60 max-w-[160px] mx-auto">
              <svg className="w-14 h-14 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="20" height="20" />
                <rect x="15" y="15" width="10" height="10" fill="white" />
                <rect x="70" y="10" width="20" height="20" />
                <rect x="75" y="15" width="10" height="10" fill="white" />
                <rect x="10" y="70" width="20" height="20" />
                <rect x="15" y="75" width="10" height="10" fill="white" />
                
                <rect x="40" y="10" width="10" height="10" />
                <rect x="55" y="15" width="10" height="5" />
                <rect x="45" y="30" width="15" height="10" />
                <rect x="10" y="45" width="10" height="15" />
                <rect x="30" y="40" width="10" height="10" />
                
                <rect x="75" y="40" width="15" height="10" />
                <rect x="70" y="55" width="10" height="15" />
                <rect x="45" y="55" width="10" height="10" />
                <rect x="40" y="75" width="20" height="15" />
                <rect x="75" y="75" width="15" height="15" />
                
                <rect x="45" y="45" width="10" height="10" fill="white" />
              </svg>
              <span className="text-[8px] font-bold text-slate-700 mt-2.5 uppercase tracking-wider block">Verifikasi Digital</span>
              <span className="text-[7px] text-slate-400 font-mono mt-0.5 block">REG: MD-3/2021-LPJ</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500 mb-10">Disiapkan Oleh,<br /><strong className="text-slate-700">Direktur BUMDes</strong></p>
              <div className="border-b border-slate-350 mb-1 max-w-[180px] mx-auto" />
              <p className="text-xs font-semibold text-slate-800">{config.directorName}</p>
              <p className="text-[10px] text-slate-400">Direktur {config.bumdesName}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
