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
      <div className="animate-scale-up">{children}</div>
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

  showAddCashModal: boolean;
  setShowAddCashModal: (s: boolean) => void;
  formCash: { date: string; type: "masuk"|"keluar"; category: CashTransaction["category"]; amount: number; description: string; };
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
}

export default function Modals({
  showConfigModal, setShowConfigModal, formConfig, setFormConfig, handleUpdateConfig,
  showAddCashModal, setShowAddCashModal, formCash, setFormCash, handleAddCashTransaction,
  showAddCitizenModal, setShowAddCitizenModal, formCitizen, setFormCitizen, handleAddCitizen,
  showSavingActionModal, setShowSavingActionModal, formSavingAction, setFormSavingAction, handleSavingAction, citizens,
  showNewLoanModal, setShowNewLoanModal, formLoan, setFormLoan, handleDisburseLoan,
  showRepaymentModal, setShowRepaymentModal, formRepayment, setFormRepayment, handleRepayLoan, loans,
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
              </div>
              <SubmitButton>Simpan Konfigurasi</SubmitButton>
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
                      setFormRepayment({
                        loanId: lId,
                        principalPaid: Math.round(match.amount / match.tenorMonths),
                        interestPaid: Math.round(match.amount * (match.interestPercentage / 100)),
                        finePaid: 0,
                        description: `Setoran angsuran — ${match.citizenName}`,
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
    </>
  );
}
