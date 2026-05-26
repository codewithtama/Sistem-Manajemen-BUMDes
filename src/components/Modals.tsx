import React from "react";
import { X } from "lucide-react";
import { Citizen, Loan, BUMDesConfig, CashTransaction, SavingAccount } from "../types";
import { formatRupiah } from "../data";

const formatIndoNumber = (val: number | string): string => {
  if (val === undefined || val === null || val === 0 || val === "0") return "";
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("id-ID").format(Number(clean));
};

const parseIndoNumber = (val: string): number => {
  const clean = val.replace(/\D/g, "");
  return Number(clean) || 0;
};

/* ── Shared primitives ──────────────────────────────── */

function ModalWrapper({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-modal-in">{children}</div>
    </div>
  );
}

function ModalPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white placeholder:text-slate-400";
const selectCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white cursor-pointer";

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
    >
      {children}
    </button>
  );
}

/* ── Props ──────────────────────────────────────────── */

interface ModalsProps {
  showConfigModal: boolean;
  setShowConfigModal: (s: boolean) => void;
  formConfig: BUMDesConfig;
  setFormConfig: (c: BUMDesConfig) => void;
  handleUpdateConfig: (e: React.FormEvent) => void;
  handleClearMockData?: () => void;

  showAddCashModal: boolean;
  setShowAddCashModal: (s: boolean) => void;
  formCash: { date: string; type: "masuk"|"keluar"; category: CashTransaction["category"]; amount: number; description: string; unitUsaha?: string; };
  setFormCash: (v: any) => void;
  handleAddCashTransaction: (e: React.FormEvent) => void;

  showAddCitizenModal: boolean;
  setShowAddCitizenModal: (s: boolean) => void;
  formCitizen: { name: string; nik: string; phone: string; rtRw: string; address: string; };
  setFormCitizen: (v: any) => void;
  handleAddCitizen: (e: React.FormEvent) => void;

  showSavingActionModal: boolean;
  setShowSavingActionModal: (s: boolean) => void;
  formSavingAction: { citizenId: string; savingType: SavingAccount["savingType"]; type: "setor"|"tarik"; amount: number; description: string; };
  setFormSavingAction: (v: any) => void;
  handleSavingAction: (e: React.FormEvent) => void;
  citizens: Citizen[];

  showNewLoanModal: boolean;
  setShowNewLoanModal: (s: boolean) => void;
  formLoan: { citizenId: string; amount: number; tenorMonths: number; repaymentPeriod: Loan["repaymentPeriod"]; interestPercentage: number; dateDisbursed: string; };
  setFormLoan: (v: any) => void;
  handleDisburseLoan: (e: React.FormEvent) => void;

  showRepaymentModal: boolean;
  setShowRepaymentModal: (s: boolean) => void;
  formRepayment: { loanId: string; principalPaid: number; interestPaid: number; finePaid: number; description: string; };
  setFormRepayment: (v: any) => void;
  handleRepayLoan: (e: React.FormEvent) => void;
  loans: Loan[];

  // ── Edit & Amortization Props ──
  showEditCitizenModal: boolean;
  setShowEditCitizenModal: (s: boolean) => void;
  editingCitizen: Citizen | null;
  setEditingCitizen: (c: Citizen | null) => void;
  handleUpdateCitizen: (e: React.FormEvent) => void;

  showEditCashModal: boolean;
  setShowEditCashModal: (s: boolean) => void;
  editingCash: CashTransaction | null;
  setEditingCash: (t: CashTransaction | null) => void;
  handleUpdateCashTransaction: (e: React.FormEvent) => void;

  showEditLoanModal: boolean;
  setShowEditLoanModal: (s: boolean) => void;
  editingLoan: Loan | null;
  setEditingLoan: (l: Loan | null) => void;
  handleUpdateLoan: (e: React.FormEvent) => void;

  showAmortizationModal: boolean;
  setShowAmortizationModal: (s: boolean) => void;
  amortizationLoan: Loan | null;

  // ── Receipt Props ──
  showReceiptModal: boolean;
  setShowReceiptModal: (s: boolean) => void;
  lastCompletedTx: any | null;

