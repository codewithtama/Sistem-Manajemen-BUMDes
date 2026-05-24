import React from "react";
import { Landmark, Plus, Search, Award, BookOpen, ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { SavingAccount, SavingTransaction } from "../types";
import { formatRupiah, exportToCSV } from "../data";

interface SimpananViewProps {
  savingAccounts: SavingAccount[];
  savingTransactions: SavingTransaction[];
  savingSearch: string;
  setSavingSearch: (v: string) => void;
  setShowSavingActionModal: (s: boolean) => void;
}

export default function SimpananView({ savingAccounts, savingTransactions, savingSearch, setSavingSearch, setShowSavingActionModal }: SimpananViewProps) {
  const filtered = [...savingAccounts]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated) || b.id.localeCompare(a.id))
    .filter(a => a.citizenName.toLowerCase().includes(savingSearch.toLowerCase()));

  const handleExportAccountsCSV = () => {
    const headers = ["Nama Nasabah", "Jenis Tabungan", "Terakhir Diperbarui", "Saldo"];
    const rows = filtered.map(acc => [
      acc.citizenName,
      acc.savingType,
      acc.lastUpdated,
      acc.balance
    ]);
    exportToCSV("Daftar_Rekening_Simpanan", headers, rows);
  };

  const handleExportTransactionsCSV = () => {
    const headers = ["Nama Nasabah", "Tanggal", "Tipe", "Nominal", "Keterangan"];
    const sortedTxs = [...savingTransactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const rows = sortedTxs.map(st => [
      st.citizenName,
      st.date,
      st.type === "setor" ? "Setoran" : "Penarikan",
      st.amount,
      st.description
    ]);
    exportToCSV("Riwayat_Transaksi_Simpanan", headers, rows);
  };

  const typeConfig: Record<string, { label: string; cls: string }> = {
    Sukarela: { label: "Sukarela", cls: "bg-blue-50 text-blue-700 border-blue-100" },
    Wajib:    { label: "Wajib",    cls: "bg-violet-50 text-violet-700 border-violet-100" },
    Pokok:    { label: "Pokok",    cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  };

  const stats = [
    { key: "Sukarela", label: "Simpanan Sukarela", icon: Landmark, iconCls: "bg-blue-50 text-blue-600" },
    { key: "Wajib",    label: "Simpanan Wajib",    icon: Award,    iconCls: "bg-violet-50 text-violet-600" },
    { key: "Pokok",    label: "Simpanan Pokok",    icon: BookOpen, iconCls: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div id="view_simpanan" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unit Tabungan & Simpanan Warga</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola Simpanan Pokok, Wajib, dan Sukarela penduduk desa.</p>
        </div>
        <button
          id="btn_action_saving"
          onClick={() => setShowSavingActionModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Transaksi Simpanan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ key, label, icon: Icon, iconCls }) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {formatRupiah(savingAccounts.filter(a => a.savingType === key).reduce((s, a) => s + a.balance, 0))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 text-sm">Buku Pembantu Rekening Simpanan</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama nasabah..."
                value={savingSearch}
                onChange={e => setSavingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
            <button
              onClick={handleExportAccountsCSV}
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
                <th className="px-6 py-3.5">Nama Nasabah</th>
                <th className="px-6 py-3.5">Jenis Tabungan</th>
                <th className="px-6 py-3.5">Terakhir Diperbarui</th>
                <th className="px-6 py-3.5 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">Tidak ada rekening yang sesuai.</td></tr>
              )}
              {filtered.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{acc.citizenName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeConfig[acc.savingType]?.cls}`}>
                      {typeConfig[acc.savingType]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{acc.lastUpdated}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">{formatRupiah(acc.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 text-sm">Riwayat Transaksi Tabungan</h3>
          <button
            onClick={handleExportTransactionsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Ekspor Riwayat CSV
          </button>
        </div>
        <div className="space-y-3">
          {[...savingTransactions]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
            .slice(0, 6)
            .map(st => (
            <div key={st.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${st.type === "setor" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                {st.type === "setor" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{st.citizenName} <span className="font-normal text-slate-400">— {st.description}</span></p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{st.date}</p>
              </div>
              <span className={`text-xs font-bold font-mono ${st.type === "setor" ? "text-emerald-600" : "text-rose-500"}`}>
                {st.type === "setor" ? "+" : "−"}{formatRupiah(st.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
