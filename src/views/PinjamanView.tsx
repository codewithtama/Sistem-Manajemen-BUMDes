import React from "react";
import { Plus, Search, HandCoins, TrendingDown, CheckCircle, ChevronRight, Download, Pencil, Trash2, Calendar } from "lucide-react";
import { Loan, LoanRepayment } from "../types";
import { formatRupiah, exportToCSV } from "../data";

interface PinjamanViewProps {
  loans: Loan[];
  loanSearch: string;
  setLoanSearch: (val: string) => void;
  loanRepayments: LoanRepayment[];
  setShowNewLoanModal: (show: boolean) => void;
  setShowRepaymentModal: (show: boolean) => void;
  setFormRepayment: (val: any) => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onOpenAmortization: (loan: Loan) => void;
}

const statusCfg: Record<Loan["status"], { label: string; cls: string }> = {
  Lancar:        { label: "Lancar",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Kurang Lancar": { label: "Kurang Lancar", cls: "bg-amber-50 text-amber-700 border-amber-200"    },
  Diragukan:     { label: "Diragukan",     cls: "bg-orange-50 text-orange-700 border-orange-200"   },
  Macet:         { label: "Macet",         cls: "bg-rose-50 text-rose-700 border-rose-200"          },
};

export default function PinjamanView({
  loans, loanSearch, setLoanSearch, loanRepayments,
  setShowNewLoanModal, setShowRepaymentModal, setFormRepayment,
  onEditLoan, onDeleteLoan, onOpenAmortization,
}: PinjamanViewProps) {
  const filtered = [...loans]
    .sort((a, b) => b.dateDisbursed.localeCompare(a.dateDisbursed) || b.id.localeCompare(a.id))
    .filter(l => l.citizenName.toLowerCase().includes(loanSearch.toLowerCase()));

  const handleExportLoansCSV = () => {
    const headers = ["Debitur", "Jasa Admin", "Pokok Pinjaman", "Sisa Outstanding", "Status", "Tanggal Pencairan", "Tenor (Bulan)"];
    const rows = filtered.map(ln => [
      ln.citizenName,
      `${ln.interestPercentage}% / ${ln.repaymentPeriod}`,
      ln.amount,
      Math.max(0, ln.amount - ln.amountPaidPrincipal),
      ln.status,
      ln.dateDisbursed,
      ln.tenorMonths
    ]);
    exportToCSV("Daftar_Pinjaman_Aktif", headers, rows);
  };

  const handleExportRepaymentsCSV = () => {
    const headers = ["Debitur", "Tanggal Setor", "Bayar Pokok", "Bayar Jasa", "Bayar Denda", "Total Setoran", "Keterangan"];
    const sortedReps = [...loanRepayments].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const rows = sortedReps.map(rep => [
      rep.citizenName,
      rep.date,
      rep.principalPaid,
      rep.interestPaid,
      rep.finePaid,
      rep.principalPaid + rep.interestPaid + rep.finePaid,
      rep.description
    ]);
    exportToCSV("Riwayat_Angsuran_Pinjaman", headers, rows);
  };

  const totalDisalurkan  = loans.reduce((s, l) => s + l.amount, 0);
  const totalOutstanding = loans.reduce((s, l) => s + (l.amount - l.amountPaidPrincipal), 0);
  const totalTerbayar    = loans.reduce((s, l) => s + l.amountPaidPrincipal, 0);

  return (
    <div id="view_pinjaman" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unit Simpan Pinjam</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola portofolio kredit dan angsuran warga desa secara terstruktur.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            id="btn_repayment_loan"
            onClick={() => setShowRepaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Bayar Angsuran
          </button>
          <button
            id="btn_new_loan"
            onClick={() => setShowNewLoanModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Kredit Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><HandCoins className="w-4 h-4" /></div>
            <p className="text-xs text-slate-500 font-medium">Total Kredit Disalurkan</p>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatRupiah(totalDisalurkan)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle className="w-4 h-4" /></div>
            <p className="text-xs text-slate-500 font-medium">Total Pokok Terbayar</p>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatRupiah(totalTerbayar)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><TrendingDown className="w-4 h-4" /></div>
            <p className="text-xs text-slate-500 font-medium">Total Sisa Piutang</p>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatRupiah(totalOutstanding)}</p>
        </div>
      </div>

      {/* Loans table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 text-sm">Portofolio Kredit Aktif</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama debitur..."
                value={loanSearch}
                onChange={e => setLoanSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
            <button
              onClick={handleExportLoansCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Ekspor CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Debitur</th>
                <th className="px-6 py-3.5">Jasa Admin</th>
                <th className="px-6 py-3.5 text-right">Pokok</th>
                <th className="px-6 py-3.5 text-right">Sisa Piutang</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Jadwal</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">Tidak ada debitur yang sesuai.</td>
                </tr>
              )}
              {filtered.map(ln => {
                const outstanding = Math.max(0, ln.amount - ln.amountPaidPrincipal);
                const pct = ln.amount > 0 ? Math.min(100, (ln.amountPaidPrincipal / ln.amount) * 100) : 0;
                
                // Dynamic days overdue
                let daysOverdue = 0;
                if (outstanding > 0) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = new Date(ln.dueDate);
                  due.setHours(0, 0, 0, 0);
                  const diffMs = today.getTime() - due.getTime();
                  daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                }

                return (
                  <tr key={ln.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{ln.citizenName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cair: {ln.dateDisbursed} · {ln.tenorMonths} bln</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                      {ln.interestPercentage}% / {ln.repaymentPeriod}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-900 font-mono">{formatRupiah(ln.amount)}</p>
                      {/* Progress bar */}
                      <div className="mt-1.5 h-1 w-20 ml-auto bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold font-mono text-slate-900">
                      {outstanding > 0 ? formatRupiah(outstanding) : <span className="text-emerald-600 font-semibold text-xs">Lunas</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg[ln.status]?.cls}`} title={
                          ln.status === "Lancar" ? "Pembayaran tepat waktu / keterlambatan ≤ 30 hari" :
                          ln.status === "Kurang Lancar" ? "Keterlambatan 31 - 90 hari" :
                          ln.status === "Diragukan" ? "Keterlambatan 91 - 180 hari" : "Keterlambatan kritis > 180 hari"
                        }>
                          {statusCfg[ln.status]?.label}
                        </span>
                        {outstanding > 0 && daysOverdue > 0 && (
                          <span className="text-[10px] text-rose-500 font-bold font-mono mt-1">
                            Telat {daysOverdue} hari
                          </span>
                        )}
                        {outstanding > 0 && daysOverdue === 0 && (
                          <span className="text-[9px] text-slate-400 font-mono mt-1">
                            Jatuh Tempo: {ln.dueDate}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onOpenAmortization(ln)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition cursor-pointer"
                        title="Lihat Jadwal Amortisasi Kredit"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Jadwal
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {outstanding > 0 && (
                          <button
                            onClick={() => {
                              setFormRepayment({
                                loanId: ln.id,
                                principalPaid: Math.round(ln.amount / ln.tenorMonths),
                                interestPaid: Math.round(ln.amount * (ln.interestPercentage / 100)),
                                finePaid: 0,
                                description: `Pembayaran angsuran rutin ${ln.citizenName}`,
                              });
                              setShowRepaymentModal(true);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition cursor-pointer mr-1"
                            title="Proses Setoran Angsuran"
                          >
                            Angsur <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditLoan(ln)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Edit Parameter Kredit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLoan(ln.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Rekening Kredit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repayment history */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 text-sm">Riwayat Setoran Angsuran</h3>
          <button
            onClick={handleExportRepaymentsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Ekspor Riwayat CSV
          </button>
        </div>
        <div className="space-y-3">
          {[...loanRepayments]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
            .slice(0, 6)
            .map(rep => (
            <div key={rep.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{rep.citizenName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{rep.date} · Pokok: {formatRupiah(rep.principalPaid)} · Jasa: {formatRupiah(rep.interestPaid)}</p>
              </div>
              <span className="text-sm font-bold font-mono text-emerald-600">
                +{formatRupiah(rep.principalPaid + rep.interestPaid + rep.finePaid)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
