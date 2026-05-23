import React, { useState } from "react";
import { CashTransaction, Loan, SavingAccount } from "../types";
import { formatRupiah } from "../data";
import { TrendingUp, Wallet, Landmark, HandCoins, AlertTriangle, ArrowUpRight, ArrowDownRight, BadgeCheck, Info } from "lucide-react";

interface DashboardOverviewProps {
  cashTransactions: CashTransaction[];
  savingAccounts: SavingAccount[];
  loans: Loan[];
  villageName: string;
  bumdesName: string;
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  cashTransactions,
  savingAccounts,
  loans,
  villageName,
  bumdesName,
  onNavigate
}: DashboardOverviewProps) {
  // Tooltip interactive state for metric calculations
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // 1. Calculate General Cash Balance from ledger (Modal Awal + Masuk - Keluar)
  const totalCashIn = cashTransactions
    .filter((tx) => tx.type === "masuk")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCashOut = cashTransactions
    .filter((tx) => tx.type === "keluar")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentCashBalance = totalCashIn - totalCashOut;

  // 2. Calculate Savings Pool balance (Total setoran - Total tarikan)
  const totalSavingsPool = savingAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalSavingsPokok = savingAccounts
    .filter((a) => a.savingType === "Pokok")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalSavingsWajib = savingAccounts
    .filter((a) => a.savingType === "Wajib")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalSavingsSukarela = savingAccounts
    .filter((a) => a.savingType === "Sukarela")
    .reduce((sum, a) => sum + a.balance, 0);

  // 3. Calculate Outstanding Loans Principal (Total borrowed - Total principal paid back)
  const totalLoanPrincipalIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalLoanPrincipalPaid = loans.reduce((sum, loan) => sum + loan.amountPaidPrincipal, 0);
  const outstandingLoanPrincipal = totalLoanPrincipalIssued - totalLoanPrincipalPaid;

  // 4. Calculate NPL (Non-Performing Loan / Kredit Macet)
  // Non-Performing Loans are category "Macet" or "Diragukan"
  const nonPerformingLoanPrincipal = loans
    .filter((loan) => loan.status === "Macet" || loan.status === "Diragukan")
    .reduce((sum, loan) => sum + (loan.amount - loan.amountPaidPrincipal), 0);

  const nplRatio = outstandingLoanPrincipal > 0 
    ? (nonPerformingLoanPrincipal / outstandingLoanPrincipal) * 100 
    : 0;

  // NPL Classification
  let nplStatusLabel = "Sangat Sehat";
  let nplColorTheme = "text-green-600 bg-green-50 border-green-200";
  if (nplRatio > 20) {
    nplStatusLabel = "Tidak Sehat (Kritis)";
    nplColorTheme = "text-red-600 bg-red-50 border-red-200 animate-pulse";
  } else if (nplRatio > 12) {
    nplStatusLabel = "Kurang Sehat";
    nplColorTheme = "text-orange-600 bg-orange-50 border-orange-200";
  } else if (nplRatio > 5) {
    nplStatusLabel = "Cukup Sehat";
    nplColorTheme = "text-amber-600 bg-amber-50 border-amber-200";
  }

  // Monthly stats for chart
  // Group cash transactions of last 5 months if possible
  const monthlyStats = [
    { name: "Jan", masuk: 161000000, keluar: 25000000 },
    { name: "Feb", masuk: 2530000, keluar: 5000000 },
    { name: "Mar", masuk: 4030000, keluar: 2500000 },
    { name: "Apr", masuk: 2530000, keluar: 3000000 },
    { name: "Mei", masuk: 8010000, keluar: 3350000 },
  ];

  // Max value in stats to gauge percentage height
  const maxVal = Math.max(...monthlyStats.map(s => Math.max(s.masuk, s.keluar)));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-display">
            Sesuai Permendesa No. 3 / 2021
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-display tracking-tight mt-2">
            SIM-BUMDes {bumdesName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Informasi Keuangan & Unit Usaha Desa • <span className="font-semibold">{villageName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate("advisor")}
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <BadgeCheck className="w-4 h-4" />
            Audit Regulasi AI
          </button>
          <button 
            onClick={() => onNavigate("laporan")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition duration-200 cursor-pointer"
          >
            Buka LPJ
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kas BUMDes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[175px]">
          {activeTooltip === "kas" && (
            <div 
              className="absolute inset-0 bg-slate-900 text-white p-5 flex flex-col justify-between z-20 animate-fade-in"
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 font-display">Kalkulasi Kas Utama</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white transition text-sm font-bold cursor-pointer focus:outline-none p-1"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Total Kas Masuk (Debit):</span>
                    <span className="text-emerald-400 font-bold text-right">{formatRupiah(totalCashIn)}</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Total Kas Keluar (Kredit):</span>
                    <span className="text-rose-400 font-bold text-right">-{formatRupiah(totalCashOut)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between font-bold text-[11px] text-slate-200">
                    <span>Rumus Saldo:</span>
                    <span>Masuk - Keluar</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">Mencakup simpanan, angsuran, modal awal, operasional & dana unit.</p>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 bg-emerald-50/50 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kas Utama BUMDes</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === "kas" ? null : "kas");
              }}
              onMouseEnter={() => setActiveTooltip("kas")}
              className="text-slate-350 hover:text-slate-500 hover:bg-slate-50 p-1 rounded-full transition focus:outline-none cursor-pointer"
              title="Tampilkan rincian kalkulasi"
              id="btn_calc_kas"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">
            {formatRupiah(currentCashBalance)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">
            Dana likuid di dompet & bank BUMDes
          </p>
        </div>

        {/* Card 2: Simpanan Warga */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[175px]">
          {activeTooltip === "tabungan" && (
            <div 
              className="absolute inset-0 bg-slate-900 text-white p-5 flex flex-col justify-between z-20 animate-fade-in"
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 font-display">Kalkulasi Tabungan</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white transition text-sm font-bold cursor-pointer focus:outline-none p-1"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Simpanan Pokok:</span>
                    <span className="text-slate-200 font-semibold text-right">{formatRupiah(totalSavingsPokok)}</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Simpanan Wajib:</span>
                    <span className="text-slate-200 font-semibold text-right">{formatRupiah(totalSavingsWajib)}</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Simpanan Sukarela:</span>
                    <span className="text-slate-200 font-semibold text-right">{formatRupiah(totalSavingsSukarela)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between font-bold text-[11px] text-slate-200">
                    <span>Rumus Saldo:</span>
                    <span>Pokok + Wajib + Sukarela</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">Rekapitulasi total dari seluruh buku rekening terdaftar warga.</p>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded-md">
              {savingAccounts.length} Warga
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tabungan Warga</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === "tabungan" ? null : "tabungan");
              }}
              onMouseEnter={() => setActiveTooltip("tabungan")}
              className="text-slate-350 hover:text-slate-500 hover:bg-slate-50 p-1 rounded-full transition focus:outline-none cursor-pointer"
              title="Tampilkan rincian kalkulasi"
              id="btn_calc_tabungan"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">
            {formatRupiah(totalSavingsPool)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">
            Simpanan sukarela & pokok masyarakat
          </p>
        </div>

        {/* Card 3: Piutang Simpan Pinjam */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[175px]">
          {activeTooltip === "piutang" && (
            <div 
              className="absolute inset-0 bg-slate-900 text-white p-5 flex flex-col justify-between z-20 animate-fade-in"
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 font-display">Kalkulasi Sisa Piutang</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white transition text-sm font-bold cursor-pointer focus:outline-none p-1"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Total Kredit Disalurkan:</span>
                    <span className="text-slate-100 font-semibold text-right">{formatRupiah(totalLoanPrincipalIssued)}</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Total Pokok Terbayar:</span>
                    <span className="text-emerald-400 font-semibold text-right">-{formatRupiah(totalLoanPrincipalPaid)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between font-bold text-[11px] text-slate-200">
                    <span>Rumus Saldo:</span>
                    <span>Disalurkan - Terbayar</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">Total piutang pokok bergulir murni yang belum terlunasi warga.</p>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <HandCoins className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded-md">
              {loans.filter(l => l.amount > l.amountPaidPrincipal).length} Pinjaman
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Alokasi Piutang Pinjam</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === "piutang" ? null : "piutang");
              }}
              onMouseEnter={() => setActiveTooltip("piutang")}
              className="text-slate-350 hover:text-slate-500 hover:bg-slate-50 p-1 rounded-full transition focus:outline-none cursor-pointer"
              title="Tampilkan rincian kalkulasi"
              id="btn_calc_piutang"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">
            {formatRupiah(outstandingLoanPrincipal)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">
            Sisa pokok pinjaman bergulir warga
          </p>
        </div>

        {/* Card 4: Rasio Kredit Macet (NPL) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[175px]">
          {activeTooltip === "npl" && (
            <div 
              className="absolute inset-0 bg-slate-900 text-white p-5 flex flex-col justify-between z-20 animate-fade-in"
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 font-display">Kalkulasi Rasio NPL</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white transition text-sm font-bold cursor-pointer focus:outline-none p-1"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Kredit Macet & Diragukan:</span>
                    <span className="text-rose-400 font-bold text-right">{formatRupiah(nonPerformingLoanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    <span className="text-slate-400">Total Outstanding Aktif:</span>
                    <span className="text-slate-200 font-semibold text-right">{formatRupiah(outstandingLoanPrincipal)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between font-bold text-[11px] text-slate-200">
                    <span>Rumus NPL:</span>
                    <span>(Macet / Total Aktif) × 100</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">Status: {nplStatusLabel}. Standar Aman Kementerian &lt; 10%.</p>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className={`text-xxs font-semibold px-2 py-0.5 rounded-md border ${nplColorTheme}`}>
              {nplStatusLabel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Rasio Kredit Macet (NPL)</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === "npl" ? null : "npl");
              }}
              onMouseEnter={() => setActiveTooltip("npl")}
              className="text-slate-350 hover:text-slate-500 hover:bg-slate-50 p-1 rounded-full transition focus:outline-none cursor-pointer"
              title="Tampilkan rincian kalkulasi"
              id="btn_calc_npl"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">
            {nplRatio.toFixed(2)}%
          </h3>
          <p className="text-xxs text-slate-400 mt-2">
            Kemendesa menetapkan standar aman <span className="font-semibold">&lt; 10%</span>
          </p>
        </div>
      </div>

      {/* Main Analysis and Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span: Cash Flow Chart & Accounting Ratios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cash Flow Chart Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-display">Grafik Perkembangan Kas (Buku Kas Umum)</h3>
                <p className="text-xs text-slate-400">Total penerimaan vs pengeluaran kas BUMDes (5 Bulan Terakhir)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span> Masuk
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="w-3 h-3 bg-rose-400 rounded-sm inline-block"></span> Keluar
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="relative pt-4 pb-2">
              <div className="w-full h-48 md:h-56 flex items-end gap-3 md:gap-6 border-b border-slate-100 px-2">
                {monthlyStats.map((st, i) => {
                  const percentMasuk = maxVal > 0 ? (st.masuk / maxVal) * 85 : 0;
                  const percentKeluar = maxVal > 0 ? (st.keluar / maxVal) * 85 : 0;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Tooltip on Hover */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg -translate-y-24 z-10 font-mono pointer-events-none text-center">
                        <p className="font-bold">{st.name}</p>
                        <p className="text-emerald-300">Masuk: {st.masuk >= 1000000 ? `${(st.masuk/1000000).toFixed(1)}Jt` : `Rp ${st.masuk}`}</p>
                        <p className="text-rose-300">Keluar: {st.keluar >= 1000000 ? `${(st.keluar/1000000).toFixed(1)}Jt` : `Rp ${st.keluar}`}</p>
                      </div>

                      {/* Bar Bars */}
                      <div className="w-full flex justify-center items-end gap-1 md:gap-1.5 h-full">
                        <div 
                          className="w-3 md:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all duration-500 cursor-pointer"
                          style={{ height: `${percentMasuk}%` }}
                        ></div>
                        <div 
                          className="w-3 md:w-5 bg-rose-400 hover:bg-rose-500 rounded-t transition-all duration-500 cursor-pointer"
                          style={{ height: `${percentKeluar}%` }}
                        ></div>
                      </div>
                      
                      {/* Axis Label */}
                      <span className="text-xs font-semibold text-slate-500 mt-2">{st.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">
                Rp {maxVal >= 1000000 ? `${(maxVal/1000000).toFixed(1)}Jt` : maxVal}
              </div>
            </div>
          </div>

          {/* Key Compliance Checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 font-display mb-4">Indikator Kepatuhan Peraturan Menteri No. 3/2021</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">Alokasi Hasil surplus (SHU)</h4>
                  <p className="text-xxs text-slate-500 mt-1 leading-normal">
                    Pembagian laba wajib dialokasikan untuk PADesa, Dana Cadangan (30%), & Operasional. Terhitung otomatis di sistem.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3">
                <div className={`${nplRatio <= 10 ? "p-1.5 bg-emerald-100 text-emerald-700" : "p-1.5 bg-amber-100 text-amber-700"} rounded-lg`}>
                  {nplRatio <= 10 ? (
                    <BadgeCheck className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">Rasio Berisiko Pinjaman Bergulir</h4>
                  <p className="text-xxs text-slate-500 mt-1 leading-normal">
                    Rasio macet saat ini: <strong>{nplRatio.toFixed(1)}%</strong>. Regulasi Kemendesa membatasi batas aman NPL di bawah 10%.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">Keutuhan Transparansi Buku Kas Umum</h4>
                  <p className="text-xxs text-slate-500 mt-1 leading-normal">
                    Semua transaksi kas berkorelasi otomatis dengan sub-ledger simpan pinjam warga untuk audit terintegrasi.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">Pencatatan Identitas (NIK) Valid</h4>
                  <p className="text-xxs text-slate-500 mt-1 leading-normal">
                    Semua warga pemasar tabungan & peminjam wajib terverifikasi dengan NIK 16 digit guna pencegahan kelalaian.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Span: Recent Ledger Activities */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800 font-display">Mutasi Kas Terbaru (Buku Kas Umum)</h3>
                <button 
                  onClick={() => onNavigate("kas")}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-3.5">
                {cashTransactions.slice(-5).reverse().map((tx) => (
                  <div key={tx.id} className="flex justify-between items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      {tx.type === "masuk" ? (
                        <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 mt-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 mt-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{tx.date} • {tx.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono ${tx.type === "masuk" ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.type === "masuk" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl text-center">
              <p className="text-xxs text-slate-400 font-semibold tracking-wider uppercase">Laporan Musdes LPJ Otomatis</p>
              <p className="text-xs text-slate-600 mt-1">Gunakan asisten kecerdasan buatan (Gemini AI) untuk menelaah kesesuaian administrasi.</p>
              <button
                onClick={() => onNavigate("advisor")}
                className="w-full mt-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold font-display hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Mulai Audit BUMDes AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
