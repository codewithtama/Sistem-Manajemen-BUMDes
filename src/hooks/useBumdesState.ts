import React, { useState, useEffect, useRef } from "react";
import {
  CashTransaction,
  Citizen,
  SavingAccount,
  SavingTransaction,
  Loan,
  LoanRepayment,
  BUMDesConfig,
  AuditEvent
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
  exportToJSON,
  computeTransactionHash,
  encryptData,
  decryptData,
  sha256
} from "../data";

// Ledger Hash Chaining Helpers
const recalculateLedgerHashes = (txs: CashTransaction[]): CashTransaction[] => {
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let prevHash = "";
  return sorted.map(tx => {
    const hash = computeTransactionHash(tx, prevHash);
    prevHash = hash;
    return { ...tx, hash };
  });
};

const verifyLedgerIntegrity = (txs: CashTransaction[]): boolean => {
  if (txs.length === 0) return false;
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let prevHash = "";
  for (let i = 0; i < sorted.length; i++) {
    const tx = sorted[i];
    const computed = computeTransactionHash(tx, prevHash);
    if (!tx.hash || tx.hash !== computed) {
      return true; // Ledger corrupted
    }
    prevHash = computed;
  }
  return false;
};

export function useBumdesState() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoadingServerDb, setIsLoadingServerDb] = useState(true);

  // ── Authentication Role State ──────────────────────────────────────────────
  const [userRole, setUserRole] = useState<"operator" | "admin">("operator");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  // ── Advanced Security States ───────────────────────────────────────────────
  const [isLedgerCorrupted, setIsLedgerCorrupted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    const saved = sessionStorage.getItem("admin_login_cooldown_until");
    if (saved) {
      const remaining = Math.ceil((Number(saved) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem("bumdes_audit_logs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse bumdes_audit_logs:", e);
      return [];
    }
  });

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
        if (parsed.adminPassword === undefined) {
          parsed.adminPassword = "admin123";
        }
        if (parsed.targetShu === undefined) {
          parsed.targetShu = initialBUMDesConfig.targetShu || 50000000;
        }
        if (parsed.targetPades === undefined) {
          parsed.targetPades = initialBUMDesConfig.targetPades || 20000000;
        }
        return parsed;
      }
      return { ...initialBUMDesConfig, adminPassword: "admin123" };
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

  // ── Advanced Security Hooks & Effects ───────────────────────────────────────
  const recordAuditEvent = (
    action: AuditEvent["action"],
    actor: "Operator" | "Superuser",
    details: string
  ) => {
    const dateToday = new Date().toISOString();
    setAuditLogs(prev => {
      const sorted = [...prev].sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id));
      const lastEvent = sorted[sorted.length - 1];
      const prevHash = lastEvent ? lastEvent.hash : "";
      
      const id = "evt-" + Date.now() + Math.random().toString().slice(-4);
      const content = `${id}|${dateToday}|${actor}|${action}|${details}|${prevHash}`;
      const hash = sha256(content);
      
      const newEvent: AuditEvent = {
        id,
        timestamp: dateToday,
        actor,
        action,
        details,
        prevHash,
        hash
      };
      const updated = [...sorted, newEvent];
      localStorage.setItem("bumdes_audit_logs", JSON.stringify(updated));
      return updated;
    });
  };

  const logEvent = (action: AuditEvent["action"], details: string) => {
    const actor = userRole === "admin" ? ("Superuser" as const) : ("Operator" as const);
    recordAuditEvent(action, actor, details);
  };

  // 1. Auto-Session Timeout (Auto-Lock 3 Minutes)
  const lastActivityTime = useRef<number>(Date.now());
  const warnToastShown = useRef<boolean>(false);

  useEffect(() => {
    if (userRole !== "admin") return;

    const resetTimer = () => {
      lastActivityTime.current = Date.now();
      if (warnToastShown.current) {
        warnToastShown.current = false;
        showToast("Sesi Superuser aktif kembali.", "success");
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityTime.current) / 1000);
      
      if (elapsedSeconds >= 150 && elapsedSeconds < 180 && !warnToastShown.current) {
        warnToastShown.current = true;
        showToast("Peringatan: Sesi Superuser akan terkunci otomatis dalam 30 detik karena tidak ada aktivitas.", "warning");
      } else if (elapsedSeconds >= 180) {
        setUserRole("operator");
        showToast("Sesi Superuser telah terkunci otomatis karena tidak ada aktivitas.", "info");
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [userRole]);

  // 2. Cooldown timer for Brute-Force lockout
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          sessionStorage.removeItem("admin_login_cooldown_until");
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // 3. Passive Ledger Verification Hook
  useEffect(() => {
    if (cashTransactions.length === 0) {
      setIsLedgerCorrupted(false);
      return;
    }
    const hasSomeHashes = cashTransactions.some(tx => !!tx.hash);
    if (!hasSomeHashes) {
      setIsLedgerCorrupted(false);
    } else {
      setIsLedgerCorrupted(verifyLedgerIntegrity(cashTransactions));
    }
  }, [cashTransactions]);

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
  useEffect(() => { localStorage.setItem("bumdes_audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);

  // ── Server Database Sync ───────────────────────────────────────────────────
  // 1. Load from server on startup
  useEffect(() => {
    const loadServerDb = async () => {
      // Force wipe browser local storage dummy data once to ensure a 100% fresh system
      const isFresh = localStorage.getItem("bumdes_fresh_v2.2");
      if (!isFresh) {
        localStorage.removeItem("bumdes_config");
        localStorage.removeItem("bumdes_citizens");
        localStorage.removeItem("bumdes_saving_accounts");
        localStorage.removeItem("bumdes_saving_txs");
        localStorage.removeItem("bumdes_loans");
        localStorage.removeItem("bumdes_repayments");
        localStorage.removeItem("bumdes_cash_txs");
        localStorage.setItem("bumdes_fresh_v2.2", "true");
        
        setConfig(initialBUMDesConfig);
        setFormConfig(initialBUMDesConfig);
        setCitizens([]);
        setSavingAccounts([]);
        setSavingTransactions([]);
        setLoans([]);
        setLoanRepayments([]);
        setCashTransactions(initialCashTransactions);
      }

      try {
        const response = await fetch("/api/db");
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            setConfig(data.config);
            setFormConfig(data.config);
          }
          if (data.citizens) setCitizens(data.citizens);
          if (data.savingAccounts) setSavingAccounts(data.savingAccounts);
          if (data.savingTransactions) setSavingTransactions(data.savingTransactions);
          if (data.loans) setLoans(data.loans);
          if (data.loanRepayments) setLoanRepayments(data.loanRepayments);
          
          if (data.cashTransactions) {
            let loadedTxs = data.cashTransactions;
            const hasSomeHashes = loadedTxs.some((tx: any) => !!tx.hash);
            if (!hasSomeHashes && loadedTxs.length > 0) {
              loadedTxs = recalculateLedgerHashes(loadedTxs);
            }
            setCashTransactions(loadedTxs);
            setIsLedgerCorrupted(verifyLedgerIntegrity(loadedTxs));
          }
          if (data.auditLogs) {
            setAuditLogs(data.auditLogs);
          } else {
            const savedLogs = localStorage.getItem("bumdes_audit_logs");
            if (!savedLogs || JSON.parse(savedLogs).length === 0) {
              const genId = "evt-genesis";
              const genTime = new Date().toISOString();
              const genContent = `${genId}|${genTime}|Superuser|SYSTEM_INIT|Sistem Notaris BUMDes Karya Bersama resmi diaktifkan secara mandiri.|`;
              const genHash = sha256(genContent);
              const genesisEvent: AuditEvent = {
                id: genId,
                timestamp: genTime,
                actor: "Superuser",
                action: "SYSTEM_INIT",
                details: "Sistem Notaris BUMDes Karya Bersama resmi diaktifkan secara mandiri.",
                prevHash: "",
                hash: genHash
              };
              setAuditLogs([genesisEvent]);
              localStorage.setItem("bumdes_audit_logs", JSON.stringify([genesisEvent]));
            }
          }
          showToast("Data berhasil disinkronisasi dari server database!", "success");
        } else {
          console.log("No database found on server, fallback to local storage");
          const saved = localStorage.getItem("bumdes_cash_txs");
          if (saved) {
            let localTxs = JSON.parse(saved);
            const hasSomeHashes = localTxs.some((tx: any) => !!tx.hash);
            if (!hasSomeHashes && localTxs.length > 0) {
              localTxs = recalculateLedgerHashes(localTxs);
              setCashTransactions(localTxs);
            }
            setIsLedgerCorrupted(verifyLedgerIntegrity(localTxs));
          }
        }
      } catch (err) {
        console.warn("Could not load database from server, using local storage instead.", err);
        const saved = localStorage.getItem("bumdes_cash_txs");
        if (saved) {
          let localTxs = JSON.parse(saved);
          const hasSomeHashes = localTxs.some((tx: any) => !!tx.hash);
          if (!hasSomeHashes && localTxs.length > 0) {
            localTxs = recalculateLedgerHashes(localTxs);
            setCashTransactions(localTxs);
          }
          setIsLedgerCorrupted(verifyLedgerIntegrity(localTxs));
        }
      } finally {
        setIsLoadingServerDb(false);
      }
    };
    loadServerDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Debounced background save to server when states change
  useEffect(() => {
    if (isLoadingServerDb) return;

    const saveState = async () => {
      try {
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config,
            citizens,
            savingAccounts,
            savingTransactions,
            loans,
            loanRepayments,
            cashTransactions,
            auditLogs
          })
        });
      } catch (err) {
        console.error("Failed to sync state with server database:", err);
      }
    };

    const timer = setTimeout(saveState, 800);
    return () => clearTimeout(timer);
  }, [config, citizens, savingAccounts, savingTransactions, loans, loanRepayments, cashTransactions, isLoadingServerDb]);

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
    logEvent("CONFIG_UPDATED", `Konfigurasi parameter BUMDes berhasil diperbarui: Nama BUMDes (${formConfig.bumdesName}), Target SHU (${formatRupiah(formConfig.targetShu || 0)})`);
    showToast("Konfigurasi administrasi BUMDes berhasil diperbarui!", "success");
  };

  // ── Authentication ──────────────────────────────────────────────────────────
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) {
      showToast(`Akses terkunci. Tunggu ${cooldownSeconds} detik.`, "error");
      return;
    }
    const requiredPassword = config.adminPassword || "admin123";
    if (adminPasswordInput === requiredPassword) {
      setUserRole("admin");
      setShowLoginModal(false);
      setAdminPasswordInput("");
      setFailedAttempts(0);
      recordAuditEvent("LOGIN_SUCCESS", "Superuser", "Akses administratif Superuser berhasil dibuka lewat password.");
      showToast("Akses Superuser/Admin berhasil dibuka!", "success");
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const cooldownTime = 300;
        const cooldownUntil = Date.now() + cooldownTime * 1000;
        sessionStorage.setItem("admin_login_cooldown_until", String(cooldownUntil));
        setCooldownSeconds(cooldownTime);
        setAdminPasswordInput("");
        recordAuditEvent("BRUTE_FORCE_LOCK", "Operator", "Tombol login superuser dikunci selama 5 menit akibat 5 kegagalan sandi berturut-turut.");
        showToast("Terlalu banyak percobaan salah! Akses terkunci selama 5 menit.", "error");
      } else {
        showToast(`Kata sandi salah. Percobaan gagal: ${nextAttempts}/5`, "error");
      }
    }
  };

  const handleAdminLogout = () => {
    setUserRole("operator");
    recordAuditEvent("LOGOUT", "Superuser", "Sesi Superuser ditutup secara manual.");
    showToast("Keluar dari akses Superuser. Mode Operator aktif.", "info");
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
    setCashTransactions(recalculateLedgerHashes([...cashTransactions, newTx]));
    setShowAddCashModal(false);
    logEvent("TX_CREATED", `Mencatat transaksi kas baru BKU: ${newTx.description} senilai ${formatRupiah(newTx.amount)}`);
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
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur mengoreksi transaksi kas hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
    if (!editingCash) return;
    if (editingCash.amount <= 0) {
      showToast("Jumlah nominal transaksi harus lebih besar dari Rp 0.", "warning");
      return;
    }
    if (!editingCash.description.trim()) {
      showToast("Harap berikan keterangan transaksi kas.", "warning");
      return;
    }
    setCashTransactions(prev => recalculateLedgerHashes(prev.map(t => t.id === editingCash.id ? editingCash : t)));
    setShowEditCashModal(false);
    logEvent("TX_UPDATED", `Mengoreksi transaksi kas ID: ${editingCash.id} menjadi deskripsi (${editingCash.description}) senilai ${formatRupiah(editingCash.amount)}`);
    setEditingCash(null);
    showToast("Transaksi kas berhasil dikoreksi!", "success");
  };

  const handleDeleteCashTransaction = (id: string) => {
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur menghapus transaksi kas hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
    if (!window.confirm("Hapus transaksi kas ini? Tindakan tidak dapat dibatalkan.")) return;
    setCashTransactions(prev => recalculateLedgerHashes(prev.filter(t => t.id !== id)));
    logEvent("TX_DELETED", `Menghapus catatan transaksi kas ID: ${id} dari pembukuan BKU.`);
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
    logEvent("CITIZEN_MUTATED", `Meregistrasi profil warga baru: ${newCitizen.name} NIK ${newCitizen.nik}`);
    setFormCitizen({ name: "", nik: "", phone: "", rtRw: "", address: "" });
    showToast(`Data warga ${newCitizen.name} berhasil ditambahkan!`, "success");
  };

  const handleOpenEditCitizen = (citizen: Citizen) => {
    setEditingCitizen({ ...citizen });
    setShowEditCitizenModal(true);
  };

  const handleUpdateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur mengedit profil warga hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
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
    logEvent("CITIZEN_MUTATED", `Memperbarui profil data warga: ${editingCitizen.name} NIK ${editingCitizen.nik}`);
    setEditingCitizen(null);
    showToast("Profil data warga berhasil diperbarui!", "success");
  };

  const handleDeleteCitizen = (id: string) => {
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur menghapus data warga hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
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

    // Find all related loan IDs for this citizen to prevent orphaned database records
    const relatedLoanIds = new Set(
      loans.filter(l => l.citizenId === id).map(l => l.id)
    );
    
    setCitizens(prev => prev.filter(c => c.id !== id));
    setSavingAccounts(prev => prev.filter(a => a.citizenId !== id));
    setSavingTransactions(prev => prev.filter(t => !relatedAccountIds.has(t.savingAccountId)));
    setLoans(prev => prev.filter(l => l.citizenId !== id));
    setLoanRepayments(prev => prev.filter(r => !relatedLoanIds.has(r.loanId)));
    
    logEvent("CITIZEN_MUTATED", `Menghapus data profil warga ID: ${id} beserta buku rekening simpanan terkait.`);
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
    setCashTransactions(recalculateLedgerHashes([...cashTransactions, newGeneralTx]));
    setShowSavingActionModal(false);
    logEvent("TX_CREATED", `Mutasi tabungan nasabah (${citizen.name}): ${newSavingTx.description} senilai ${formatRupiah(amount)}`);
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
    if (interestPercentage < 0) {
      showToast("Jasa administratif pinjaman tidak boleh bernilai negatif.", "warning");
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
    setCashTransactions(recalculateLedgerHashes([...cashTransactions, newGeneralTx]));
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
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur mengedit parameter kredit hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
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
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Fitur menghapus rekening kredit hanya tersedia untuk Superuser/Admin!", "error");
      return;
    }
    if (!window.confirm("Hapus data pinjaman ini beserta seluruh riwayat angsurannya? Tindakan tidak dapat dibatalkan.")) return;
    
    // Find related repayment IDs for this loan
    const relatedRepaymentIds = new Set(
      loanRepayments.filter(r => r.loanId === loanId).map(r => r.id)
    );
    
    setLoans(prev => prev.filter(l => l.id !== loanId));
    setLoanRepayments(prev => prev.filter(r => r.loanId !== loanId));
    setCashTransactions(prev => recalculateLedgerHashes(prev.filter(t => 
      t.referenceId !== loanId && !relatedRepaymentIds.has(t.referenceId || "")
    )));
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
    if (Number(principalPaid) < 0 || Number(interestPaid) < 0 || Number(finePaid) < 0) {
      showToast("Nominal setoran angsuran tidak boleh bernilai negatif.", "warning");
      return;
    }
    if (Number(principalPaid) <= 0 && Number(interestPaid) <= 0) {
      showToast("Harap isi alokasi pembayaran Pokok atau Jasa Administratif secara benar.", "warning");
      return;
    }
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      showToast("Data pinjaman aktif tidak ditemukan.", "error");
      return;
    }

    const remaining = loan.amount - loan.amountPaidPrincipal;
    const clampedPrincipal = Math.min(Number(principalPaid), Math.max(0, remaining));
    const totalRepay = clampedPrincipal + Number(interestPaid) + Number(finePaid);

    const newRepayment: LoanRepayment = {
      id: "lr-" + Date.now(),
      loanId,
      citizenName: loan.citizenName,
      date: new Date().toISOString().split("T")[0],
      principalPaid: clampedPrincipal,
      interestPaid: Number(interestPaid),
      finePaid: Number(finePaid),
      description: description.trim() || `Angsuran Pinjaman oleh ${loan.citizenName}`
    };
    const updatedLoans = loans.map(l => {
      if (l.id === loanId) {
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
      description: `Setoran Angsuran Simpan Pinjam - ${loan.citizenName} (Pokok: ${formatRupiah(clampedPrincipal)} + Jasa: ${formatRupiah(Number(interestPaid))})`,
      referenceId: newRepayment.id
    };
    const targetLoan = updatedLoans.find(l => l.id === loanId);
    const finalRemaining = targetLoan ? (targetLoan.amount - targetLoan.amountPaidPrincipal) : 0;

    setLoans(updatedLoans);
    setLoanRepayments([...loanRepayments, newRepayment]);
    setCashTransactions(recalculateLedgerHashes([...cashTransactions, newGeneralTx]));
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
        { label: "Angsuran Pokok", value: formatRupiah(clampedPrincipal) },
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
    const password = config.adminPassword || "admin123";
    const jsonStr = JSON.stringify(snapshot);
    const encrypted = encryptData(jsonStr, password);

    const blob = new Blob([encrypted], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BUMDes_Encrypted_Backup_${date}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logEvent("BACKUP_EXPORT", "Cadangan database BUMDes berhasil diekspor terenkripsi secara kriptografis.");
    showToast("Berkas cadangan terenkripsi berhasil diunduh!", "success");
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
        const fileContent = ev.target?.result as string;
        let parsedData: any;
        
        try {
          parsedData = JSON.parse(fileContent);
        } catch (jsonErr) {
          const password = config.adminPassword || "admin123";
          const decrypted = decryptData(fileContent, password);
          parsedData = JSON.parse(decrypted);
        }

        if (!parsedData.version || !parsedData.config || !parsedData.citizens) {
          showToast("File backup tidak valid atau formatnya salah.", "error");
          return;
        }
        if (!window.confirm(`Restore data dari backup tanggal ${parsedData.exportedAt?.split("T")[0] || "tidak diketahui"}?\n\nSEMUA data saat ini akan diganti. Tindakan ini tidak dapat dibatalkan.`)) return;
        
        setConfig({ ...initialBUMDesConfig, ...parsedData.config });
        setCitizens(parsedData.citizens || []);
        setSavingAccounts(parsedData.savingAccounts || []);
        setSavingTransactions(parsedData.savingTransactions || []);
        setLoans(parsedData.loans || []);
        setLoanRepayments(parsedData.loanRepayments || []);
        
        const restoredTxs = recalculateLedgerHashes(parsedData.cashTransactions || []);
        setCashTransactions(restoredTxs);
        if (parsedData.auditLogs) {
          setAuditLogs(parsedData.auditLogs);
        }
        logEvent("RESTORE_IMPORT", `Database BUMDes berhasil dipulihkan secara penuh dari berkas cadangan bertanggal ${parsedData.exportedAt?.split("T")[0]}.`);
        showToast("Data BUMDes berhasil dipulihkan dari berkas cadangan!", "success");
      } catch (err) {
        console.error("Restore failed:", err);
        showToast("Gagal mendekripsi atau membaca file backup. Pastikan kata sandi admin cocok.", "error");
      }
    };
    reader.readAsText(file);
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
    
    const chainedCapOnly = recalculateLedgerHashes(initialCapTxOnly);
    
    setCitizens([]);
    setSavingAccounts([]);
    setSavingTransactions([]);
    setLoans([]);
    setLoanRepayments([]);
    setCashTransactions(chainedCapOnly);
    
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
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-api-key": config.geminiApiKey || ""
        },
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
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-api-key": config.geminiApiKey || ""
        },
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

  const handleDistributeDividends = () => {
    if (userRole !== "admin") {
      showToast("Akses Ditolak: Hanya Superuser yang dapat membagikan dividen SHU warga!", "error");
      return;
    }
    if (sisaHasilUsaha <= 0) {
      showToast("Gagal: Sisa Hasil Usaha (SHU) bernilai nol atau negatif.", "error");
      return;
    }
    if (citizens.length === 0) {
      showToast("Gagal: Belum ada data warga terdaftar.", "error");
      return;
    }

    const totalBonusPool = alokasiBonusWarga;
    const basePool = Math.round(totalBonusPool * 0.5);
    const proportionalPool = Math.round(totalBonusPool * 0.5);

    const baseSharePerCitizen = Math.round(basePool / citizens.length);
    const totalSavings = savingAccounts.reduce((sum, a) => sum + a.balance, 0);

    let updatedAccounts = [...savingAccounts];
    const newSavingTxs: SavingTransaction[] = [];
    const dateToday = new Date().toISOString().split("T")[0];

    citizens.forEach(citizen => {
      const citizenAccounts = savingAccounts.filter(a => a.citizenId === citizen.id);
      const citizenSavingSum = citizenAccounts.reduce((sum, a) => sum + a.balance, 0);
      
      const baseAmount = baseSharePerCitizen;
      const proportionalAmount = totalSavings > 0 
        ? Math.round((citizenSavingSum / totalSavings) * proportionalPool)
        : 0;
      
      const totalDividend = baseAmount + proportionalAmount;
      if (totalDividend <= 0) return;

      let sukarelaAcc = updatedAccounts.find(a => a.citizenId === citizen.id && a.savingType === "Sukarela");
      if (!sukarelaAcc) {
        sukarelaAcc = {
          id: "sa-div-" + Date.now() + Math.random().toString().slice(-4),
          citizenId: citizen.id,
          citizenName: citizen.name,
          savingType: "Sukarela",
          balance: 0,
          lastUpdated: dateToday
        };
        updatedAccounts.push(sukarelaAcc);
      }

      const newBalance = sukarelaAcc.balance + totalDividend;
      updatedAccounts = updatedAccounts.map(a => 
        a.id === sukarelaAcc!.id ? { ...a, balance: newBalance, lastUpdated: dateToday } : a
      );

      newSavingTxs.push({
        id: "st-div-" + Date.now() + Math.random().toString().slice(-4),
        savingAccountId: sukarelaAcc.id,
        citizenName: citizen.name,
        date: dateToday,
        type: "setor",
        amount: totalDividend,
        description: `Bagi Hasil Dividen SHU BUMDes 2026 (Coop Base + Prop Simpanan)`
      });
    });

    setSavingAccounts(updatedAccounts);
    setSavingTransactions([...savingTransactions, ...newSavingTxs]);
    // Note: Cash does not physically leave the BUMDes vault when distributed directly into savings accounts.
    // It remains in BUMDes bank/vault as savings liabilities and is only recorded as a cash outflow ("keluar")
    // in BKU when citizens physically perform a savings withdrawal ("tarik").
    logEvent("DIVIDEND_DISBURSED", `Pencairan bagi hasil surplus (Dividen SHU 10%) senilai ${formatRupiah(totalBonusPool)} untuk ${citizens.length} warga.`);
    showToast(`Berhasil mencairkan dividen BUMDes sebesar ${formatRupiah(totalBonusPool)} kepada ${citizens.length} warga desa!`, "success");
  };

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
    handleDistributeDividends,
    auditLogs, setAuditLogs, recordAuditEvent, logEvent,

    totalBkuMasuk, totalBkuKeluar, currentGeneralCash,
    totalInterestsEarned, totalFinesEarned, totalFeeRevenue,
    totalOtherRevenues, totalBumdesGrossIncome,
    totalGajiBeban, totalOpsBeban, totalBumdesExpenses,
    sisaHasilUsaha,
    alokasiPADesa, alokasiCadangan, alokasiPengurus,
    alokasiBonusWarga, alokasiSosial,
    showReceiptModal, setShowReceiptModal,
    lastCompletedTx, setLastCompletedTx,
    toast, showToast, handleClearMockData,
    userRole, setUserRole,
    showLoginModal, setShowLoginModal,
    adminPasswordInput, setAdminPasswordInput,
    handleAdminLogin, handleAdminLogout,
    isLedgerCorrupted, cooldownSeconds
  };
}
