import React, { useState, useEffect } from "react";
import { 
  CashTransaction, 
  Citizen, 
  SavingAccount, 
  SavingTransaction, 
  Loan, 
  LoanRepayment, 
  BUMDesConfig 
} from "./types";
import { 
  initialBUMDesConfig, 
  initialCitizens, 
  initialSavingAccounts, 
  initialSavingTransactions, 
  initialLoans, 
  initialLoanRepayments, 
  initialCashTransactions, 
  formatRupiah 
} from "./data";
import DashboardOverview from "./components/DashboardOverview";
import { 
  LayoutDashboard, 
  Wallet, 
  Landmark, 
  HandCoins, 
  Users, 
  FileText, 
  Cpu, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Printer, 
  RefreshCcw, 
  Send,
  UserCheck, 
  Info,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";

export default function App() {
  // Current active view tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Local persistent states (fallback with mock initial data)
  const [config, setConfig] = useState<BUMDesConfig>(() => {
    const saved = localStorage.getItem("bumdes_config");
    return saved ? JSON.parse(saved) : initialBUMDesConfig;
  });

  const [citizens, setCitizens] = useState<Citizen[]>(() => {
    const saved = localStorage.getItem("bumdes_citizens");
    return saved ? JSON.parse(saved) : initialCitizens;
  });

  const [savingAccounts, setSavingAccounts] = useState<SavingAccount[]>(() => {
    const saved = localStorage.getItem("bumdes_saving_accounts");
    return saved ? JSON.parse(saved) : initialSavingAccounts;
  });

  const [savingTransactions, setSavingTransactions] = useState<SavingTransaction[]>(() => {
    const saved = localStorage.getItem("bumdes_saving_txs");
    return saved ? JSON.parse(saved) : initialSavingTransactions;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem("bumdes_loans");
    return saved ? JSON.parse(saved) : initialLoans;
  });

  const [loanRepayments, setLoanRepayments] = useState<LoanRepayment[]>(() => {
    const saved = localStorage.getItem("bumdes_repayments");
    return saved ? JSON.parse(saved) : initialLoanRepayments;
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem("bumdes_cash_txs");
    return saved ? JSON.parse(saved) : initialCashTransactions;
  });

  // Search & Filter state variables
  const [cashSearch, setCashSearch] = useState("");
  const [cashFilterCategory, setCashFilterCategory] = useState("Semua");
  const [citizenSearch, setCitizenSearch] = useState("");
  const [savingSearch, setSavingSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");

  // Modals visibility states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [showAddCitizenModal, setShowAddCitizenModal] = useState(false);
  const [showSavingActionModal, setShowSavingActionModal] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);

  // Form temporary fields states
  // Config Form
  const [formConfig, setFormConfig] = useState<BUMDesConfig>({ ...config });
  // Cash Transaction Form
  const [formCash, setFormCash] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "masuk" as "masuk" | "keluar",
    category: "Pendapatan Unit Usaha" as CashTransaction["category"],
    amount: 0,
    description: ""
  });
  // Citizen Form
  const [formCitizen, setFormCitizen] = useState({
    name: "",
    nik: "",
    phone: "",
    rtRw: "",
    address: ""
  });
  // Saving Action Form (Deposit / Withdraw)
  const [formSavingAction, setFormSavingAction] = useState({
    citizenId: "",
    savingType: "Sukarela" as SavingAccount["savingType"],
    type: "setor" as "setor" | "tarik",
    amount: 0,
    description: ""
  });
  // New Loan Form
  const [formLoan, setFormLoan] = useState({
    citizenId: "",
    amount: 0,
    tenorMonths: 10,
    repaymentPeriod: "Bulanan" as Loan["repaymentPeriod"],
    interestPercentage: 1.0,
    dateDisbursed: new Date().toISOString().split("T")[0]
  });
  // Repayment Form
  const [formRepayment, setFormRepayment] = useState({
    loanId: "",
    principalPaid: 0,
    interestPaid: 0,
    finePaid: 0,
    description: ""
  });

  // AI Advisor State variables
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

  // Synchronize localStorage with state variables on change
  useEffect(() => {
    localStorage.setItem("bumdes_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("bumdes_citizens", JSON.stringify(citizens));
  }, [citizens]);

  useEffect(() => {
    localStorage.setItem("bumdes_saving_accounts", JSON.stringify(savingAccounts));
  }, [savingAccounts]);

  useEffect(() => {
    localStorage.setItem("bumdes_saving_txs", JSON.stringify(savingTransactions));
  }, [savingTransactions]);

  useEffect(() => {
    localStorage.setItem("bumdes_loans", JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem("bumdes_repayments", JSON.stringify(loanRepayments));
  }, [loanRepayments]);

  useEffect(() => {
    localStorage.setItem("bumdes_cash_txs", JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  // Form Submit Handlers
  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formConfig);
    setShowConfigModal(false);
  };

  const handleAddCashTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (formCash.amount <= 0 || !formCash.description) return alert("Harap isi jumlah dan keterangan dengan benar.");

    const newTx: CashTransaction = {
      id: "tx-" + (cashTransactions.length + 1) + "-" + Date.now(),
      date: formCash.date,
      type: formCash.type,
      category: formCash.category,
      amount: formCash.amount,
      description: formCash.description
    };

    setCashTransactions([...cashTransactions, newTx]);
    setShowAddCashModal(false);
    // Reset
    setFormCash({
      date: new Date().toISOString().split("T")[0],
      type: "masuk",
      category: "Pendapatan Unit Usaha",
      amount: 0,
      description: ""
    });
  };

  const handleAddCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCitizen.name || !formCitizen.nik || formCitizen.nik.length !== 16) {
      return alert("Nama wajib diisi dan NIK harus berupa 16 digit angka.");
    }

    const newCitizen: Citizen = {
      id: "cit-" + (citizens.length + 1) + "-" + Date.now(),
      name: formCitizen.name,
      nik: formCitizen.nik,
      phone: formCitizen.phone,
      rtRw: formCitizen.rtRw,
      address: formCitizen.address,
      joinedAt: new Date().toISOString().split("T")[0]
    };

    setCitizens([...citizens, newCitizen]);
    setShowAddCitizenModal(false);
    // Reset
    setFormCitizen({
      name: "",
      nik: "",
      phone: "",
      rtRw: "",
      address: ""
    });
  };

  const handleSavingAction = (e: React.FormEvent) => {
    e.preventDefault();
    const { citizenId, savingType, type, amount, description } = formSavingAction;
    if (!citizenId || amount <= 0) return alert("Pilih warga dan masukkan nominal yang sah.");

    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) return;

    // Check account existence or create
    let account = savingAccounts.find(a => a.citizenId === citizenId && a.savingType === savingType);
    let updatedAccounts = [...savingAccounts];

    if (!account) {
      account = {
        id: "sa-" + (savingAccounts.length + 1) + "-" + Date.now(),
        citizenId: citizenId,
        citizenName: citizen.name,
        savingType: savingType,
        balance: 0,
        lastUpdated: new Date().toISOString().split("T")[0]
      };
      updatedAccounts.push(account);
    }

    if (type === "tarik" && account.balance < amount) {
      return alert("Saldo tidak mencukupi untuk melakukan penarikan. Saldo saat ini: " + formatRupiah(account.balance));
    }

    // Process Ledger Balancing
    const updatedBalance = type === "setor" ? account.balance + amount : account.balance - amount;
    
    // Update individual account balance
    updatedAccounts = updatedAccounts.map(a => {
      if (a.id === account!.id) {
        return {
          ...a,
          balance: updatedBalance,
          lastUpdated: new Date().toISOString().split("T")[0]
        };
      }
      return a;
    });

    const newSavingTx: SavingTransaction = {
      id: "st-" + (savingTransactions.length + 1) + "-" + Date.now(),
      savingAccountId: account.id,
      citizenName: citizen.name,
      date: new Date().toISOString().split("T")[0],
      type: type,
      amount: amount,
      description: description || `${type === "setor" ? "Setor" : "Tarik"} Tabungan ${savingType}`
    };

    // Mirror to General Cash Ledger (Buku Kas Umum / BKU)
    const newGeneralTx: CashTransaction = {
      id: "tx-st-" + Date.now(),
      date: newSavingTx.date,
      type: type === "setor" ? "masuk" : "keluar",
      category: type === "setor" ? "Simpanan Warga" : "Withdrawal Simpanan",
      amount: amount,
      description: `${newSavingTx.description} (Nasabah: ${citizen.name})`,
      referenceId: newSavingTx.id
    };

    setSavingAccounts(updatedAccounts);
    setSavingTransactions([...savingTransactions, newSavingTx]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowSavingActionModal(false);
    
    // Reset Form
    setFormSavingAction({
      citizenId: "",
      savingType: "Sukarela",
      type: "setor",
      amount: 0,
      description: ""
    });
  };

  const handleDisburseLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const { citizenId, amount, tenorMonths, repaymentPeriod, interestPercentage, dateDisbursed } = formLoan;
    if (!citizenId || amount <= 0 || tenorMonths <= 0) return alert("Isi seluruh field pinjaman secara berkala.");

    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) return;

    // Check general cash availability
    const totalCashIn = cashTransactions
      .filter((tx) => tx.type === "masuk")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalCashOut = cashTransactions
      .filter((tx) => tx.type === "keluar")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const availableC = totalCashIn - totalCashOut;

    if (amount > availableC) {
      return alert("Kas utama BUMDes tidak mencukupi untuk menyalurkan pinjaman ini. Sisa Kas saat ini: " + formatRupiah(availableC));
    }

    // Set Due Date based on disburment + tenor
    const d = new Date(dateDisbursed);
    d.setMonth(d.getMonth() + Number(tenorMonths));
    const dueDate = d.toISOString().split("T")[0];

    const newLoan: Loan = {
      id: "loan-" + (loans.length + 1) + "-" + Date.now(),
      citizenId: citizenId,
      citizenName: citizen.name,
      amount: amount,
      interestPercentage: interestPercentage,
      tenorMonths: Number(tenorMonths),
      repaymentPeriod: repaymentPeriod,
      dateDisbursed: dateDisbursed,
      dueDate: dueDate,
      status: "Lancar",
      amountPaidPrincipal: 0,
      amountPaidInterest: 0
    };

    // Mirror to General Cash Ledger
    const newGeneralTx: CashTransaction = {
      id: "tx-ln-" + Date.now(),
      date: dateDisbursed,
      type: "keluar",
      category: "Disbursement Pinjaman",
      amount: amount,
      description: `Pemberian Pinjaman Simpan Pinjam kepada ${citizen.name} (Tenor ${tenorMonths} bln)`,
      referenceId: newLoan.id
    };

    setLoans([...loans, newLoan]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowNewLoanModal(false);

    // Reset Form
    setFormLoan({
      citizenId: "",
      amount: 0,
      tenorMonths: 10,
      repaymentPeriod: "Bulanan",
      interestPercentage: config.customInterestRate,
      dateDisbursed: new Date().toISOString().split("T")[0]
    });
  };

  const handleRepayLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const { loanId, principalPaid, interestPaid, finePaid, description } = formRepayment;
    if (!loanId || (principalPaid <= 0 && interestPaid <= 0)) {
      return alert("Harap isi alokasi pembayaran Pokok atau Jasa Administratif secara benar.");
    }

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const totalRepay = Number(principalPaid) + Number(interestPaid) + Number(finePaid);

    const newRepayment: LoanRepayment = {
      id: "lr-" + (loanRepayments.length + 1) + "-" + Date.now(),
      loanId: loanId,
      citizenName: loan.citizenName,
      date: new Date().toISOString().split("T")[0],
      principalPaid: Number(principalPaid),
      interestPaid: Number(interestPaid),
      finePaid: Number(finePaid),
      description: description || `Angsuran Pinjaman oleh ${loan.citizenName}`
    };

    // Update active Loan state
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        const nextPrincipal = l.amountPaidPrincipal + Number(principalPaid);
        const nextInterest = l.amountPaidInterest + Number(interestPaid);
        
        // Dynamic status check: If fully paid, it's Lancar / Lunas, else calculate health
        const isLunas = nextPrincipal >= l.amount;
        
        return {
          ...l,
          amountPaidPrincipal: nextPrincipal,
          amountPaidInterest: nextInterest,
          status: isLunas ? "Lancar" : l.status // Keep or let user manage
        };
      }
      return l;
    });

    // Mirror to General Cash Ledger
    const newGeneralTx: CashTransaction = {
      id: "tx-lr-" + Date.now(),
      date: newRepayment.date,
      type: "masuk",
      category: "Repayment Pinjaman",
      amount: totalRepay,
      description: `Setoran Angsuran Simpan Pinjam - ${loan.citizenName} (Pokok: ${formatRupiah(Number(principalPaid))} + Jasa: ${formatRupiah(Number(interestPaid))})`,
      referenceId: newRepayment.id
    };

    setLoans(updatedLoans);
    setLoanRepayments([...loanRepayments, newRepayment]);
    setCashTransactions([...cashTransactions, newGeneralTx]);
    setShowRepaymentModal(false);

    // Reset Form
    setFormRepayment({
      loanId: "",
      principalPaid: 0,
      interestPaid: 0,
      finePaid: 0,
      description: ""
    });
  };

  // Status Classifiers helper
  const getLoanStatusBadge = (status: Loan["status"]) => {
    switch (status) {
      case "Lancar":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">Lancar</span>;
      case "Kurang Lancar":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest">Kurang Lancar</span>;
      case "Diragukan":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-widest">Diragukan</span>;
      case "Macet":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-100 uppercase tracking-widest animate-pulse">Macet (NPL)</span>;
    }
  };

  // AI Chat Request handler
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = aiChatInput;
    setAiChatInput("");

    // optimistic update history
    const nextHistory = [...aiChatHistory, { role: "user" as const, text: userMsg }];
    setAiChatHistory(nextHistory);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: nextHistory.slice(0, -1), // prior chat history entries
          contextData: {
            bumdes: config,
            citizensCount: citizens.length,
            cash: {
              masuk: cashTransactions.filter(t => t.type === "masuk").reduce((s,t) => s+t.amount, 0),
              keluar: cashTransactions.filter(t => t.type === "keluar").reduce((s,t) => s+t.amount, 0),
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
      setAiChatHistory([...nextHistory, { role: "model", text: "Terjadi kesalahan koneksi ke server AI." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Dynamic Financial Audit Maker with Gemini
  const handleGenerateAuditReport = async () => {
    setIsAuditLoading(true);
    setAiAuditReport("");

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashTransactions: cashTransactions.slice(-30), // send latest 30 transactions to prevent payload bloating
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
      setAiAuditReport("### Error Koneksi\nKoneksi jaringan terputus sewaktu melakukan audit AI.");
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Helper calculation for LPJ (Musyawarah Pertanggungjawaban Tahunan)
  const totalBkuMasuk = cashTransactions.filter(t => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalBkuKeluar = cashTransactions.filter(t => t.type === "keluar").reduce((s, t) => s + t.amount, 0);
  const currentGeneralCash = totalBkuMasuk - totalBkuKeluar;

  const totalInterestsEarned = loanRepayments.reduce((s, r) => s + r.interestPaid, 0);
  const totalFinesEarned = loanRepayments.reduce((s, r) => s + r.finePaid, 0);
  const totalFeeRevenue = totalInterestsEarned + totalFinesEarned;

  const totalOtherRevenues = cashTransactions
    .filter(t => t.category === "Pendapatan Unit Usaha")
    .reduce((s, t) => s + t.amount, 0);

  const totalBumdesGrossIncome = totalFeeRevenue + totalOtherRevenues;

  // Beban / Costs
  const totalGajiBeban = cashTransactions
    .filter(t => t.category === "Beban Gaji & Honor")
    .reduce((s, t) => s + t.amount, 0);

  const totalOpsBeban = cashTransactions
    .filter(t => t.category === "Beban Operasional")
    .reduce((s, t) => s + t.amount, 0);

  const totalBumdesExpenses = totalGajiBeban + totalOpsBeban;
  const sisaHasilUsaha = totalBumdesGrossIncome - totalBumdesExpenses;

  // Regulatory distribution percentages according to Kemendesa PDTT No 3/2021
  const alokasiPADesa = sisaHasilUsaha > 0 ? sisaHasilUsaha * 0.40 : 0;
  const alokasiCadangan = sisaHasilUsaha > 0 ? sisaHasilUsaha * 0.30 : 0;
  const alokasiPengurus = sisaHasilUsaha > 0 ? sisaHasilUsaha * 0.15 : 0;
  const alokasiBonusWarga = sisaHasilUsaha > 0 ? sisaHasilUsaha * 0.10 : 0;
  const alokasiSosial = sisaHasilUsaha > 0 ? sisaHasilUsaha * 0.05 : 0;

  // Print system handler for financial report
  const triggerPrintLPJ = () => {
    window.print();
  };

  return (
    <div id="bumdes_system" className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Sidebar Navigation - Clean Minimalism themed */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        
        {/* Core Header info banner */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold font-display shadow-xs">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900 font-display">BUMDes Digital</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-1">SIM-KEMENDESA</span>
          </div>
        </div>

        {/* Navigation Action Links */}
        <div className="flex-1 px-4 py-6 space-y-1">
          <button 
            id="nav_dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Ringkasan Beranda
          </button>

          <button 
            id="nav_kas"
            onClick={() => setActiveTab("kas")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "kas" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            Manajemen Buku Kas
          </button>

          <button 
            id="nav_simpanan"
            onClick={() => setActiveTab("simpanan")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "simpanan" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Landmark className="w-4 h-4 shrink-0" />
            Simpanan Warga
          </button>

          <button 
            id="nav_pinjaman"
            onClick={() => setActiveTab("pinjaman")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "pinjaman" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <HandCoins className="w-4 h-4 shrink-0" />
            Simpan Pinjam Unit
          </button>

          <button 
            id="nav_warga"
            onClick={() => setActiveTab("warga")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "warga" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Data Warga Desa
          </button>

          <button 
            id="nav_laporan"
            onClick={() => setActiveTab("laporan")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "laporan" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            Laporan Keuangan LPJ
          </button>

          <button 
            id="nav_advisor"
            onClick={() => setActiveTab("advisor")}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "advisor" 
                ? "bg-emerald-600 text-white shadow-xs" 
                : "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            Asisten Regulasi AI
          </button>
        </div>

        {/* Sidebar Footer with regulatory notice */}
        <div className="p-6 border-t border-slate-100 hidden md:block">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sertifikat LPJ</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tercatat pada Sistem Kemendesa PDTT. Semua laporan dikompilasi sesuai <strong>Permendesa No. 3/2021</strong>.
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* App Top Toolbar / Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono uppercase">
              Operator: {config.treasurerName}
            </span>
            <button 
              id="btn_open_config"
              onClick={() => {
                setFormConfig({ ...config });
                setShowConfigModal(true);
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              Ubah Parameter Desa
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 font-display">{config.bumdesName}</span>
              <span className="text-[9px] text-slate-400 font-medium uppercase font-mono">{config.villageName}</span>
            </div>
            <div className="w-9 h-9 bg-slate-100 hover:bg-slate-200 transition rounded-xl flex items-center justify-center border border-slate-200 font-bold text-slate-600 cursor-pointer">
              {config.treasurerName.split(" ").slice(-1)[0].substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Viewports with Clean Minimalism Padding */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          
          {/* Dashboard Tab rendering DashboardOverview component */}
          {activeTab === "dashboard" && (
            <DashboardOverview 
              cashTransactions={cashTransactions}
              savingAccounts={savingAccounts}
              loans={loans}
              villageName={config.villageName}
              bumdesName={config.bumdesName}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Buku Kas Tab (General Ledger Cash Management) */}
          {activeTab === "kas" && (
            <div id="view_buku_kas" className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Buku Kas Umum (BKU)</h2>
                  <p className="text-xs text-slate-500 mt-1">Lembaga Pencatatan Utama Kas Masuk & Kas Keluar BUMDes secara real-time.</p>
                </div>
                <button 
                  id="btn_add_cash_transaction"
                  onClick={() => setShowAddCashModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 self-start cursor-pointer shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Transaksi Kas
                </button>
              </div>

              {/* Table Toolbar / Controls */}
              <div className="flex flex-col md:flex-row gap-3 bg-white p-4 border border-slate-200 rounded-xl justify-between items-center">
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-3 flex items-center pl-1 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Cari transaksi..."
                    value={cashSearch}
                    onChange={(e) => setCashSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Filter Kategori:</span>
                  <select 
                    value={cashFilterCategory}
                    onChange={(e) => setCashFilterCategory(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Modal Awal BUMDes">Modal Awal</option>
                    <option value="Simpanan Warga">Setor Simpanan</option>
                    <option value="Withdrawal Simpanan">Tarik Simpanan</option>
                    <option value="Disbursement Pinjaman">Pencairan Kredit</option>
                    <option value="Repayment Pinjaman">Angsuran Kredit</option>
                    <option value="Pendapatan Unit Usaha">Pendapatan Lainnya</option>
                    <option value="Beban Gaji & Honor">Honor Pengurus</option>
                    <option value="Beban Operasional">Beban ATK & Ops</option>
                  </select>
                </div>
              </div>

              {/* Ledger Tabular Sheet */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">ID Transaksi</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Kategori / Akun</th>
                        <th className="px-6 py-4">Keterangan</th>
                        <th className="px-6 py-4 text-right">Debit (Masuk)</th>
                        <th className="px-6 py-4 text-right">Kredit (Keluar)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {cashTransactions
                        .filter(tx => {
                          const matchesSearch = tx.description.toLowerCase().includes(cashSearch.toLowerCase()) || 
                                                tx.category.toLowerCase().includes(cashSearch.toLowerCase());
                          const matchesCat = cashFilterCategory === "Semua" || tx.category === cashFilterCategory;
                          return matchesSearch && matchesCat;
                        })
                        .map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-mono font-medium text-slate-400 text-[10px]">{tx.id.split("-").slice(0, 2).join("-")}</td>
                            <td className="px-6 py-4 font-mono">{tx.date}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{tx.description}</td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">
                              {tx.type === "masuk" ? formatRupiah(tx.amount) : "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-rose-600 font-bold">
                              {tx.type === "keluar" ? formatRupiah(tx.amount) : "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/60 font-bold text-slate-800 border-t border-slate-200">
                        <td colSpan={4} className="px-6 py-4 text-right">Total Akumulatif:</td>
                        <td className="px-6 py-4 text-right font-mono text-emerald-600">
                          {formatRupiah(cashTransactions.filter(t => t.type === "masuk").reduce((s,t) => s+t.amount, 0))}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-rose-600">
                          {formatRupiah(cashTransactions.filter(t => t.type === "keluar").reduce((s,t) => s+t.amount, 0))}
                        </td>
                      </tr>
                      <tr className="bg-slate-900 text-white font-bold text-sm">
                        <td colSpan={4} className="px-6 py-4 text-right">Saldo Kas Buku Kas Umum Terkini:</td>
                        <td colSpan={2} className="px-6 py-4 text-right font-mono text-emerald-400 text-base">
                          {formatRupiah(currentGeneralCash)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tabungan / Simpanan warga Tab (Savings Pool) */}
          {activeTab === "simpanan" && (
            <div id="view_simpanan" className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Unit Tabungan & Simpanan Warga</h2>
                  <p className="text-xs text-slate-500 mt-1">Mengelola Simpanan Pokok, Simpanan Wajib, dan Simpanan Sukarela penduduk desa.</p>
                </div>
                <button 
                  id="btn_action_saving"
                  onClick={() => setShowSavingActionModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 self-start cursor-pointer shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Transaksi Mutasi Simpanan
                </button>
              </div>

              {/* Metric stats mini panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Simpanan Sukarela</span>
                    <span className="text-lg font-bold font-mono text-slate-850 mt-1 block">
                      {formatRupiah(savingAccounts.filter(a => a.savingType === "Sukarela").reduce((s,a) => s+a.balance, 0))}
                    </span>
                  </div>
                  <span className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Landmark className="w-5 h-5" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Simpanan Wajib</span>
                    <span className="text-lg font-bold font-mono text-slate-850 mt-1 block">
                      {formatRupiah(savingAccounts.filter(a => a.savingType === "Wajib").reduce((s,a) => s+a.balance, 0))}
                    </span>
                  </div>
                  <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award className="w-5 h-5" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Simpanan Pokok</span>
                    <span className="text-lg font-bold font-mono text-slate-850 mt-1 block">
                      {formatRupiah(savingAccounts.filter(a => a.savingType === "Pokok").reduce((s,a) => s+a.balance, 0))}
                    </span>
                  </div>
                  <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* Main List of Savings Accounts */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Buku Pembantu Rekening Simpanan Warga</h3>
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Cari rekening nasabah..."
                      value={savingSearch}
                      onChange={(e) => setSavingSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xxs bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Nama Nasabah</th>
                        <th className="px-6 py-4">Jenis Tabungan</th>
                        <th className="px-6 py-4">Pembaruan Terkini</th>
                        <th className="px-6 py-4 text-right">Saldo Saat Ini</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {savingAccounts
                        .filter(a => a.citizenName.toLowerCase().includes(savingSearch.toLowerCase()))
                        .map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-semibold text-slate-800">{acc.citizenName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                acc.savingType === "Sukarela" 
                                  ? "bg-blue-50 text-blue-700 border-blue-100" 
                                  : acc.savingType === "Wajib" 
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
                                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                Simpanan {acc.savingType}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">{acc.lastUpdated}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{formatRupiah(acc.balance)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Logs / History */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-800 font-display mb-4">Riwayat Histori Transaksi Tabungan</h3>
                <div className="space-y-3">
                  {savingTransactions.slice(-6).reverse().map((st) => (
                    <div key={st.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg border ${
                          st.type === "setor" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                          {st.type === "setor" ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{st.citizenName} — <span className="text-slate-400 font-normal">{st.description}</span></p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{st.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${st.type === "setor" ? "text-emerald-600" : "text-rose-600"}`}>
                        {st.type === "setor" ? "+" : "-"}{formatRupiah(st.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Unit Simpan Pinjam / Kredit Tab */}
          {activeTab === "pinjaman" && (
            <div id="view_pinjaman" className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Unit Penyaluran & Angsuran Kredit</h2>
                  <p className="text-xs text-slate-500 mt-1">Sistem Simpan Pinjam BUMDes dengan kelola bagi hasil administratif berkeadilan.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    id="btn_repayment_loan"
                    onClick={() => setShowRepaymentModal(true)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-55 text-slate-700 bg-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    Bayar Angsuran / Setoran
                  </button>
                  <button 
                    id="btn_new_loan"
                    onClick={() => setShowNewLoanModal(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    Penyaluran Pinjaman Baru
                  </button>
                </div>
              </div>

              {/* Active list showing Borrower Statuses */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Daftar Aktif Pinjaman Pengurus & Warga</h3>
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Cari peminjam..."
                      value={loanSearch}
                      onChange={(e) => setLoanSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xxs bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Nama Penerima</th>
                        <th className="px-6 py-4">Suku Jasa Administrasi</th>
                        <th className="px-6 py-4">Total Pinjam</th>
                        <th className="px-6 py-4">Principal Terbayar</th>
                        <th className="px-6 py-4">Kolektibilitas (Kemendesa)</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {loans
                        .filter(l => l.citizenName.toLowerCase().includes(loanSearch.toLowerCase()))
                        .map((ln) => {
                          const outstanding = ln.amount - ln.amountPaidPrincipal;
                          return (
                            <tr key={ln.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800">{ln.citizenName}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Tgl Penyaluran: {ln.dateDisbursed}</div>
                              </td>
                              <td className="px-6 py-4 font-mono font-medium">
                                {ln.interestPercentage}% / {ln.repaymentPeriod}
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatRupiah(ln.amount)}</td>
                              <td className="px-6 py-4 font-mono text-slate-500">
                                {formatRupiah(ln.amountPaidPrincipal)} / <span className="font-semibold">{formatRupiah(outstanding)} sisa</span>
                              </td>
                              <td className="px-6 py-4">{getLoanStatusBadge(ln.status)}</td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={() => {
                                    // Prepopulate repayment fields
                                    const recommendedInterest = Math.round(ln.amount * (ln.interestPercentage / 100));
                                    const recommendedPrincipal = Math.round(ln.amount / ln.tenorMonths);
                                    setFormRepayment({
                                      loanId: ln.id,
                                      principalPaid: recommendedPrincipal,
                                      interestPaid: recommendedInterest,
                                      finePaid: 0,
                                      description: `Pembayaran angsuran rutin ${ln.citizenName}`
                                    });
                                    setShowRepaymentModal(true);
                                  }}
                                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition hover:underline cursor-pointer"
                                >
                                  Angsur
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Repayments log */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-800 font-display mb-4">Mutasi Setoran Angsuran Simpan Pinjam</h3>
                <div className="space-y-3">
                  {loanRepayments.slice(-5).reverse().map((rep) => (
                    <div key={rep.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                          <CheckIcon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{rep.citizenName} — <span className="text-slate-500 font-normal">{rep.description}</span></p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pokok: {formatRupiah(rep.principalPaid)} | Jasa Administratif: {formatRupiah(rep.interestPaid)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatRupiah(rep.principalPaid + rep.interestPaid + rep.finePaid)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Citizen / Warga Data Management Tab */}
          {activeTab === "warga" && (
            <div id="view_warga" className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Database Kependudukan & Nasabah Desa</h2>
                  <p className="text-xs text-slate-500 mt-1">Registrasi identitas resmi warga Desa guna analisis kelayakan penyaluran (5C).</p>
                </div>
                <button 
                  id="btn_add_citizen"
                  onClick={() => setShowAddCitizenModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 self-start cursor-pointer shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Daftarkan Warga Baru
                </button>
              </div>

              {/* Citizen Directory Filter and List */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pencarian Identitas Penduduk ({citizens.length} Jiwa Registered)</span>
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Cari nama atau NIK warga..."
                      value={citizenSearch}
                      onChange={(e) => setCitizenSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xxs bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Nama Lengkap</th>
                        <th className="px-6 py-4">Nomor Induk Kependudukan (NIK)</th>
                        <th className="px-6 py-4">Kontak / Telepon</th>
                        <th className="px-6 py-4">Alamat Domisili</th>
                        <th className="px-6 py-4">Bergabung Sejak</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {citizens
                        .filter(c => c.name.toLowerCase().includes(citizenSearch.toLowerCase()) || c.nik.includes(citizenSearch))
                        .map((cit) => (
                          <tr key={cit.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                {cit.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">{cit.nik}</td>
                            <td className="px-6 py-4 font-mono">{cit.phone || "-"}</td>
                            <td className="px-6 py-4">
                              <p className="text-slate-700 leading-normal">{cit.address}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase">{cit.rtRw}</p>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">{cit.joinedAt}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Laporan Keuangan LPJ Tab (Kemendesa PDTT Format compliance reports) */}
          {activeTab === "laporan" && (
            <div id="view_laporan_lpj" className="space-y-6 animate-fade-in printing-section">
              <div className="no-print flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Laporan Pertanggungjawaban Keuangan (LPJ)</h2>
                  <p className="text-xs text-slate-500 mt-1">Laporan berkas resmi untuk Musyawarah Desa (Musdes) tahun berjalan sesuai regulasi Kemendesa.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("advisor")}
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    Buka Evaluasi AI
                  </button>
                  <button 
                    id="btn_print_lpj"
                    onClick={triggerPrintLPJ}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Laporan / PDF
                  </button>
                </div>
              </div>

              {/* Printable LPJ Book Sheet */}
              <div id="lpj_printable_sheet" className="bg-white border border-slate-350 shadow-md p-8 md:p-12 rounded-2xl space-y-8 font-serif leading-relaxed text-slate-900 relative">
                {/* Stamp/Watermark */}
                <span className="absolute top-8 right-8 text-[9px] font-bold font-mono tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-250 no-print">
                  Terdaftar Berkas BUMDes RI
                </span>

                {/* Header Kop Surat */}
                <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-6">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight">{config.bumdesName}</h2>
                  <p className="text-sm tracking-wide font-normal font-sans text-slate-600">Badan Usaha Milik Desa yang Didirikan Berdasarkan UU RI No. 6/2014 & Permendesa No. 3/2011</p>
                  <p className="text-xs font-sans text-slate-500">{config.villageName}, Kecamatan Sukajaya, Kabupaten Sukabumi, Jawa Barat</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-center font-bold uppercase text-base underline font-sans">Laporan Laba Rugi Operasional Unit Usaha</h3>
                  <p className="text-center text-xs font-sans text-slate-500">Per Tanggal Berjalan {new Date().toISOString().split("T")[0]}</p>
                </div>

                {/* Financial Ledger Data compiled */}
                <div className="space-y-4 font-sans text-sm">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-55 p-3.5 font-bold border-b border-slate-200 text-slate-800">
                      I. Pendapatan Operasional BUMDes
                    </div>
                    <div className="divide-y divide-slate-150">
                      <div className="flex justify-between p-3.5 pl-6">
                        <span>Pendapatan Jasa Administrasi Simpan Pinjam (Interest)</span>
                        <span className="font-mono">{formatRupiah(totalFeeRevenue)}</span>
                      </div>
                      <div className="flex justify-between p-3.5 pl-6">
                        <span>Pendapatan Bagi Hasil Unit Usaha Lain (Toko, Air Bersih, dll.)</span>
                        <span className="font-mono">{formatRupiah(totalOtherRevenues)}</span>
                      </div>
                      <div className="flex justify-between p-3.5 bg-slate-50 font-semibold pl-6 border-t border-slate-200 text-slate-800">
                        <span>Total Pendapatan Kotor BUMDes (Gross Income)</span>
                        <span className="font-mono">{formatRupiah(totalBumdesGrossIncome)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                    <div className="bg-slate-55 p-3.5 font-bold border-b border-slate-200 text-slate-800">
                      II. Beban & Pengeluaran Operasional
                    </div>
                    <div className="divide-y divide-slate-150">
                      <div className="flex justify-between p-3.5 pl-6">
                        <span>Beban Gaji, Tunjangan & Honor Pengurus</span>
                        <span className="font-mono text-rose-600">({formatRupiah(totalGajiBeban)})</span>
                      </div>
                      <div className="flex justify-between p-3.5 pl-6">
                        <span>Beban Buku Pembantu, Alat Tulis Kantor (ATK) & Administrasi</span>
                        <span className="font-mono text-rose-600">({formatRupiah(totalOpsBeban)})</span>
                      </div>
                      <div className="flex justify-between p-3.5 bg-slate-50 font-semibold pl-6 border-t border-slate-200 text-slate-800">
                        <span>Total Beban Operasional</span>
                        <span className="font-mono text-rose-600">({formatRupiah(totalBumdesExpenses)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Calculations surplus  */}
                  <div className="border border-slate-900 rounded-xl overflow-hidden mt-6 bg-slate-900 text-white p-5 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">SISA HASIL USAHA (SHU) BERJALAN</h4>
                      <p className="text-xxs text-slate-400 mt-1">Keuntungan bersih yang siap dipisahkan sesuai regulasi Kemendesa.</p>
                    </div>
                    <span className="text-lg md:text-xl font-bold font-mono text-emerald-400">
                      {formatRupiah(sisaHasilUsaha)}
                    </span>
                  </div>

                  {/* Kemendesa PDTT allocations list */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                    <div className="bg-slate-55 p-3.5 font-bold border-b border-slate-200 text-slate-800 flex justify-between">
                      <span>III. Alokasi Pembagian Surplus Usaha (Sesuai Permendesa No 3/2021)</span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Aspek Kepatuhan</span>
                    </div>
                    <div className="divide-y divide-slate-150 text-xs">
                      <div className="flex justify-between p-3.5">
                        <div className="pl-2">
                          <p className="font-bold">1. Pendapatan Asli Desa (PADesa) — 40%</p>
                          <p className="text-xxs text-slate-500 mt-0.5">Kontribusi BUMDes untuk pemeliharaan & kas pembangunan Desa.</p>
                        </div>
                        <span className="font-mono font-bold text-slate-850">{formatRupiah(alokasiPADesa)}</span>
                      </div>
                      <div className="flex justify-between p-3.5">
                        <div className="pl-2">
                          <p className="font-bold">2. Dana Cadangan Umum BUMDes — 30%</p>
                          <p className="text-xxs text-slate-500 mt-0.5">Disimpan sebagai jaminan keutuhan usaha operasional periode berikutnya.</p>
                        </div>
                        <span className="font-mono font-bold text-slate-850">{formatRupiah(alokasiCadangan)}</span>
                      </div>
                      <div className="flex justify-between p-3.5">
                        <div className="pl-2">
                          <p className="font-bold">3. Pembagian Jasa Direktur & Pengurus — 15%</p>
                          <p className="text-xxs text-slate-500 mt-0.5">Didistribusikan untuk operasional pegawai pelaksana BUMDes.</p>
                        </div>
                        <span className="font-mono font-bold text-slate-850">{formatRupiah(alokasiPengurus)}</span>
                      </div>
                      <div className="flex justify-between p-3.5">
                        <div className="pl-2">
                          <p className="font-bold">4. Jasa Anggota & Keikutsertaan Warga (Panen BUMDes) — 10%</p>
                          <p className="text-xxs text-slate-555 mt-0.5">Diberikan secara proporsional kepada penabung & pendukung unit.</p>
                        </div>
                        <span className="font-mono font-bold text-slate-850">{formatRupiah(alokasiBonusWarga)}</span>
                      </div>
                      <div className="flex justify-between p-3.5">
                        <div className="pl-2">
                          <p className="font-bold">5. Dana Sosial & CSR Desa — 5%</p>
                          <p className="text-xxs text-slate-500 mt-0.5">Digunakan untuk kegiatan kemanusiaan/bencana kemasyarakatan di Desa.</p>
                        </div>
                        <span className="font-mono font-bold text-slate-850">{formatRupiah(alokasiSosial)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures/Tanda Tangan */}
                <div className="pt-12 grid grid-cols-2 text-center text-xs font-sans text-slate-700 gap-8">
                  <div className="space-y-16">
                    <p>Mengetahui,<br /><strong className="text-slate-900">Kepala Desa Sukamaju</strong></p>
                    <div>
                      <p className="underline font-bold text-slate-850">{config.villageHead}</p>
                      <p className="text-slate-400 text-xxs">NIP. Perangkat Desa Sukamaju</p>
                    </div>
                  </div>
                  <div className="space-y-16">
                    <p>Disiapkan Oleh,<br /><strong className="text-slate-900">Direktur / Bendahara BUMDes</strong></p>
                    <div>
                      <p className="underline font-bold text-slate-850">{config.directorName}</p>
                      <p className="text-slate-400 text-xxs">Pengawas Keuangan BUMDes {config.bumdesName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Auditor & Advisor Tab */}
          {activeTab === "advisor" && (
            <div id="view_ai_advisor" className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 border border-slate-200 rounded-2xl">
                <h2 className="text-xl font-bold text-slate-900 font-display">Asisten Regulasi & Audit Keuangan BUMDes AI</h2>
                <p className="text-xs text-slate-500 mt-1">Gunakan kecerdasan buatan Gemini untuk mengevaluasi kepatuhan pembukuan terhadap Permendesa No 3 Tahun 2021.</p>
              </div>

              {/* Two Column Layout: Compliance Audit / Advisor Chat Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visualizer 1: Automatic Audit Compliance Analyzer */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 font-display">Laporan Penilaian Kepatuhan Regulasi</h3>
                        <p className="text-xxs text-slate-400">Tekan tombol di bawah untuk membuat telaah komparasi otomatis.</p>
                      </div>
                      <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                      </span>
                    </div>

                    {/* Output report markdown box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-80 max-h-120 overflow-y-auto text-xs leading-relaxed text-slate-700 font-sans space-y-3">
                      {isAuditLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                          <span className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></span>
                          <span className="text-xxs font-bold text-emerald-600 animate-pulse tracking-widest uppercase">Mengevaluasi Kepatuhan Regulasi...</span>
                        </div>
                      ) : aiAuditReport ? (
                        <div className="prose prose-sm prose-slate max-w-none">
                          {/* Simple Markdown Renderer for beautiful output */}
                          {aiAuditReport.split("\n").map((line, idx) => {
                            if (line.startsWith("### ")) {
                              return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-2">{line.replace("### ", "")}</h4>;
                            } else if (line.startsWith("## ")) {
                              return <h3 key={idx} className="text-base font-bold text-slate-950 mt-5 mb-3 border-b border-slate-200 pb-1">{line.replace("## ", "")}</h3>;
                            } else if (line.startsWith("# ")) {
                              return <h2 key={idx} className="text-lg font-extrabold text-slate-950 mt-6 mb-4">{line.replace("# ", "")}</h2>;
                            } else if (line.startsWith("- ") || line.startsWith("* ")) {
                              return <li key={idx} className="ml-4 list-disc mt-1 text-slate-705">{line.substring(2)}</li>;
                            } else if (line.trim() === "") {
                              return <div key={idx} className="h-2"></div>;
                            } else {
                              return <p key={idx} className="text-slate-650">{line}</p>;
                            }
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-slate-400">
                          <Info className="w-8 h-8 opacity-70" />
                          <p className="font-semibold text-xs">Belum Ada Hasil Evaluasi</p>
                          <p className="text-[10px] max-w-xs">Sistem akan mengompilasi data transaksi Kas, Tabungan, dan Kredit Anda untuk diaudit kecerdasan buatan.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateAuditReport}
                    disabled={isAuditLoading}
                    className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs font-display flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCcw className={`w-4 h-4 ${isAuditLoading ? "animate-spin" : ""}`} />
                    Jalankan Audit AI Berjalan (Real-time)
                  </button>
                </div>

                {/* Visualizer 2: Chat Advisor Platform */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-140">
                  <div className="flex flex-col h-full justify-between">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 font-display">Tanya Jawab Penasihat Konstitusi BUMDes</h3>
                        <p className="text-xxs text-slate-400">Konsultasikan kendala simpan pinjam & pembukuan Anda.</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Live</span>
                    </div>

                    {/* Chats Stream view */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3.5 px-1">
                      {aiChatHistory.map((item, id) => (
                        <div key={id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed shadow-xxs ${
                            item.role === "user" 
                              ? "bg-slate-900 text-white rounded-br-none" 
                              : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-150"
                          }`}>
                            <p className="font-medium whitespace-pre-wrap">{item.text}</p>
                          </div>
                        </div>
                      ))}
                      {isAiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-bl-none border border-slate-150 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Form message box */}
                    <form onSubmit={handleSendAiMessage} className="mt-2.5 flex gap-2 border-t border-slate-100 pt-3">
                      <input 
                        type="text" 
                        value={aiChatInput}
                        onChange={(e) => setAiChatInput(e.target.value)}
                        placeholder="Tanyakan regulasi, contoh: alokasi SHU cadangan..."
                        className="flex-1 bg-slate-50 border border-slate-200 pl-4 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      <button 
                        type="submit"
                        disabled={isAiLoading || !aiChatInput.trim()}
                        className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center disabled:bg-slate-200 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- ALL SYSTEM MODALS --- */}
      
      {/* 1. CONFIGURATION SYSTEM PARAMETERS MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Pengaturan Informasi & Parameter Utama BUMDes</span>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleUpdateConfig} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama BUMDes:</label>
                <input 
                  type="text" 
                  value={formConfig.bumdesName}
                  onChange={(e) => setFormConfig({ ...formConfig, bumdesName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Desa Pembina:</label>
                <input 
                  type="text" 
                  value={formConfig.villageName}
                  onChange={(e) => setFormConfig({ ...formConfig, villageName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kepala Desa:</label>
                  <input 
                    type="text" 
                    value={formConfig.villageHead}
                    onChange={(e) => setFormConfig({ ...formConfig, villageHead: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Direktur Utama:</label>
                  <input 
                    type="text" 
                    value={formConfig.directorName}
                    onChange={(e) => setFormConfig({ ...formConfig, directorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bendahara:</label>
                  <input 
                    type="text" 
                    value={formConfig.treasurerName}
                    onChange={(e) => setFormConfig({ ...formConfig, treasurerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bunga Jasa Simpan Pinjam (%):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formConfig.customInterestRate}
                    onChange={(e) => setFormConfig({ ...formConfig, customInterestRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Penyertaan Modal Anggaran Awal (Rp):</label>
                <input 
                  type="number" 
                  value={formConfig.initialCapitalAmount}
                  onChange={(e) => setFormConfig({ ...formConfig, initialCapitalAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Simpan Konfigurasi BUMDes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TAMBAH TRANSAKSI KAS MODAL */}
      {showAddCashModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Rekam Transaksi Baru (Ledger Kas)</span>
              <button onClick={() => setShowAddCashModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleAddCashTransaction} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tanggal Transaksi:</label>
                  <input 
                    type="date" 
                    value={formCash.date}
                    onChange={(e) => setFormCash({ ...formCash, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Aliran Arus Kas:</label>
                  <select 
                    value={formCash.type}
                    onChange={(e) => setFormCash({ ...formCash, type: e.target.value as "masuk" | "keluar" })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="masuk">Masuk (Debit)</option>
                    <option value="keluar">Keluar (Kredit)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Sektor Akun Kategori:</label>
                <select 
                  value={formCash.category}
                  onChange={(e) => setFormCash({ ...formCash, category: e.target.value as CashTransaction["category"] })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Pendapatan Unit Usaha">Pendapatan Unit Toko/Air Bersih</option>
                  <option value="Beban Gaji & Honor">Beban Honor Gaji Pegawai</option>
                  <option value="Beban Operasional">Beban Perlengkapan RT & ATK</option>
                  <option value="Modal Awal BUMDes">Tambahan Modal Desa</option>
                  <option value="Lain-lain">Lain-lain Luar Operasional</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Jumlah Nominal (Rupiah):</label>
                <input 
                  type="number" 
                  value={formCash.amount || ""}
                  onChange={(e) => setFormCash({ ...formCash, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  placeholder="Contoh: 1000000"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Keterangan Catatan:</label>
                <textarea 
                  value={formCash.description}
                  onChange={(e) => setFormCash({ ...formCash, description: e.target.value })}
                  placeholder="Tulis detail catatan operasional..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none h-16"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Posting Transaksi Ke Kas Umum
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. DAFTAR WARGA BARU MODAL */}
      {showAddCitizenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Registrasi Data Warga / Nasabah</span>
              <button onClick={() => setShowAddCitizenModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleAddCitizen} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Lengkap (Sesuai KTP):</label>
                <input 
                  type="text" 
                  value={formCitizen.name}
                  onChange={(e) => setFormCitizen({ ...formCitizen, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Contoh: Ahmad Subarjo"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nomor NIK (16 Digit):</label>
                <input 
                  type="text" 
                  maxLength={16}
                  value={formCitizen.nik}
                  onChange={(e) => setFormCitizen({ ...formCitizen, nik: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  placeholder="3204120000000000"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Telepon (Wa):</label>
                  <input 
                    type="text" 
                    value={formCitizen.phone}
                    onChange={(e) => setFormCitizen({ ...formCitizen, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">RT / RW Domisili:</label>
                  <input 
                    type="text" 
                    value={formCitizen.rtRw}
                    placeholder="RT 02 / RW 03"
                    onChange={(e) => setFormCitizen({ ...formCitizen, rtRw: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Alamat Dusun:</label>
                <input 
                  type="text" 
                  value={formCitizen.address}
                  onChange={(e) => setFormCitizen({ ...formCitizen, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Dusun Krajan Kidul No. 12"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Daftarkan Anggota Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MUTASI SIMPANAN MODAL */}
      {showSavingActionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Mutasi Sektor Simpanan Warga</span>
              <button onClick={() => setShowSavingActionModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleSavingAction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Warga Terdaftar:</label>
                <select 
                  value={formSavingAction.citizenId}
                  onChange={(e) => setFormSavingAction({ ...formSavingAction, citizenId: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Hubungkan dengan Warga --</option>
                  {citizens.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.nik})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Aksi Mutasi Syariah:</label>
                  <select 
                    value={formSavingAction.type}
                    onChange={(e) => setFormSavingAction({ ...formSavingAction, type: e.target.value as "setor" | "tarik" })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="setor">Setor Dana (+)</option>
                    <option value="tarik">Tarik Tunai (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Jenis Simpanan:</label>
                  <select 
                    value={formSavingAction.savingType}
                    onChange={(e) => setFormSavingAction({ ...formSavingAction, savingType: e.target.value as SavingAccount["savingType"] })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Sukarela">Sukarela</option>
                    <option value="Wajib">Wajib (Bulanan)</option>
                    <option value="Pokok">Pokok (Modal Awal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Nominal Rupiah:</label>
                <input 
                  type="number" 
                  value={formSavingAction.amount || ""}
                  onChange={(e) => setFormSavingAction({ ...formSavingAction, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  placeholder="Contoh: 500000"
                />
              </div>

              <div>
                <label className="block text-slate-555 font-bold mb-1">Catatan Tambahan:</label>
                <input 
                  type="text" 
                  value={formSavingAction.description}
                  onChange={(e) => setFormSavingAction({ ...formSavingAction, description: e.target.value })}
                  placeholder="Opsional, pembukaan kas tabungan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Proses & Rekam Mutasi Buku Pembantu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. PENCAIRAN PINJAMAN BARU MODAL */}
      {showNewLoanModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Penyaluran Kredit Simpan Pinjam Baru</span>
              <button onClick={() => setShowNewLoanModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleDisburseLoan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Warga Terdaftar (Calon Debitur):</label>
                <select 
                  value={formLoan.citizenId}
                  onChange={(e) => setFormLoan({ ...formLoan, citizenId: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Anggota Warga --</option>
                  {citizens.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.nik})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Besar Pokok Pinjaman (Rp):</label>
                  <input 
                    type="number" 
                    value={formLoan.amount || ""}
                    onChange={(e) => setFormLoan({ ...formLoan, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                    placeholder="Contoh: 10000000"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Jasa Admin (% per month):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formLoan.interestPercentage}
                    onChange={(e) => setFormLoan({ ...formLoan, interestPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Jangka Waktu Tenor (Bulan):</label>
                  <input 
                    type="number" 
                    value={formLoan.tenorMonths}
                    onChange={(e) => setFormLoan({ ...formLoan, tenorMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Periode Tagihan:</label>
                  <select 
                    value={formLoan.repaymentPeriod}
                    onChange={(e) => setFormLoan({ ...formLoan, repaymentPeriod: e.target.value as Loan["repaymentPeriod"] })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Mingguan">Mingguan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Cair Pinjaman:</label>
                <input 
                  type="date" 
                  value={formLoan.dateDisbursed}
                  onChange={(e) => setFormLoan({ ...formLoan, dateDisbursed: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-xxs text-slate-500 space-y-1">
                <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Kalkulator Simulasi Kredit:</p>
                <p>Cicilan Pokok Bulanan: <strong>{formatRupiah(Math.round(formLoan.amount / (formLoan.tenorMonths || 1)))}</strong></p>
                <p>Bunga Admin Jasa: <strong>{formatRupiah(Math.round(formLoan.amount * (formLoan.interestPercentage / 100)))}</strong></p>
                <p className="text-slate-800">Total Angsuran Bulanan: <strong>{formatRupiah(Math.round((formLoan.amount / (formLoan.tenorMonths || 1)) + (formLoan.amount * (formLoan.interestPercentage / 100))))}</strong></p>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Pencairan & Potong Kas BUMDes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. SETORAN ANGSURAN PINJAMAN MODAL */}
      {showRepaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xxs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-800 font-display flex justify-between items-center bg-slate-50">
              <span>Setor Angsuran Kredit Lapangan</span>
              <button onClick={() => setShowRepaymentModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleRepayLoan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Pilih Rekening Debitur Aktif:</label>
                <select 
                  value={formRepayment.loanId}
                  onChange={(e) => {
                    const lId = e.target.value;
                    const match = loans.find(l => l.id === lId);
                    if (match) {
                      const recommendedInterest = Math.round(match.amount * (match.interestPercentage / 100));
                      const recommendedPrincipal = Math.round(match.amount / match.tenorMonths);
                      setFormRepayment({
                        loanId: lId,
                        principalPaid: recommendedPrincipal,
                        interestPaid: recommendedInterest,
                        finePaid: 0,
                        description: `Setoran Angsuran Simpan Pinjam - ${match.citizenName}`
                      });
                    } else {
                      setFormRepayment({
                        loanId: "",
                        principalPaid: 0,
                        interestPaid: 0,
                        finePaid: 0,
                        description: ""
                      });
                    }
                  }}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Debitur --</option>
                  {loans
                    .filter(loan => loan.amountPaidPrincipal < loan.amount)
                    .map(l => (
                      <option key={l.id} value={l.id}>{l.citizenName} (Sisa Pokok: {formatRupiah(l.amount - l.amountPaidPrincipal)})</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pembayaran Pokok (Rp):</label>
                  <input 
                    type="number" 
                    value={formRepayment.principalPaid || ""}
                    onChange={(e) => setFormRepayment({ ...formRepayment, principalPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Setoran Jasa Admin (Rp):</label>
                  <input 
                    type="number" 
                    value={formRepayment.interestPaid || ""}
                    onChange={(e) => setFormRepayment({ ...formRepayment, interestPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Denda Keterlambatan (Denda Desa):</label>
                <input 
                  type="number" 
                  value={formRepayment.finePaid || ""}
                  onChange={(e) => setFormRepayment({ ...formRepayment, finePaid: Number(e.target.value) })}
                  placeholder="0 jika tepat waktu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Deskripsi Tambahan Pembayaran:</label>
                <input 
                  type="text" 
                  value={formRepayment.description}
                  onChange={(e) => setFormRepayment({ ...formRepayment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Keterangan setoran angsuran..."
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg text-xxs font-mono text-slate-550 flex justify-between leading-none">
                <span>Total Penerimaan Kas:</span>
                <strong className="text-slate-850">{formatRupiah(Number(formRepayment.principalPaid) + Number(formRepayment.interestPaid) + Number(formRepayment.finePaid))}</strong>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Kirim & Update Rekening Peminjam
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Minimalistic Custom vector SVGs
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