  // ── Auth Props ──
  showLoginModal: boolean;
  setShowLoginModal: (s: boolean) => void;
  adminPasswordInput: string;
  setAdminPasswordInput: (p: string) => void;
  handleAdminLogin: (e: React.FormEvent) => void;
  cooldownSeconds: number;
}


export default function Modals({
  showConfigModal, setShowConfigModal, formConfig, setFormConfig, handleUpdateConfig,
  showAddCashModal, setShowAddCashModal, formCash, setFormCash, handleAddCashTransaction,
  showAddCitizenModal, setShowAddCitizenModal, formCitizen, setFormCitizen, handleAddCitizen,
  showSavingActionModal, setShowSavingActionModal, formSavingAction, setFormSavingAction, handleSavingAction, citizens,
  showNewLoanModal, setShowNewLoanModal, formLoan, setFormLoan, handleDisburseLoan,
  showRepaymentModal, setShowRepaymentModal, formRepayment, setFormRepayment, handleRepayLoan, loans,
  showEditCitizenModal, setShowEditCitizenModal, editingCitizen, setEditingCitizen, handleUpdateCitizen,
  showEditCashModal, setShowEditCashModal, editingCash, setEditingCash, handleUpdateCashTransaction,
  showEditLoanModal, setShowEditLoanModal, editingLoan, setEditingLoan, handleUpdateLoan,
  showAmortizationModal, setShowAmortizationModal, amortizationLoan,
  showReceiptModal, setShowReceiptModal, lastCompletedTx,
  handleClearMockData,
  showLoginModal, setShowLoginModal, adminPasswordInput, setAdminPasswordInput, handleAdminLogin, cooldownSeconds,
}: ModalsProps) {
  return (
    <>
      {/* 1. Config */}
      {showConfigModal && (
        <ModalWrapper onClose={() => setShowConfigModal(false)}>
          <ModalPanel title="Parameter Desa & BUMDes" onClose={() => setShowConfigModal(false)}>
            <form onSubmit={handleUpdateConfig} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nama Desa">
                  <input className={inputCls} value={formConfig.villageName} onChange={e => setFormConfig({ ...formConfig, villageName: e.target.value })} />
                </Field>
                <Field label="Kepala Desa">
                  <input className={inputCls} value={formConfig.villageHead} onChange={e => setFormConfig({ ...formConfig, villageHead: e.target.value })} />
                </Field>
                <Field label="Nama BUMDes">
                  <input className={inputCls} value={formConfig.bumdesName} onChange={e => setFormConfig({ ...formConfig, bumdesName: e.target.value })} />
                </Field>
                <Field label="Jasa Admin Simpanan (%)">
                  <input type="number" step="0.1" className={inputCls + " font-mono"} value={formConfig.customInterestRate} onChange={e => setFormConfig({ ...formConfig, customInterestRate: Number(e.target.value) })} />
                </Field>
                <Field label="Direktur BUMDes">
                  <input className={inputCls} value={formConfig.directorName} onChange={e => setFormConfig({ ...formConfig, directorName: e.target.value })} />
                </Field>
                <Field label="Bendahara BUMDes">
                  <input className={inputCls} value={formConfig.treasurerName} onChange={e => setFormConfig({ ...formConfig, treasurerName: e.target.value })} />
                </Field>
                <Field label="Denda Keterlambatan (%/hari)">
                  <input type="number" step="0.01" className={inputCls + " font-mono"} value={formConfig.finePercentagePerDay} onChange={e => setFormConfig({ ...formConfig, finePercentagePerDay: Number(e.target.value) })} />
                </Field>
                <Field label="Kata Sandi Superuser">
                  <input type="text" className={inputCls + " font-mono"} value={formConfig.adminPassword || "admin123"} onChange={e => setFormConfig({ ...formConfig, adminPassword: e.target.value })} />
                </Field>
              </div>
              <Field label="Kunci API Gemini (Opsional — untuk asisten kecerdasan buatan)">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  className={inputCls + " font-mono"}
                  value={formConfig.geminiApiKey || ""}
                  onChange={e => setFormConfig({ ...formConfig, geminiApiKey: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Masukkan kunci API Gemini Anda jika server dideploy tanpa key. Tersimpan aman di peramban web lokal Anda.
                </p>
              </Field>
              <SubmitButton>Simpan Konfigurasi</SubmitButton>
              {handleClearMockData && (
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <button
                    type="button"
                    onClick={handleClearMockData}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition cursor-pointer uppercase tracking-wider border border-rose-100"
                  >
                    Bersihkan Semua Data Contoh (Go Live)
                  </button>
                </div>
              )}
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 2. Tambah Kas */}
      {showAddCashModal && (
        <ModalWrapper onClose={() => setShowAddCashModal(false)}>
          <ModalPanel title="Rekam Transaksi Kas" onClose={() => setShowAddCashModal(false)}>
            <form onSubmit={handleAddCashTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tanggal">
                  <input type="date" className={inputCls} value={formCash.date} onChange={e => setFormCash({ ...formCash, date: e.target.value })} />
                </Field>
                <Field label="Jenis Arus Kas">
                  <select className={selectCls} value={formCash.type} onChange={e => setFormCash({ ...formCash, type: e.target.value as "masuk"|"keluar" })}>
                    <option value="masuk">Kas Masuk (Debit)</option>
                    <option value="keluar">Kas Keluar (Kredit)</option>
                  </select>
                </Field>
              </div>
              <Field label="Kategori Rekening">
                <select className={selectCls} value={formCash.category} onChange={e => setFormCash({ ...formCash, category: e.target.value as CashTransaction["category"] })}>
                  <option value="Pendapatan Unit Usaha">Pendapatan Unit Usaha</option>
                  <option value="Beban Gaji & Honor">Beban Gaji & Honor</option>
                  <option value="Beban Operasional">Beban Operasional</option>
                  <option value="Modal Awal BUMDes">Modal Awal BUMDes</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </Field>
              {formCash.category === "Pendapatan Unit Usaha" && (
                <Field label="Unit Usaha Desa Penghasil">
                  <select className={selectCls} value={formCash.unitUsaha || "Toko Desa"} onChange={e => setFormCash({ ...formCash, unitUsaha: e.target.value })}>
                    <option value="Toko Desa">Unit Toko Desa</option>
                    <option value="Air Bersih">Unit Air Bersih & PAMSIMAS</option>
                    <option value="Sewa Alat">Unit Sewa Alat & Mesin Tani</option>
                    <option value="Sampah Desa">Unit Kebersihan & Sampah</option>
                  </select>
                </Field>
              )}
              <Field label="Nominal (Rp)">
                <input type="text" className={inputCls + " font-mono"} placeholder="0" value={formatIndoNumber(formCash.amount)} onChange={e => setFormCash({ ...formCash, amount: parseIndoNumber(e.target.value) })} />
              </Field>
              <Field label="Keterangan">
                <textarea rows={2} className={inputCls + " resize-none"} placeholder="Deskripsi transaksi..." value={formCash.description} onChange={e => setFormCash({ ...formCash, description: e.target.value })} />
              </Field>
              <SubmitButton>Posting ke Buku Kas</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 3. Daftar Warga */}
      {showAddCitizenModal && (
        <ModalWrapper onClose={() => setShowAddCitizenModal(false)}>
          <ModalPanel title="Registrasi Warga Baru" onClose={() => setShowAddCitizenModal(false)}>
            <form onSubmit={handleAddCitizen} className="p-6 space-y-4">
              <Field label="Nama Lengkap (sesuai KTP)">
                <input className={inputCls} placeholder="Ahmad Subarjo" value={formCitizen.name} onChange={e => setFormCitizen({ ...formCitizen, name: e.target.value })} />
              </Field>
              <Field label="Nomor NIK (16 digit)">
                <input className={inputCls + " font-mono tracking-widest"} placeholder="3204120000000000" maxLength={16} value={formCitizen.nik} onChange={e => setFormCitizen({ ...formCitizen, nik: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="No. Telepon (WA)">
                  <input className={inputCls + " font-mono"} value={formCitizen.phone} onChange={e => setFormCitizen({ ...formCitizen, phone: e.target.value })} />
                </Field>
                <Field label="RT / RW">
                  <input className={inputCls} placeholder="RT 02 / RW 03" value={formCitizen.rtRw} onChange={e => setFormCitizen({ ...formCitizen, rtRw: e.target.value })} />
                </Field>
              </div>
              <Field label="Alamat Dusun">
                <input className={inputCls} placeholder="Dusun Krajan No. 12" value={formCitizen.address} onChange={e => setFormCitizen({ ...formCitizen, address: e.target.value })} />
              </Field>
              <SubmitButton>Daftarkan Warga</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 4. Mutasi Simpanan */}
      {showSavingActionModal && (
        <ModalWrapper onClose={() => setShowSavingActionModal(false)}>
          <ModalPanel title="Mutasi Tabungan Nasabah" onClose={() => setShowSavingActionModal(false)}>
            <form onSubmit={handleSavingAction} className="p-6 space-y-4">
              <Field label="Nama Nasabah">
                <select className={selectCls} value={formSavingAction.citizenId} onChange={e => setFormSavingAction({ ...formSavingAction, citizenId: e.target.value })}>
                  <option value="">— Pilih Warga Terdaftar —</option>
                  {citizens.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nik})</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Jenis Mutasi">
                  <select className={selectCls} value={formSavingAction.type} onChange={e => setFormSavingAction({ ...formSavingAction, type: e.target.value as "setor"|"tarik" })}>
                    <option value="setor">Setor Dana (+)</option>
                    <option value="tarik">Tarik Tunai (−)</option>
                  </select>
                </Field>
                <Field label="Jenis Simpanan">
                  <select className={selectCls} value={formSavingAction.savingType} onChange={e => setFormSavingAction({ ...formSavingAction, savingType: e.target.value as SavingAccount["savingType"] })}>
                    <option value="Sukarela">Sukarela</option>
                    <option value="Wajib">Wajib (Bulanan)</option>
                    <option value="Pokok">Pokok (Awal)</option>
                  </select>
                </Field>
              </div>
              <Field label="Nominal (Rp)">
                <input type="text" className={inputCls + " font-mono"} placeholder="0" value={formatIndoNumber(formSavingAction.amount)} onChange={e => setFormSavingAction({ ...formSavingAction, amount: parseIndoNumber(e.target.value) })} />
              </Field>
              <Field label="Catatan (opsional)">
                <input className={inputCls} placeholder="Deskripsi mutasi..." value={formSavingAction.description} onChange={e => setFormSavingAction({ ...formSavingAction, description: e.target.value })} />
              </Field>
              <SubmitButton>Proses Mutasi</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 5. Pinjaman Baru */}
      {showNewLoanModal && (
        <ModalWrapper onClose={() => setShowNewLoanModal(false)}>
          <ModalPanel title="Pencairan Kredit Baru" onClose={() => setShowNewLoanModal(false)}>
            <form onSubmit={handleDisburseLoan} className="p-6 space-y-4">
              <Field label="Nama Debitur">
                <select className={selectCls} value={formLoan.citizenId} onChange={e => setFormLoan({ ...formLoan, citizenId: e.target.value })}>
                  <option value="">— Pilih Warga Terdaftar —</option>
                  {citizens.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nik})</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Pokok Pinjaman (Rp)">
                  <input type="text" className={inputCls + " font-mono"} placeholder="10.000.000" value={formatIndoNumber(formLoan.amount)} onChange={e => setFormLoan({ ...formLoan, amount: parseIndoNumber(e.target.value) })} />
                </Field>
                <Field label="Jasa Admin (% / bulan)">
                  <input type="number" step="0.1" className={inputCls + " font-mono"} value={formLoan.interestPercentage} onChange={e => setFormLoan({ ...formLoan, interestPercentage: Number(e.target.value) })} />
                </Field>
                <Field label="Tenor (bulan)">
                  <input type="number" className={inputCls + " font-mono"} value={formLoan.tenorMonths} onChange={e => setFormLoan({ ...formLoan, tenorMonths: Number(e.target.value) })} />
                </Field>
                <Field label="Periode Tagihan">
                  <select className={selectCls} value={formLoan.repaymentPeriod} onChange={e => setFormLoan({ ...formLoan, repaymentPeriod: e.target.value as Loan["repaymentPeriod"] })}>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Mingguan">Mingguan</option>
                  </select>
                </Field>
              </div>
              <Field label="Tanggal Pencairan">
                <input type="date" className={inputCls} value={formLoan.dateDisbursed} onChange={e => setFormLoan({ ...formLoan, dateDisbursed: e.target.value })} />
              </Field>
              <SubmitButton>Cairkan & Potong Kas</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 6. Setoran Angsuran */}
      {showRepaymentModal && (
        <ModalWrapper onClose={() => setShowRepaymentModal(false)}>
          <ModalPanel title="Setoran Angsuran Pinjaman" onClose={() => setShowRepaymentModal(false)}>
            <form onSubmit={handleRepayLoan} className="p-6 space-y-4">
              <Field label="Pilih Debitur Aktif">
                <select
                  className={selectCls}
                  value={formRepayment.loanId}
                  onChange={e => {
                    const lId = e.target.value;
                    const match = loans.find(l => l.id === lId);
                    if (match) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const due = new Date(match.dueDate);
                      due.setHours(0, 0, 0, 0);
                      
                      const diffMs = today.getTime() - due.getTime();
                      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      
                      let calculatedFine = 0;
                      if (daysOverdue > 0) {
                        const outstandingPrincipal = match.amount - match.amountPaidPrincipal;
                        const fineRate = formConfig.finePercentagePerDay || 0.1;
                        calculatedFine = Math.round(outstandingPrincipal * (fineRate / 100) * daysOverdue);
                      }

                      setFormRepayment({
                        loanId: lId,
                        principalPaid: Math.round(match.amount / match.tenorMonths),
                        interestPaid: Math.round(match.amount * (match.interestPercentage / 100)),
                        finePaid: calculatedFine,
                        description: `Setoran angsuran — ${match.citizenName}${daysOverdue > 0 ? ` (Denda terlambat ${daysOverdue} hari)` : ''}`,
                      });
                    } else {
                      setFormRepayment({ loanId: "", principalPaid: 0, interestPaid: 0, finePaid: 0, description: "" });
                    }
                  }}
                >
                  <option value="">— Pilih Debitur —</option>
                  {loans.filter(l => l.amountPaidPrincipal < l.amount).map(l =>
                    <option key={l.id} value={l.id}>{l.citizenName} (sisa: {formatRupiah(l.amount - l.amountPaidPrincipal)})</option>
                  )}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bayar Pokok (Rp)">
                  <input type="text" className={inputCls + " font-mono"} value={formatIndoNumber(formRepayment.principalPaid)} onChange={e => setFormRepayment({ ...formRepayment, principalPaid: parseIndoNumber(e.target.value) })} />
                </Field>
                <Field label="Jasa Admin (Rp)">
                  <input type="text" className={inputCls + " font-mono"} value={formatIndoNumber(formRepayment.interestPaid)} onChange={e => setFormRepayment({ ...formRepayment, interestPaid: parseIndoNumber(e.target.value) })} />
                </Field>
              </div>
              <Field label="Denda Keterlambatan (Rp)">
                <input type="text" className={inputCls + " font-mono"} placeholder="0" value={formatIndoNumber(formRepayment.finePaid)} onChange={e => setFormRepayment({ ...formRepayment, finePaid: parseIndoNumber(e.target.value) })} />
              </Field>
              <Field label="Keterangan">
                <input className={inputCls} placeholder="Setoran angsuran..." value={formRepayment.description} onChange={e => setFormRepayment({ ...formRepayment, description: e.target.value })} />
              </Field>
              <div className="flex justify-between items-center rounded-lg bg-slate-50 border border-slate-100 px-4 py-2.5 text-sm font-mono">
                <span className="text-slate-500 text-xs">Total Penerimaan</span>
                <span className="font-bold text-slate-900">{formatRupiah(Number(formRepayment.principalPaid) + Number(formRepayment.interestPaid) + Number(formRepayment.finePaid))}</span>
              </div>
              <SubmitButton>Rekam Setoran</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 7. Edit Warga */}
      {showEditCitizenModal && editingCitizen && (
        <ModalWrapper onClose={() => setShowEditCitizenModal(false)}>
          <ModalPanel title="Edit Data Warga" onClose={() => setShowEditCitizenModal(false)}>
            <form onSubmit={handleUpdateCitizen} className="p-6 space-y-4">
              <Field label="Nama Lengkap (sesuai KTP)">
                <input className={inputCls} placeholder="Ahmad Subarjo" value={editingCitizen.name} onChange={e => setEditingCitizen({ ...editingCitizen, name: e.target.value })} />
              </Field>
              <Field label="Nomor NIK (16 digit)">
                <input className={inputCls + " font-mono tracking-widest"} placeholder="3204120000000000" maxLength={16} value={editingCitizen.nik} onChange={e => setEditingCitizen({ ...editingCitizen, nik: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="No. Telepon (WA)">
                  <input className={inputCls + " font-mono"} value={editingCitizen.phone} onChange={e => setEditingCitizen({ ...editingCitizen, phone: e.target.value })} />
                </Field>
                <Field label="RT / RW">
                  <input className={inputCls} placeholder="RT 02 / RW 03" value={editingCitizen.rtRw} onChange={e => setEditingCitizen({ ...editingCitizen, rtRw: e.target.value })} />
                </Field>
              </div>
              <Field label="Alamat Dusun">
                <input className={inputCls} placeholder="Dusun Krajan No. 12" value={editingCitizen.address} onChange={e => setEditingCitizen({ ...editingCitizen, address: e.target.value })} />
              </Field>
              <SubmitButton>Simpan Perubahan</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 8. Edit Transaksi Kas */}
      {showEditCashModal && editingCash && (
        <ModalWrapper onClose={() => setShowEditCashModal(false)}>
          <ModalPanel title="Koreksi Transaksi Kas" onClose={() => setShowEditCashModal(false)}>
            <form onSubmit={handleUpdateCashTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tanggal">
                  <input type="date" className={inputCls} value={editingCash.date} onChange={e => setEditingCash({ ...editingCash, date: e.target.value })} />
                </Field>
                <Field label="Jenis Arus Kas">
                  <select className={selectCls} value={editingCash.type} onChange={e => setEditingCash({ ...editingCash, type: e.target.value as "masuk"|"keluar" })}>
                    <option value="masuk">Kas Masuk (Debit)</option>
                    <option value="keluar">Kas Keluar (Kredit)</option>
                  </select>
                </Field>
              </div>
              <Field label="Kategori Rekening">
                <select className={selectCls} value={editingCash.category} onChange={e => setEditingCash({ ...editingCash, category: e.target.value as CashTransaction["category"] })}>
                  <option value="Pendapatan Unit Usaha">Pendapatan Unit Usaha</option>
                  <option value="Beban Gaji & Honor">Beban Gaji & Honor</option>
                  <option value="Beban Operasional">Beban Operasional</option>
                  <option value="Modal Awal BUMDes">Modal Awal BUMDes</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </Field>
              <Field label="Nominal (Rp)">
                <input type="text" className={inputCls + " font-mono"} placeholder="0" value={formatIndoNumber(editingCash.amount)} onChange={e => setEditingCash({ ...editingCash, amount: parseIndoNumber(e.target.value) })} />
              </Field>
              <Field label="Keterangan">
                <textarea rows={2} className={inputCls + " resize-none"} placeholder="Deskripsi transaksi..." value={editingCash.description} onChange={e => setEditingCash({ ...editingCash, description: e.target.value })} />
              </Field>
              <SubmitButton>Simpan Koreksi Kas</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 9. Edit Pinjaman */}
      {showEditLoanModal && editingLoan && (
        <ModalWrapper onClose={() => setShowEditLoanModal(false)}>
          <ModalPanel title="Edit Parameter Pinjaman" onClose={() => setShowEditLoanModal(false)}>
            <form onSubmit={handleUpdateLoan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Pokok Pinjaman (Rp)">
                  <input type="text" className={inputCls + " font-mono"} placeholder="10.000.000" value={formatIndoNumber(editingLoan.amount)} onChange={e => setEditingLoan({ ...editingLoan, amount: parseIndoNumber(e.target.value) })} />
                </Field>
                <Field label="Jasa Admin (% / bulan)">
                  <input type="number" step="0.1" className={inputCls + " font-mono"} value={editingLoan.interestPercentage} onChange={e => setEditingLoan({ ...editingLoan, interestPercentage: Number(e.target.value) })} />
                </Field>
                <Field label="Tenor (bulan)">
                  <input type="number" className={inputCls + " font-mono"} value={editingLoan.tenorMonths} onChange={e => setEditingLoan({ ...editingLoan, tenorMonths: Number(e.target.value) })} />
                </Field>
                <Field label="Periode Tagihan">
                  <select className={selectCls} value={editingLoan.repaymentPeriod} onChange={e => setEditingLoan({ ...editingLoan, repaymentPeriod: e.target.value as Loan["repaymentPeriod"] })}>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Mingguan">Mingguan</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tanggal Pencairan">
                  <input type="date" className={inputCls} value={editingLoan.dateDisbursed} onChange={e => setEditingLoan({ ...editingLoan, dateDisbursed: e.target.value })} />
                </Field>
                <Field label="Tanggal Jatuh Tempo">
                  <input type="date" className={inputCls} value={editingLoan.dueDate} onChange={e => setEditingLoan({ ...editingLoan, dueDate: e.target.value })} />
                </Field>
              </div>
              <SubmitButton>Simpan Parameter</SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}

      {/* 10. Jadwal Amortisasi Pinjaman */}
      {showAmortizationModal && amortizationLoan && (
        <ModalWrapper onClose={() => setShowAmortizationModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Jadwal Angsuran Resmi & Buku Penagihan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Debitur: <span className="text-emerald-400 font-semibold">{amortizationLoan.citizenName}</span></p>
              </div>
              <button
                onClick={() => setShowAmortizationModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {/* Summary Cards inside Amortization */}
              <div className="grid grid-cols-3 gap-3 mb-5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Pokok Pinjaman</span>
                  <span className="font-bold text-slate-800">{formatRupiah(amortizationLoan.amount)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Total Jasa ({amortizationLoan.interestPercentage}%/bln)</span>
                  <span className="font-bold text-slate-800">{formatRupiah(Math.round(amortizationLoan.amount * (amortizationLoan.interestPercentage / 100) * amortizationLoan.tenorMonths))}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Tenor / Periode</span>
                  <span className="font-bold text-slate-800">{amortizationLoan.tenorMonths} {amortizationLoan.repaymentPeriod === "Bulanan" ? "Bulan" : "Minggu"}</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-y-auto max-h-80 border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] border-b border-slate-100 sticky top-0">
                      <th className="px-4 py-2.5">Ke</th>
                      <th className="px-4 py-2.5">Estimasi Tanggal</th>
                      <th className="px-4 py-2.5 text-right">Pokok</th>
                      <th className="px-4 py-2.5 text-right">Jasa Admin</th>
                      <th className="px-4 py-2.5 text-right">Jumlah Tagihan</th>
                      <th className="px-4 py-2.5 text-right">Outstanding Pokok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Array.from({ length: amortizationLoan.tenorMonths }).map((_, idx) => {
                      const installmentNum = idx + 1;
                      
                      // Calculate dates dynamically based on disbursement date
                      const dateObj = new Date(amortizationLoan.dateDisbursed);
                      if (amortizationLoan.repaymentPeriod === "Bulanan") {
                        dateObj.setMonth(dateObj.getMonth() + installmentNum);
                      } else {
                        dateObj.setDate(dateObj.getDate() + (installmentNum * 7));
                      }
                      const estDate = dateObj.toISOString().split("T")[0];

                      const monthlyPrincipal = Math.round(amortizationLoan.amount / amortizationLoan.tenorMonths);
                      const monthlyInterest = Math.round(amortizationLoan.amount * (amortizationLoan.interestPercentage / 100));
                      const totalBill = monthlyPrincipal + monthlyInterest;
                      const remainingPrincipal = Math.max(0, amortizationLoan.amount - (monthlyPrincipal * installmentNum));
                      
                      // Check progress indicators
                      const isPaid = amortizationLoan.amountPaidPrincipal >= (monthlyPrincipal * installmentNum);

                      return (
                        <tr key={idx} className={`hover:bg-slate-50/50 ${isPaid ? "bg-emerald-50/20 text-emerald-800" : ""}`}>
                          <td className="px-4 py-2 font-bold">{installmentNum}</td>
                          <td className="px-4 py-2 text-slate-500">{estDate}</td>
                          <td className="px-4 py-2 text-right">{formatRupiah(monthlyPrincipal)}</td>
                          <td className="px-4 py-2 text-right text-slate-500">{formatRupiah(monthlyInterest)}</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-700">{formatRupiah(totalBill)}</td>
                          <td className="px-4 py-2 text-right text-slate-400">{formatRupiah(remainingPrincipal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400">
                <span>* Catatan: Lembar penagihan resmi BUMDes Sukamaju sesuai kesepakatan mufakat.</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">Suku Bunga Flat</span>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 11. Kuitansi Struk Termal */}
      {showReceiptModal && lastCompletedTx && (
        <ModalWrapper onClose={() => setShowReceiptModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xs overflow-hidden p-6 font-mono text-xs text-slate-800 relative print:p-2 print:border-none print:shadow-none">
            
            {/* Thermal Print Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <span className="font-bold text-sm block tracking-tight">{formConfig.bumdesName}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{formConfig.villageName}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Petugas: {formConfig.treasurerName}</span>
            </div>

            {/* Receipt Title */}
            <div className="text-center py-3">
              <span className="font-bold text-[10px] uppercase tracking-wider block">{lastCompletedTx.title}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Tanggal: {lastCompletedTx.date}</span>
            </div>

            {/* Details Grid */}
            <div className="space-y-1.5 py-3 border-t border-b border-dashed border-slate-300">
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">Nasabah:</span>
                <span className="font-bold text-slate-700 truncate max-w-[120px]">{lastCompletedTx.citizenName}</span>
              </div>
              {lastCompletedTx.details.map((det: any, i: number) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="text-slate-400">{det.label}:</span>
                  <span className="text-slate-700 font-semibold">{det.value}</span>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="flex justify-between items-center py-4 border-b border-dashed border-slate-300">
              <span className="font-bold text-slate-700">TOTAL BAYAR</span>
              <span className="text-sm font-extrabold text-slate-900">{formatRupiah(lastCompletedTx.amount)}</span>
            </div>

            {/* Footer / Greeting */}
            <div className="text-center pt-4 pb-2 space-y-1">
              <p className="text-[10px] text-slate-500 leading-normal">Terima kasih atas partisipasi Anda membangun desa mandiri.</p>
              <p className="text-[8px] text-slate-400">Sistem Informasi BUMDes Mandiri v2.0</p>
            </div>

            {/* Action Buttons for Print */}
            <div className="mt-4 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold text-center transition cursor-pointer"
              >
                Cetak Struk
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold text-center transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
            
          </div>
        </ModalWrapper>
      )}

      {/* 12. Login Admin/Superuser */}
      {showLoginModal && (
        <ModalWrapper onClose={() => setShowLoginModal(false)}>
          <ModalPanel title="Autentikasi Superuser BUMDes" onClose={() => setShowLoginModal(false)}>
            <form onSubmit={handleAdminLogin} className="p-6 space-y-4 font-sans">
              <div className="text-center pb-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan kata sandi administratif untuk mengaktifkan privilese penuh (Full Privilege) edit/delete data sistem.
                </p>
              </div>
              {cooldownSeconds > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700 font-medium leading-normal flex items-center gap-2">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>
                    Keamanan Terkunci: Terdeteksi percobaan login ilegal berulang. Silakan tunggu <strong>{cooldownSeconds} detik</strong> sebelum mencoba lagi.
                  </span>
                </div>
              )}
              <Field label="Kata Sandi Superuser">
                <input
                  type="password"
                  placeholder={cooldownSeconds > 0 ? "SISTEM DIKUNCI" : "••••••••"}
                  className={inputCls + " font-mono disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"}
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  disabled={cooldownSeconds > 0}
                  autoFocus={cooldownSeconds === 0}
                />
              </Field>
              <div className="text-[10px] text-slate-400">
                Sandi bawaan sistem: <span className="font-mono font-bold">admin123</span> (dapat diubah di menu parameter).
              </div>
              <SubmitButton disabled={cooldownSeconds > 0}>
                {cooldownSeconds > 0 ? `Terkunci (${cooldownSeconds} detik)` : "Buka Akses Superuser"}
              </SubmitButton>
            </form>
          </ModalPanel>
        </ModalWrapper>
      )}
    </>
  );
}
