import React, { useState, useMemo } from "react";
import {
  TrendingUp, Wallet, Landmark, HandCoins, AlertTriangle,
  ArrowUpRight, ArrowDownRight, BadgeCheck, Info, ChevronRight, Percent,
} from "lucide-react";
import { CashTransaction, Loan, SavingAccount } from "../types";
import { formatRupiah } from "../data";

interface DashboardOverviewProps {
  cashTransactions: CashTransaction[];
  savingAccounts: SavingAccount[];
  loans: Loan[];
  villageName: string;
  bumdesName: string;
  onNavigate: (tab: string) => void;
  sisaHasilUsaha: number;
  citizens: { id: string; nik: string }[];
}

export default function DashboardOverview({
  cashTransactions, savingAccounts, loans, villageName, bumdesName, onNavigate,
  sisaHasilUsaha, citizens,
}: DashboardOverviewProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  /* ── Calculations ── */
  const totalCashIn  = cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalCashOut = cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0);
  const currentCashBalance = totalCashIn - totalCashOut;

  const totalSavingsPool      = savingAccounts.reduce((s, a) => s + a.balance, 0);
  const totalSavingsPokok     = savingAccounts.filter(a => a.savingType === "Pokok").reduce((s, a) => s + a.balance, 0);
  const totalSavingsWajib     = savingAccounts.filter(a => a.savingType === "Wajib").reduce((s, a) => s + a.balance, 0);
  const totalSavingsSukarela  = savingAccounts.filter(a => a.savingType === "Sukarela").reduce((s, a) => s + a.balance, 0);

  const totalLoanIssued  = loans.reduce((s, l) => s + l.amount, 0);
  const totalLoanPaid    = loans.reduce((s, l) => s + l.amountPaidPrincipal, 0);
  const outstandingLoan  = totalLoanIssued - totalLoanPaid;

  const nplPrincipal = loans
    .filter(l => l.status === "Macet" || l.status === "Diragukan")
    .reduce((s, l) => s + (l.amount - l.amountPaidPrincipal), 0);
  const nplRatio = outstandingLoan > 0 ? (nplPrincipal / outstandingLoan) * 100 : 0;

  let nplLabel = "Sangat Sehat";
  let nplBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (nplRatio > 20)       { nplLabel = "Kritis";         nplBadge = "bg-red-50 text-red-700 border-red-200"; }
  else if (nplRatio > 12)  { nplLabel = "Kurang Sehat";   nplBadge = "bg-orange-50 text-orange-700 border-orange-200"; }
  else if (nplRatio > 5)   { nplLabel = "Cukup Sehat";    nplBadge = "bg-amber-50 text-amber-700 border-amber-200"; }

  // Likuiditas: Kas Utama / Simpanan Sukarela
  const liquidityRatio = totalSavingsSukarela > 0 ? (currentCashBalance / totalSavingsSukarela) * 100 : 100;
  
  let liquidityLabel = "Aman";
  let liquidityBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (liquidityRatio < 15) {
    liquidityLabel = "Kritis";
    liquidityBadge = "bg-red-50 text-red-700 border-red-200";
  } else if (liquidityRatio < 25) {
    liquidityLabel = "Peringatan";
    liquidityBadge = "bg-orange-50 text-orange-700 border-orange-200";
  }

  /* ── Real compliance indicators ── */
  // 1. SHU: real net income is positive (profitable BUMDes)
  const hasPositiveSHU = sisaHasilUsaha > 0;

  // 2. BKU transparency: every saving/loan disbursement transaction has a referenceId
  const linkedTxCount = cashTransactions.filter(tx =>
    ["Simpanan Warga", "Withdrawal Simpanan", "Disbursement Pinjaman", "Repayment Pinjaman"].includes(tx.category)
  ).length;
  const referencedTxCount = cashTransactions.filter(tx =>
    ["Simpanan Warga", "Withdrawal Simpanan", "Disbursement Pinjaman", "Repayment Pinjaman"].includes(tx.category)
    && !!tx.referenceId
  ).length;
  const isBkuTransparent = linkedTxCount === 0 || referencedTxCount === linkedTxCount;

  // 3. NIK validation: all loans are linked to a citizen with a valid 16-digit NIK
  const validCitizenIds = new Set(citizens.filter(c => c.nik && c.nik.length === 16).map(c => c.id));
  const allLoansHaveValidNik = loans.length === 0 || loans.every(l => validCitizenIds.has(l.citizenId));

  /* ── Chart data — derived from real cashTransactions ── */
  const monthlyStats = useMemo(() => {
    // Build last-5-months buckets from transaction data
    const now = new Date();
    const months: { name: string; year: number; month: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("id-ID", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months.map(m => {
      const txsInMonth = cashTransactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });
      return {
        name: m.name,
        masuk:  txsInMonth.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0),
        keluar: txsInMonth.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [cashTransactions]);
  const maxVal = Math.max(...monthlyStats.map(s => Math.max(s.masuk, s.keluar)), 1);

  /* ── Metric cards config ── */
  const metrics = [
    {
      id: "kas",
      label: "Kas Utama BUMDes",
      value: formatRupiah(currentCashBalance),
      badge: "Aktif",
      badgeCls: "bg-emerald-50 text-emerald-700",
      icon: Wallet,
      iconBg: "bg-emerald-50 text-emerald-600",
      sub: "Dana likuid BUMDes",
      tooltipTitle: "Kalkulasi Kas Utama",
      tooltipAccent: "text-emerald-400",
      tooltipRows: [
        { label: "Total Kas Masuk (Debit)", value: formatRupiah(totalCashIn), cls: "text-emerald-400" },
        { label: "Total Kas Keluar (Kredit)", value: `-${formatRupiah(totalCashOut)}`, cls: "text-rose-400" },
        { label: "Rumus: Masuk - Keluar", value: "", cls: "" },
      ],
    },
    {
      id: "tabungan",
      label: "Total Simpanan Warga",
      value: formatRupiah(totalSavingsPool),
      badge: `${savingAccounts.length} Nasabah`,
      badgeCls: "bg-blue-50 text-blue-700",
      icon: Landmark,
      iconBg: "bg-blue-50 text-blue-600",
      sub: "Pokok + Wajib + Sukarela",
      tooltipTitle: "Kalkulasi Tabungan",
      tooltipAccent: "text-blue-400",
      tooltipRows: [
        { label: "Simpanan Pokok", value: formatRupiah(totalSavingsPokok), cls: "text-slate-200" },
        { label: "Simpanan Wajib", value: formatRupiah(totalSavingsWajib), cls: "text-slate-200" },
        { label: "Simpanan Sukarela", value: formatRupiah(totalSavingsSukarela), cls: "text-slate-200" },
      ],
    },
    {
      id: "piutang",
      label: "Piutang Pinjaman",
      value: formatRupiah(outstandingLoan),
      badge: `${loans.filter(l => l.amount > l.amountPaidPrincipal).length} Peminjam`,
      badgeCls: "bg-indigo-50 text-indigo-700",
      icon: HandCoins,
      iconBg: "bg-indigo-50 text-indigo-600",
      sub: "Modal bergulir aktif",
      tooltipTitle: "Kalkulasi Sisa Piutang",
      tooltipAccent: "text-indigo-400",
      tooltipRows: [
        { label: "Total Kredit Disalurkan", value: formatRupiah(totalLoanIssued), cls: "text-slate-200" },
        { label: "Total Pokok Terbayar", value: `-${formatRupiah(totalLoanPaid)}`, cls: "text-emerald-400" },
        { label: "Rumus: Disalurkan − Terbayar", value: "", cls: "" },
      ],
    },
    {
      id: "npl",
      label: "Rasio Kredit Macet (NPL)",
      value: `${nplRatio.toFixed(2)}%`,
      badge: nplLabel,
      badgeCls: nplBadge,
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-500",
      sub: "Standar aman Kemendesa < 10%",
      tooltipTitle: "Kalkulasi Rasio NPL",
      tooltipAccent: "text-rose-400",
      tooltipRows: [
        { label: "Kredit Macet & Diragukan", value: formatRupiah(nplPrincipal), cls: "text-rose-400" },
        { label: "Total Outstanding Aktif", value: formatRupiah(outstandingLoan), cls: "text-slate-200" },
        { label: "Rumus: (Macet / Total) × 100", value: "", cls: "" },
      ],
    },
    {
      id: "likuiditas",
      label: "Rasio Likuiditas Kas",
      value: `${liquidityRatio.toFixed(1)}%`,
      badge: liquidityLabel,
      badgeCls: liquidityBadge,
      icon: Percent,
      iconBg: "bg-teal-50 text-teal-600",
      sub: "Batas aman likuiditas > 25%",
      tooltipTitle: "Kalkulasi Likuiditas",
      tooltipAccent: "text-teal-400",
      tooltipRows: [
        { label: "Kas Utama BUMDes", value: formatRupiah(currentCashBalance), cls: "text-emerald-400" },
        { label: "Total Simpanan Sukarela", value: `-${formatRupiah(totalSavingsSukarela)}`, cls: "text-blue-400" },
        { label: "Rumus: (Kas / Sukarela) × 100", value: "", cls: "" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
            <BadgeCheck className="w-3.5 h-3.5" />
            Permendesa No. 3 / 2021
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{bumdesName}</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Informasi Keuangan BUMDes · Desa <span className="font-medium text-slate-700">{villageName}</span></p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onNavigate("advisor")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer">
            Audit AI
          </button>
          <button onClick={() => onNavigate("laporan")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer">
            Laporan LPJ
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map(m => {
          const Icon = m.icon;
          const isOpen = activeTooltip === m.id;
          return (
            <div
              key={m.id}
              className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              {/* Tooltip overlay */}
              {isOpen && (
                <div
                  className="absolute inset-0 bg-slate-900 text-white p-5 flex flex-col justify-between z-10 animate-scale-up rounded-2xl"
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${m.tooltipAccent}`}>{m.tooltipTitle}</span>
                      <button onClick={() => setActiveTooltip(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
                    </div>
                    <div className="space-y-2 text-[11px] font-mono">
                      {m.tooltipRows.map((r, i) => (
                        r.value
                          ? <div key={i} className="flex justify-between gap-2"><span className="text-slate-400">{r.label}</span><span className={r.cls}>{r.value}</span></div>
                          : <div key={i} className="text-slate-500 border-t border-slate-800 pt-2 mt-1">{r.label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeCls}`}>{m.badge}</span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{m.label}</p>
                  <p className="text-xl font-bold text-slate-900 font-mono leading-none">{m.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{m.sub}</p>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip(m.id)}
                  onClick={() => setActiveTooltip(activeTooltip === m.id ? null : m.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2-col: Chart + Compliance */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Arus Kas BUMDes (5 Bulan Terakhir)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Penerimaan vs Pengeluaran Buku Kas Umum</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"/>Masuk</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block"/>Keluar</span>
              </div>
            </div>
            <div className="h-44 flex items-end gap-3 border-b border-slate-100 px-2">
              {monthlyStats.map((st, i) => {
                const pM = maxVal > 0 ? (st.masuk / maxVal) * 85 : 0;
                const pK = maxVal > 0 ? (st.keluar / maxVal) * 85 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex justify-center items-end gap-1 h-full">
                      <div className="w-4 md:w-6 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all duration-500" style={{ height: `${pM}%` }} />
                      <div className="w-4 md:w-6 bg-rose-400 hover:bg-rose-500 rounded-t transition-all duration-500" style={{ height: `${pK}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 mt-2">{st.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 text-[10px] text-slate-400 font-mono">
              Max: {maxVal >= 1000000 ? `${(maxVal / 1000000).toFixed(1)} Jt` : `Rp ${maxVal}`}
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Indikator Kepatuhan Permendesa No. 3/2021</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  ok: hasPositiveSHU,
                  title: "Sisa Hasil Usaha (SHU) Positif",
                  desc: hasPositiveSHU
                    ? `BUMDes menghasilkan laba bersih ${formatRupiah(sisaHasilUsaha)}. Siap didistribusikan sesuai proporsi 40/30/15/10/5.`
                    : "BUMDes belum membukukan laba bersih. Beban operasional melebihi pendapatan.",
                },
                {
                  ok: nplRatio <= 10,
                  title: "Rasio Kredit Macet (NPL)",
                  desc: `NPL saat ini ${nplRatio.toFixed(2)}%. Batas aman Kemendesa < 10%. ${nplRatio > 10 ? "⚠ Perlu tindak lanjut penagihan." : "Portofolio kredit sehat."}`,
                },
                {
                  ok: isBkuTransparent,
                  title: "Transparansi Buku Kas Umum",
                  desc: isBkuTransparent
                    ? `Seluruh ${linkedTxCount} transaksi simpan-pinjam terverifikasi dan terkorelas di BKU.`
                    : `${linkedTxCount - referencedTxCount} transaksi belum memiliki referensi di BKU. Periksa pencatatan manual.`,
                },
                {
                  ok: allLoansHaveValidNik,
                  title: "Validasi NIK Warga (16 Digit)",
                  desc: allLoansHaveValidNik
                    ? `Seluruh ${loans.length} kredit terhubung ke identitas NIK warga yang valid.`
                    : "Terdapat debitur tanpa NIK 16-digit yang valid. Perbarui data warga.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`p-1.5 rounded-lg shrink-0 ${item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.ok ? <BadgeCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 text-sm">Mutasi Kas Terbaru</h3>
            <button onClick={() => onNavigate("kas")} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer transition">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {[...cashTransactions]
              .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
              .slice(0, 6)
              .map(tx => (
              <div key={tx.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${tx.type === "masuk" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                  {tx.type === "masuk" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{tx.date} · {tx.category}</p>
                </div>
                <span className={`text-xs font-bold font-mono shrink-0 ${tx.type === "masuk" ? "text-emerald-600" : "text-rose-500"}`}>
                  {tx.type === "masuk" ? "+" : "−"}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-2">Audit kecerdasan buatan Gemini AI tersedia untuk review regulasi otomatis.</p>
            <button
              onClick={() => onNavigate("advisor")}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Mulai Audit AI BUMDes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
