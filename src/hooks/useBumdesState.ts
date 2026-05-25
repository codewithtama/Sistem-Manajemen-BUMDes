import React, { useState, useEffect, useRef } from "react";
import {
  CashTransaction,
  Citizen,
  SavingAccount,
  SavingTransaction,
  Loan,
  LoanRepayment,
  BUMDesConfig
} from "../types";
import {
  initialBUMDesConfig,
  initialCitizens,
  initialSavingAccounts,
  initialSavingTransactions,
  initialLoans,
  initialLoanRepayments,
  initialCashTransactions,
  formatRupiah,
  computeLoanStatus,
  exportToJSON
} from "../data";

export function useBumdesState() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // ── Persistent state ────────────────────────────────────────────────────────
  const [config, setConfig] = useState<BUMDesConfig>(() => {
    try {
      const saved = localStorage.getItem("bumdes_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Backfill new field for existing data
        if (parsed.finePercentagePerDay === undefined) {
          parsed.finePercentagePerDay = initialBUMDesConfig.finePercentagePerDay;
        }
        return parsed;
      }
      return initialBUMDesConfig;
    } catch (e) {
      console.error("Failed to parse bumdes_config:", e);
      return initialBUMDesConfig;
    }
  });

  const [citizens, setCitizens] = useState<Citizen[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_citizens");
      return saved ? JSON.parse(saved) : initialCitizens;
    } catch (e) {
      console.error("Failed to parse bumdes_citizens:", e);
      return initialCitizens;
    }
  });

  const [savingAccounts, setSavingAccounts] = useState<SavingAccount[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_saving_accounts");
      return saved ? JSON.parse(saved) : initialSavingAccounts;
    } catch (e) {
      console.error("Failed to parse bumdes_saving_accounts:", e);
      return initialSavingAccounts;
    }
  });

  const [savingTransactions, setSavingTransactions] = useState<SavingTransaction[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_saving_txs");
      return saved ? JSON.parse(saved) : initialSavingTransactions;
    } catch (e) {
      console.error("Failed to parse bumdes_saving_txs:", e);
      return initialSavingTransactions;
    }
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_loans");
      return saved ? JSON.parse(saved) : initialLoans;
    } catch (e) {
      console.error("Failed to parse bumdes_loans:", e);
      return initialLoans;
    }
  });

  const [loanRepayments, setLoanRepayments] = useState<LoanRepayment[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_repayments");
      return saved ? JSON.parse(saved) : initialLoanRepayments;
    } catch (e) {
      console.error("Failed to parse bumdes_repayments:", e);
      return initialLoanRepayments;
    }
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_cash_txs");
      return saved ? JSON.parse(saved) : initialCashTransactions;
    } catch (e) {
      console.error("Failed to parse bumdes_cash_txs:", e);
      return initialCashTransactions;
    }
  });

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const [cashSearch, setCashSearch] = useState("");
  const [cashFilterCategory, setCashFilterCategory] = useState("Semua");
  const [cashStartDate, setCashStartDate] = useState("");
  const [cashEndDate, setCashEndDate] = useState("");
  const [citizenSearch, setCitizenSearch] = useState("");
  const [savingSearch, setSavingSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");

  // ── Modal visibility ────────────────────────────────────────────────────────
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [showAddCitizenModal, setShowAddCitizenModal] = useState(false);
  const [showSavingActionModal, setShowSavingActionModal] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);

  // Edit modals
  const [showEditCitizenModal, setShowEditCitizenModal] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [showEditCashModal, setShowEditCashModal] = useState(false);
  const [editingCash, setEditingCash] = useState<CashTransaction | null>(null);
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Feature modals
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [amortizationLoan, setAmortizationLoan] = useState<Loan | null>(null);
  const [showMonthlyCashModal, setShowMonthlyCashModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedTx, setLastCompletedTx] = useState<any | null>(null);

  // ── Toast Notifications State ──────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // ── Forms ───────────────────────────────────────────────────────────────────
  const [formConfig, setFormConfig] = useState<BUMDesConfig>({ ...config });

  const [formCash, setFormCash] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "masuk" as "masuk" | "keluar",
    category: "Pendapatan Unit Usaha" as CashTransaction["category"],
    amount: 0,
    description: "",
    unitUsaha: "Toko Desa"
  });

  const [formCitizen, setFormCitizen] = useState({
    name: "", nik: "", phone: "", rtRw: "", address: ""
  });

  const [formSavingAction, setFormSavingAction] = useState({
    citizenId: "",
    savingType: "Sukarela" as SavingAccount["savingType"],
    type: "setor" as "setor" | "tarik",
    amount: 0,
    description: ""
  });

  const [formLoan, setFormLoan] = useState({
    citizenId: "",
    amount: 0,
    tenorMonths: 10,
    repaymentPeriod: "Bulanan" as Loan["repaymentPeriod"],
    interestPercentage: config.customInterestRate,
    dateDisbursed: new Date().toISOString().split("T")[0]
  });

  const [formRepayment, setFormRepayment] = useState({
    loanId: "",
    principalPaid: 0,
    interestPaid: 0,
    finePaid: 0,
    description: ""
  });

  // ── AI ──────────────────────────────────────────────────────────────────────
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    {
      role: "model",
      text: "Halo! Saya adalah Asisten Regulasi & Akuntansi BUMDes Mandiri. Ada yang bisa saya bantu terkait kepatuhan regulasi Kemendesa No. 3 Tahun 2021, pengelolaan dana Simpan Pinjam, pembukuan kas, atau cara analisis surplus usaha BUMDes?"
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string>("");
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // ── LocalStorage sync ────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("bumdes_config", JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem("bumdes_citizens", JSON.stringify(citizens)); }, [citizens]);
  useEffect(() => { localStorage.setItem("bumdes_saving_accounts", JSON.stringify(savingAccounts)); }, [savingAccounts]);
  useEffect(() => { localStorage.setItem("bumdes_saving_txs", JSON.stringify(savingTransactions)); }, [savingTransactions]);
  useEffect(() => { localStorage.setItem("bumdes_loans", JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem("bumdes_repayments", JSON.stringify(loanRepayments)); }, [loanRepayments]);
  useEffect(() => { localStorage.setItem("bumdes_cash_txs", JSON.stringify(cashTransactions)); }, [cashTransactions]);

  // Auto-update loan status whenever loans change
  useEffect(() => {
    setLoans(prev => prev.map(loan => ({
      ...loan,
      status: computeLoanStatus(loan.dueDate, loan.amountPaidPrincipal, loan.amount)
    })));
  // Only run when loan repayments change to avoid infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanRepayments]);

  // ── Config ───────────────────────────────────────────────────────────────────
  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig.bumdesName || !formConfig.villageName || !formConfig.directorName || !formConfig.treasurerName) {
      showToast("Harap lengkapi semua parameter administrasi BUMDes.", "warning");
      return;
    }
    setConfig(formConfig);
    setShowConfigModal(false);
    showToast("Konfigurasi administrasi BUMDes berhasil diperbarui!", "success");
  };

  // ── Cash Transactions ────────────────────────────────────────────────────────
  const handleAddCashTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (formCash.amount <= 0) {
      showToast("Jumlah nominal transaksi harus lebih besar dari Rp 0.", "warning");
      return;
    }
    if (!formCash.description.trim()) {
      showToast("Harap berikan keterangan catatan transaksi kas.", "warning");
      return;
    }
    const finalDesc = formCash.category === "Pendapatan Unit Usaha" && formCash.unitUsaha
      ? `[Unit ${formCash.unitUsaha}] ${formCash.description.trim()}`
      : formCash.description.trim();
    const newTx: CashTransaction = {
      id: "tx-" + Date.now(),
      date: formCash.date,
      type: formCash.type,
      category: formCash.category,
      amount: formCash.amount,
      description: finalDesc
    };
    setCashTransactions([...cashTransactions, newTx]);
    setShowAddCashModal(false);
    setFormCash({
      date: new Date().toISOString().split("T")[0],
      type: "masuk",
      category: "Pendapatan Unit Usaha",
      amount: 0,
      description: "",
      unitUsaha: "Toko Desa"
    });
    showToast("Transaksi kas masuk berhasil dicatat di BKU!", "success");
  };

  const handleOpenEditCash = (tx: CashTransaction) => {
    setEditingCash({ ...tx });
    setShowEditCashModal(true);
  };

  const handleUpdateCashTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCash) return;
    if (editingCash.amount <= 0) {
      showToast("Jumlah nominal transaksi harus lebih besar dari Rp 0.", "warning");
      return;
    }
    if (!editingCash.description.trim()) {
      showToast("Harap berikan keterangan transaksi kas.", "warning");
      return;
    }
    setCashTransactions(prev => prev.map(t => t.id === editingCash.id ? editingCash : t));
    setShowEditCashModal(false);
    setEditingCash(null);
    showToast("Transaksi kas berhasil dikoreksi!", "success");
  };

  const handleDeleteCashTransaction = (id: string) => {
    if (!window.confirm("Hapus transaksi kas ini? Tindakan tidak dapat dibatalkan.")) return;
    setCashTransactions(prev => prev.filter(t => t.id !== id));
  };

  // ── Citizens ─────────────────────────────────────────────────────────────────
  const handleAddCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCitizen.name.trim()) {
      showToast("Nama warga wajib diisi.", "warning");
      return;
    }
    if (!formCitizen.nik || formCitizen.nik.length !== 16) {
      showToast("NIK harus berupa 16 digit angka.", "warning");
      return;
    }
    const newCitizen: Citizen = {
      id: "cit-" + Date.now(),
      name: formCitizen.name.trim(),
      nik: formCitizen.nik,
      phone: formCitizen.phone.trim(),
      rtRw: formCitizen.rtRw.trim(),
      address: formCitizen.address.trim(),
      joinedAt: new Date().toISOString().split("T")[0]
    };
    setCitizens([...citizens, newCitizen]);
    setShowAddCitizenModal(false);
    setFormCitizen({ name: "", nik: "", phone: "", rtRw: "", address: "" });
    showToast(`Data warga ${newCitizen.name} berhasil ditambahkan!`, "success");
  };

  const handleOpenEditCitizen = (citizen: Citizen) => {
    setEditingCitizen({ ...citizen });
    setShowEditCitizenModal(true);
  };

  const handleUpdateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCitizen) return;
    if (!editingCitizen.name.trim()) {
      showToast("Nama warga wajib diisi.", "warning");
      return;
    }
    if (!editingCitizen.nik || editingCitizen.nik.length !== 16) {
      showToast("NIK harus berupa 16 digit angka.", "warning");
      return;
    }
    setCitizens(prev => prev.map(c => c.id === editingCitizen.id ? editingCitizen : c));
    // Sync name changes to related records
    if (editingCitizen.name !== citizens.find(c => c.id === editingCitizen.id)?.name) {
      setSavingAccounts(prev => prev.map(a =>
        a.citizenId === editingCitizen.id ? { ...a, citizenName: editingCitizen.name } : a
      ));
      setLoans(prev => prev.map(l =>
        l.citizenId === editingCitizen.id ? { ...l, citizenName: editingCitizen.name } : l
      ));
    }
    setShowEditCitizenModal(false);
    setEditingCitizen(null);
    showToast("Profil data warga berhasil diperbarui!", "success");
  };

  const handleDeleteCitizen = (id: string) => {
    const hasLoan = loans.some(l => l.citizenId === id && l.amountPaidPrincipal < l.amount);
    if (hasLoan) {
      showToast("Warga ini masih memiliki pinjaman aktif yang belum lunas. Lunaskan kredit terlebih dahulu.", "error");
      return;
    }
    if (!window.confirm("Hapus data warga ini beserta rekening simpanan yang terkait? Tindakan tidak dapat dibatalkan.")) return;
    
    // Find all related saving account IDs for this citizen
    const relatedAccountIds = new Set(
      savingAccounts.filter(a => a.citizenId === id).map(a => a.id)
    );
    
    setCitizens(prev => prev.filter(c => c.id !== id));
    setSavingAccounts(prev => prev.filter(a => a.citizenId !== id));
    setSavingTransactions(prev => prev.filter(t => !relatedAccountIds.has(t.savingAccountId)));
    showToast("Data warga berhasil dihapus beserta seluruh buku rekening dan riwayat simpanannya.", "success");
  };

  // ── Savings ──────────────────────────────────────────────────────────────────
  const handleSavingAction = (e: React.FormEvent) => {
    e.preventDefault();
    const { citizenId, savingType, type, amount, description } = formSavingAction;
    if (!citizenId) {
      showToast("Pilih warga terlebih dahulu.", "warning");
      return;
    }
    if (amount <= 0) {
      showToast("Nominal mutasi tabungan harus lebih besar dari Rp 0.", "warning");
      return;
    }
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) {
      showToast("Warga terdaftar tidak ditemukan.", "error");
      return;
    }
    let account = savingAccounts.find(a => a.citizenId === citizenId && a.savingType === savingType);
    
    if (type === "tarik" && (!account || account.balance < amount)) {
      showToast("Saldo tidak mencukupi untuk melakukan penarikan. Saldo saat ini: " + formatRupiah(account?.balance || 0), "error");
      return;
    }
    if (type === "tarik" && amount > currentGeneralCash) {
      showToast("Gagal melakukan penarikan. Saldo kas utama BUMDes tidak mencukupi.", "error");
      return;
    }

    let updatedAccounts = [...savingAccounts];
    if (!account) {
      account = {
        id: "sa-" + Date.now(),
        citizenId,
        citizenName: citizen.name,
        savingType,
        balance: 0,
        lastUpdated: new Date().toISOString().split("T")[0]
      };
      updatedAccounts.push(account);
    }
    const updatedBalance = type === "setor" ? account.balance + amount : account.balance - amount;
    updatedAccounts = updatedAccounts.map(a =>
      a.id === account!.id ? { ...a, balance: updatedBalance, lastUpdated: new Date().toISOString().split("T")[0] } : a
    );
    const newSavingTx: SavingTransaction = {
      id: "st-" + Date.now(),
      savingAccountId: account.id,
      citizenName: citizen.name,
      date: new Date().toISOString().split("T")[0],
      type,
      amount,
      description: description.trim() || `${type === "setor" ? "Setor" : "Tarik"} Tabungan ${savingType}`
    };
    const newGeneralTx: CashTransaction = {
      id: "tx-st-" + Date.now(),
      date: newSavingTx.date,
      type: type === "setor" ? "masuk" : "keluar",
      category: type === "setor" ? "Simpanan Warga" : "Withdrawal Simpanan",
      amount,
      description: `${newSavingTx.description} (Nasabah: ${citizen.name})`,
      referenceId: newSavingTx.id
    };
    setSavingAccounts(updatedAccounts);
    setSavingTransactions([...savingTransactions, newSavingTx]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowSavingActionModal(false);
    setFormSavingAction({ citizenId: "", savingType: "Sukarela", type: "setor", amount: 0, description: "" });
    setLastCompletedTx({
      title: type === "setor" ? "KUITANSI SETORAN TABUNGAN" : "KUITANSI PENARIKAN TABUNGAN",
      citizenName: citizen.name,
      date: newSavingTx.date,
      type: type === "setor" ? "SETORAN DANA (+)" : "PENARIKAN TUNAI (-)",
      amount: amount,
      details: [
        { label: "Nomor Rekening", value: account?.id || `sa-${Date.now().toString().slice(-4)}` },
        { label: "Jenis Simpanan", value: savingType },
        { label: "Keterangan", value: newSavingTx.description },
        { label: "Saldo Akhir Rekening", value: formatRupiah(updatedBalance) }
      ]
    });
    setShowReceiptModal(true);
  };

  // ── Loans ────────────────────────────────────────────────────────────────────
  const handleDisburseLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const { citizenId, amount, tenorMonths, repaymentPeriod, interestPercentage, dateDisbursed } = formLoan;
    if (!citizenId) {
      showToast("Harap pilih warga penerima pinjaman.", "warning");
      return;
    }
    if (amount <= 0) {
      showToast("Besar pokok pinjaman harus lebih besar dari Rp 0.", "warning");
      return;
    }
    if (tenorMonths <= 0) {
      showToast("Tenor jangka waktu pinjaman minimal 1 bulan.", "warning");
      return;
    }
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) {
      showToast("Warga terdaftar tidak ditemukan.", "error");
      return;
    }
    const totalCashIn = cashTransactions.filter(tx => tx.type === "masuk").reduce((s, tx) => s + tx.amount, 0);
    const totalCashOut = cashTransactions.filter(tx => tx.type === "keluar").reduce((s, tx) => s + tx.amount, 0);
    const availableC = totalCashIn - totalCashOut;
    if (amount > availableC) {
      showToast("Kas utama BUMDes tidak mencukupi untuk menyalurkan pinjaman ini.", "error");
      return;
    }
    const d = new Date(dateDisbursed);
    d.setMonth(d.getMonth() + Number(tenorMonths));
    const dueDate = d.toISOString().split("T")[0];
    const newLoan: Loan = {
      id: "loan-" + Date.now(),
      citizenId,
      citizenName: citizen.name,
      amount,
      interestPercentage,
      tenorMonths: Number(tenorMonths),
      repaymentPeriod,
      dateDisbursed,
      dueDate,
      status: "Lancar",
      amountPaidPrincipal: 0,
      amountPaidInterest: 0
    };
    const newGeneralTx: CashTransaction = {
      id: "tx-ln-" + Date.now(),
      date: dateDisbursed,
      type: "keluar",
      category: "Disbursement Pinjaman",
      amount,
      description: `Pemberian Pinjaman Simpan Pinjam kepada ${citizen.name} (Tenor ${tenorMonths} bln)`,
      referenceId: newLoan.id
    };
    setLoans([...loans, newLoan]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowNewLoanModal(false);
    setFormLoan({
      citizenId: "",
      amount: 0,
      tenorMonths: 10,
      repaymentPeriod: "Bulanan",
      interestPercentage: config.customInterestRate,
      dateDisbursed: new Date().toISOString().split("T")[0]
    });
  };

  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan({ ...loan });
    setShowEditLoanModal(true);
  };

  const handleUpdateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;
    if (editingLoan.amount <= 0) {
      showToast("Pokok pinjaman harus lebih besar dari Rp 0.", "warning");
      return;
    }
    setLoans(prev => prev.map(l => l.id === editingLoan.id ? {
      ...editingLoan,
      status: computeLoanStatus(editingLoan.dueDate, editingLoan.amountPaidPrincipal, editingLoan.amount)
    } : l));
    setShowEditLoanModal(false);
    setEditingLoan(null);
  };

  const handleDeleteLoan = (loanId: string) => {
    if (!window.confirm("Hapus data pinjaman ini beserta seluruh riwayat angsurannya? Tindakan tidak dapat dibatalkan.")) return;
    
    // Find related repayment IDs for this loan
    const relatedRepaymentIds = new Set(
      loanRepayments.filter(r => r.loanId === loanId).map(r => r.id)
    );
    
    setLoans(prev => prev.filter(l => l.id !== loanId));
    setLoanRepayments(prev => prev.filter(r => r.loanId !== loanId));
    setCashTransactions(prev => prev.filter(t => 
      t.referenceId !== loanId && !relatedRepaymentIds.has(t.referenceId || "")
    ));
    showToast("Catatan kredit dan seluruh mutasi angsuran terkait berhasil dibersihkan dari Buku Kas Umum.", "success");
  };

  // ── Repayments ───────────────────────────────────────────────────────────────
  const handleRepayLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const { loanId, principalPaid, interestPaid, finePaid, description } = formRepayment;
    if (!loanId) {
      showToast("Harap pilih rekening debitur aktif.", "warning");
      return;
    }
    if (principalPaid <= 0 && interestPaid <= 0) {
      showToast("Harap isi alokasi pembayaran Pokok atau Jasa Administratif secara benar.", "warning");
      return;
    }
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      showToast("Data pinjaman aktif tidak ditemukan.", "error");
      return;
    }
    const totalRepay = Number(principalPaid) + Number(interestPaid) + Number(finePaid);
    const newRepayment: LoanRepayment = {
      id: "lr-" + Date.now(),
      loanId,
      citizenName: loan.citizenName,
      date: new Date().toISOString().split("T")[0],
      principalPaid: Number(principalPaid),
      interestPaid: Number(interestPaid),
      finePaid: Number(finePaid),
      description: description.trim() || `Angsuran Pinjaman oleh ${loan.citizenName}`
    };
    const updatedLoans = loans.map(l => {
      if (l.id === loanId) {
        const remaining = l.amount - l.amountPaidPrincipal;
        const clampedPrincipal = Math.min(Number(principalPaid), Math.max(0, remaining));
        const nextPrincipal = l.amountPaidPrincipal + clampedPrincipal;
        const nextInterest = l.amountPaidInterest + Number(interestPaid);
        return {
          ...l,
          amountPaidPrincipal: nextPrincipal,
          amountPaidInterest: nextInterest,
          status: computeLoanStatus(l.dueDate, nextPrincipal, l.amount)
        };
      }
      return l;
    });
    const newGeneralTx: CashTransaction = {
      id: "tx-lr-" + Date.now(),
      date: newRepayment.date,
      type: "masuk",
      category: "Repayment Pinjaman",
      amount: totalRepay,
      description: `Setoran Angsuran Simpan Pinjam - ${loan.citizenName} (Pokok: ${formatRupiah(Number(principalPaid))} + Jasa: ${formatRupiah(Number(interestPaid))})`,
      referenceId: newRepayment.id
    };
    const targetLoan = updatedLoans.find(l => l.id === loanId);
    const finalRemaining = targetLoan ? (targetLoan.amount - targetLoan.amountPaidPrincipal) : 0;

    setLoans(updatedLoans);
    setLoanRepayments([...loanRepayments, newRepayment]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowRepaymentModal(false);
    setFormRepayment({ loanId: "", principalPaid: 0, interestPaid: 0, finePaid: 0, description: "" });
    setLastCompletedTx({
      title: "KUITANSI ANGSURAN PINJAMAN",
      citizenName: loan.citizenName,
      date: newRepayment.date,
      type: "ANGSURAN KREDIT (-)",
      amount: totalRepay,
      details: [
        { label: "Nomor Rekening", value: loanId },
        { label: "Angsuran Pokok", value: formatRupiah(Number(principalPaid)) },
        { label: "Jasa Administratif", value: formatRupiah(Number(interestPaid)) },
        { label: "Denda Overdue", value: formatRupiah(Number(finePaid)) },
        { label: "Keterangan", value: newRepayment.description },
        { label: "Sisa Pokok Pinjaman", value: finalRemaining > 0 ? formatRupiah(finalRemaining) : "LUNAS" }
      ]
    });
    setShowReceiptModal(true);
  };

  // ── Amortization ─────────────────────────────────────────────────────────────
  const handleOpenAmortization = (loan: Loan) => {
    setAmortizationLoan(loan);
    setShowAmortizationModal(true);
  };

  // ── Backup / Restore ─────────────────────────────────────────────────────────
  const handleBackupData = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: 1,
      config,
      citizens,
      savingAccounts,
      savingTransactions,
      loans,
      loanRepayments,
      cashTransactions
    };
    const date = new Date().toISOString().split("T")[0];
    exportToJSON(snapshot, `BUMDes_Backup_${date}`);
  };

  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTriggerRestore = () => {
    restoreFileInputRef.current?.click();
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !data.config || !data.citizens) {
          showToast("File backup tidak valid atau formatnya salah.", "error");
          return;
        }
        if (!window.confirm(`Restore data dari backup tanggal ${data.exportedAt?.split("T")[0] || "tidak diketahui"}?\n\nSEMUA data saat ini akan diganti. Tindakan ini tidak dapat dibatalkan.`)) return;
        setConfig({ ...initialBUMDesConfig, ...data.config });
        setCitizens(data.citizens || []);
        setSavingAccounts(data.savingAccounts || []);
        setSavingTransactions(data.savingTransactions || []);
        setLoans(data.loans || []);
        setLoanRepayments(data.loanRepayments || []);
        setCashTransactions(data.cashTransactions || []);
        showToast("Data BUMDes berhasil dipulihkan dari file backup!", "success");
      } catch (err) {
        console.error("Restore failed:", err);
        showToast("Gagal membaca file backup. Pastikan file tidak rusak.", "error");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleClearMockData = () => {
    if (!window.confirm("Hapus seluruh data uji coba (citizens, simpanan, pinjaman, dan transaksi kas lainnya)?\n\nSistem akan dibersihkan agar siap diisi dengan data warga & kas BUMDes riil desa Anda. Tindakan ini tidak dapat dibatalkan!")) {
      return;
    }
    
    // Clear localStorage
    localStorage.removeItem("bumdes_citizens");
    localStorage.removeItem("bumdes_saving_accounts");
    localStorage.removeItem("bumdes_saving_txs");
    localStorage.removeItem("bumdes_loans");
    localStorage.removeItem("bumdes_repayments");
    
    // Kept only BUMDes initial capital transaction in cashTransactions, so they start with APBDes initial cash
    const initialCapTxOnly = cashTransactions.filter(t => t.category === "Modal Awal BUMDes");
    if (initialCapTxOnly.length === 0) {
      initialCapTxOnly.push({
        id: "tx-1",
        date: new Date().toISOString().split("T")[0],
        type: "masuk",
        category: "Modal Awal BUMDes",
        amount: config.initialCapitalAmount,
        description: "Penerimaan modal awal dari Anggaran Pendapatan Belanja Desa (APBDes)",
      });
    }
    
    setCitizens([]);
    setSavingAccounts([]);
    setSavingTransactions([]);
    setLoans([]);
    setLoanRepayments([]);
    setCashTransactions(initialCapTxOnly);
    
    localStorage.setItem("bumdes_cash_txs", JSON.stringify(initialCapTxOnly));
    
    setShowConfigModal(false);
    showToast("Seluruh data contoh berhasil dibersihkan! Sistem siap dimasuki data riil desa Anda.", "success");
  };

  // ── AI Chat ──────────────────────────────────────────────────────────────────
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    const userMsg = aiChatInput;
    setAiChatInput("");
    const nextHistory = [...aiChatHistory, { role: "user" as const, text: userMsg }];
    setAiChatHistory(nextHistory);
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: nextHistory.slice(0, -1),
          contextData: {
            bumdes: config,
            citizensCount: citizens.length,
            cash: {
              masuk: cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0),
              keluar: cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0),
            },
            savingsPool: savingAccounts.reduce((s, a) => s + a.balance, 0),
            loansCount: loans.length,
            outstandingPrincipal: loans.reduce((s, l) => s + (l.amount - l.amountPaidPrincipal), 0)
          }
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiChatHistory([...nextHistory, { role: "model", text: data.text }]);
      } else {
        setAiChatHistory([...nextHistory, { role: "model", text: `Error: ${data.error || "Gagal menghubungi modul AI"}` }]);
      }
    } catch (err: any) {
      console.error("AI chat network error:", err);
      setAiChatHistory([...nextHistory, { role: "model", text: "Terjadi kesalahan koneksi ke server AI." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateAuditReport = async () => {
    setIsAuditLoading(true);
    setAiAuditReport("");
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashTransactions: cashTransactions.slice(-30),
          savingsData: savingAccounts,
          loanData: loans,
          parameters: {
            bumdesName: config.bumdesName,
            villageName: config.villageName,
            initialCapital: config.initialCapitalAmount
          }
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiAuditReport(data.analysis);
      } else {
        setAiAuditReport(`### Error Audit\nGagal memproses laporan: ${data.error || "Server error"}`);
      }
    } catch (err) {
      console.error("AI audit network error:", err);
      setAiAuditReport("### Error Koneksi\nKoneksi jaringan terputus sewaktu melakukan audit AI.");
    } finally {
      setIsAuditLoading(false);
    }
  };

  // ── LPJ Calculations ─────────────────────────────────────────────────────────
  const totalBkuMasuk  = cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalBkuKeluar = cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0);
  const currentGeneralCash = totalBkuMasuk - totalBkuKeluar;

  const totalInterestsEarned = loanRepayments.reduce((s, r) => s + r.interestPaid, 0);
  const totalFinesEarned     = loanRepayments.reduce((s, r) => s + r.finePaid, 0);
  const totalFeeRevenue      = totalInterestsEarned + totalFinesEarned;

  const totalOtherRevenues = cashTransactions
    .filter(t => t.category === "Pendapatan Unit Usaha")
    .reduce((s, t) => s + (t.type === "masuk" ? t.amount : -t.amount), 0);

  const totalBumdesGrossIncome = totalFeeRevenue + totalOtherRevenues;

  const totalGajiBeban = cashTransactions
    .filter(t => t.category === "Beban Gaji & Honor")
    .reduce((s, t) => s + (t.type === "keluar" ? t.amount : -t.amount), 0);

  const totalOpsBeban = cashTransactions
    .filter(t => t.category === "Beban Operasional")
    .reduce((s, t) => s + (t.type === "keluar" ? t.amount : -t.amount), 0);

  const totalBumdesExpenses = totalGajiBeban + totalOpsBeban;
  const sisaHasilUsaha      = totalBumdesGrossIncome - totalBumdesExpenses;

  const alokasiPADesa      = sisaHasilUsaha > 0 ? Math.round(sisaHasilUsaha * 0.40) : 0;
  const alokasiCadangan    = sisaHasilUsaha > 0 ? Math.round(sisaHasilUsaha * 0.30) : 0;
  const alokasiPengurus    = sisaHasilUsaha > 0 ? Math.round(sisaHasilUsaha * 0.15) : 0;
  const alokasiBonusWarga  = sisaHasilUsaha > 0 ? Math.round(sisaHasilUsaha * 0.10) : 0;
  const alokasiSosial      = sisaHasilUsaha > 0 ? Math.round(sisaHasilUsaha * 0.05) : 0;

  const triggerPrintLPJ = () => { window.print(); };

  return {
    activeTab, setActiveTab,
    config, setConfig,
    citizens, setCitizens,
    savingAccounts, setSavingAccounts,
    savingTransactions, setSavingTransactions,
    loans, setLoans,
    loanRepayments, setLoanRepayments,
    cashTransactions, setCashTransactions,

    cashSearch, setCashSearch,
    cashFilterCategory, setCashFilterCategory,
    cashStartDate, setCashStartDate,
    cashEndDate, setCashEndDate,
    citizenSearch, setCitizenSearch,
    savingSearch, setSavingSearch,
    loanSearch, setLoanSearch,

    showConfigModal, setShowConfigModal,
    showAddCashModal, setShowAddCashModal,
    showAddCitizenModal, setShowAddCitizenModal,
    showSavingActionModal, setShowSavingActionModal,
    showNewLoanModal, setShowNewLoanModal,
    showRepaymentModal, setShowRepaymentModal,

    showEditCitizenModal, setShowEditCitizenModal,
    editingCitizen, setEditingCitizen,
    showEditCashModal, setShowEditCashModal,
    editingCash, setEditingCash,
    showEditLoanModal, setShowEditLoanModal,
    editingLoan, setEditingLoan,

    showAmortizationModal, setShowAmortizationModal,
    amortizationLoan,
    showMonthlyCashModal, setShowMonthlyCashModal,

    formConfig, setFormConfig,
    formCash, setFormCash,
    formCitizen, setFormCitizen,
    formSavingAction, setFormSavingAction,
    formLoan, setFormLoan,
    formRepayment, setFormRepayment,

    aiChatInput, setAiChatInput,
    aiChatHistory, setAiChatHistory,
    isAiLoading,
    aiAuditReport, setAiAuditReport,
    isAuditLoading,

    handleUpdateConfig,
    handleAddCashTransaction,
    handleOpenEditCash,
    handleUpdateCashTransaction,
    handleDeleteCashTransaction,
    handleAddCitizen,
    handleOpenEditCitizen,
    handleUpdateCitizen,
    handleDeleteCitizen,
    handleSavingAction,
    handleDisburseLoan,
    handleOpenEditLoan,
    handleUpdateLoan,
    handleDeleteLoan,
    handleRepayLoan,
    handleOpenAmortization,
    handleBackupData,
    restoreFileInputRef,
    handleTriggerRestore,
    handleRestoreData,
    handleSendAiMessage,
    handleGenerateAuditReport,
    triggerPrintLPJ,

    totalBkuMasuk, totalBkuKeluar, currentGeneralCash,
    totalInterestsEarned, totalFinesEarned, totalFeeRevenue,
    totalOtherRevenues, totalBumdesGrossIncome,
    totalGajiBeban, totalOpsBeban, totalBumdesExpenses,
    sisaHasilUsaha,
    alokasiPADesa, alokasiCadangan, alokasiPengurus,
    alokasiBonusWarga, alokasiSosial,
    showReceiptModal, setShowReceiptModal,
    lastCompletedTx, setLastCompletedTx,
    toast, showToast, handleClearMockData
  };
}
