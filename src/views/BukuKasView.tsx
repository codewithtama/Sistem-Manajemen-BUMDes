import React from "react";
import { Plus, Search, Filter, ArrowDownRight, ArrowUpRight, Wallet, Download, Calendar, Pencil, Trash2, Lock } from "lucide-react";
import { CashTransaction } from "../types";
import { formatRupiah, exportToCSV } from "../data";

interface BukuKasViewProps {
  cashTransactions: CashTransaction[];
  cashSearch: string;
  setCashSearch: (val: string) => void;
  cashFilterCategory: string;
  setCashFilterCategory: (val: string) => void;
  cashStartDate: string;
  setCashStartDate: (val: string) => void;
  cashEndDate: string;
  setCashEndDate: (val: string) => void;
  setShowAddCashModal: (show: boolean) => void;
  currentGeneralCash: number;
  onEditCash: (tx: CashTransaction) => void;
  onDeleteCash: (id: string) => void;
  userRole: "operator" | "admin";
}

export default function BukuKasView({
  cashTransactions,
  cashSearch,
  setCashSearch,
  cashFilterCategory,
  setCashFilterCategory,
  cashStartDate,
  setCashStartDate,
  cashEndDate,
  setCashEndDate,
  setShowAddCashModal,
  currentGeneralCash,
  onEditCash,
  onDeleteCash,
  userRole,
}: BukuKasViewProps) {
  const totalMasuk  = cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalKeluar = cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0);

  const filtered = [...cashTransactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .filter(tx => {
      const matchSearch = tx.description.toLowerCase().includes(cashSearch.toLowerCase()) ||
                          tx.category.toLowerCase().includes(cashSearch.toLowerCase());
      const matchCat    = cashFilterCategory === "Semua" || tx.category === cashFilterCategory;
      const matchStart  = !cashStartDate || tx.date >= cashStartDate;
      const matchEnd    = !cashEndDate || tx.date <= cashEndDate;
      return matchSearch && matchCat && matchStart && matchEnd;
    });

  const handleExportCSV = () => {
    const headers = ["Tanggal", "Kategori", "Keterangan", "Debit (Masuk)", "Kredit (Keluar)"];
    const rows = filtered.map(tx => [
      tx.date,
      tx.category,
      tx.description,
      tx.type === "masuk" ? tx.amount : 0,
      tx.type === "keluar" ? tx.amount : 0
    ]);
    exportToCSV("Buku_Kas_Umum", headers, rows);
  };

  return (
    <div id="view_buku_kas" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Buku Kas Umum (BKU)</h2>
          <p className="text-sm text-slate-500 mt-1">Pencatatan utama seluruh arus kas masuk & keluar BUMDes secara real-time.</p>
        </div>
        <button
          id="btn_add_cash_transaction"
          onClick={() => setShowAddCashModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Rekam Transaksi
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><ArrowDownRight className="w-4 h-4" /></div>
            <p className="text-xs text-slate-500 font-medium">Total Kas Masuk</p>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatRupiah(totalMasuk)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-500"><ArrowUpRight className="w-4 h-4" /></div>
            <p className="text-xs text-slate-500 font-medium">Total Kas Keluar</p>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatRupiah(totalKeluar)}</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/20 text-white"><Wallet className="w-4 h-4" /></div>
            <p className="text-xs text-emerald-100 font-medium">Saldo Kas Saat Ini</p>
          </div>
          <p className="text-xl font-bold font-mono">{formatRupiah(currentGeneralCash)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row gap-3 xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi atau kategori transaksi..."
              value={cashSearch}
              onChange={e => setCashSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Rentang Tanggal */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={cashStartDate}
                onChange={e => setCashStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
              />
              <span className="text-slate-300 text-xs">—</span>
              <input
                type="date"
                value={cashEndDate}
                onChange={e => setCashEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
              />
              {(cashStartDate || cashEndDate) && (
                <button
                  onClick={() => { setCashStartDate(""); setCashEndDate(""); }}
                  className="text-slate-400 hover:text-rose-500 text-xs px-1 cursor-pointer font-bold"
                  title="Hapus filter tanggal"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={cashFilterCategory}
                onChange={e => setCashFilterCategory(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Modal Awal BUMDes">Modal Awal</option>
                <option value="Simpanan Warga">Setor Simpanan</option>
                <option value="Withdrawal Simpanan">Tarik Simpanan</option>
                <option value="Disbursement Pinjaman">Pencairan Kredit</option>
                <option value="Repayment Pinjaman">Angsuran Kredit</option>
                <option value="Pendapatan Unit Usaha">Pendapatan Lainnya</option>
                <option value="Beban Gaji & Honor">Honor Pengurus</option>
                <option value="Beban Operasional">Beban Ops</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
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
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Kategori</th>
                <th className="px-6 py-3.5">Keterangan</th>
                <th className="px-6 py-3.5 text-right">Debit (Masuk)</th>
                <th className="px-6 py-3.5 text-right">Kredit (Keluar)</th>
                <th className="px-6 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    Tidak ada transaksi yang sesuai dengan filter.
                  </td>
                </tr>
              )}
              {filtered.map(tx => {
                const isSystemGenerated = !!tx.referenceId;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        tx.type === "masuk"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{tx.description}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold font-mono text-emerald-600">
                      {tx.type === "masuk" ? formatRupiah(tx.amount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold font-mono text-rose-500">
                      {tx.type === "keluar" ? formatRupiah(tx.amount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {userRole !== "admin" ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-400 bg-slate-50 rounded-lg border border-slate-200"
                          title={isSystemGenerated ? "Transaksi otomatis terkunci (Hanya Superuser yang dapat mengubah)" : "Transaksi terkunci (Hanya Superuser yang dapat mengubah)"}
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          {isSystemGenerated ? "Sistem" : "Terkunci"}
                        </span>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onEditCash(tx)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Koreksi Transaksi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCash(tx.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={4} className="px-6 py-3 text-xs font-semibold text-slate-600 text-right">Akumulatif</td>
                <td className="px-6 py-3 text-right text-sm font-bold font-mono text-emerald-600">{formatRupiah(totalMasuk)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold font-mono text-rose-500">{formatRupiah(totalKeluar)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
