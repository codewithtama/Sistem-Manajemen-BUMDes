export interface CashTransaction {
  id: string;
  date: string;
  type: "masuk" | "keluar";
  category: "Simpanan Warga" | "Repayment Pinjaman" | "Disbursement Pinjaman" | "Withdrawal Simpanan" | "Pendapatan Unit Usaha" | "Beban Gaji & Honor" | "Beban Operasional" | "Modal Awal BUMDes" | "Lain-lain";
  amount: number;
  description: string;
  referenceId?: string; // Links to citizens, savings, or loans
  hash?: string; // Cryptographic hash for ledger integrity chaining
}

export interface Citizen {
  id: string;
  name: string;
  nik: string;
  phone: string;
  rtRw: string;
  address: string;
  joinedAt: string;
}

export interface SavingAccount {
  id: string;
  citizenId: string;
  citizenName: string;
  savingType: "Sukarela" | "Wajib" | "Pokok";
  balance: number;
  lastUpdated: string;
}

export interface SavingTransaction {
  id: string;
  savingAccountId: string;
  citizenName: string;
  date: string;
  type: "setor" | "tarik";
  amount: number;
  description: string;
}

export interface Loan {
  id: string;
  citizenId: string;
  citizenName: string;
  amount: number; // Principal
  interestPercentage: number; // Jasa BUMDes per tenor month (e.g. 1% per month)
  tenorMonths: number;
  repaymentPeriod: "Bulanan" | "Mingguan";
  dateDisbursed: string;
  dueDate: string;
  status: "Lancar" | "Kurang Lancar" | "Diragukan" | "Macet";
  amountPaidPrincipal: number;
  amountPaidInterest: number;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  citizenName: string;
  date: string;
  principalPaid: number;
  interestPaid: number;
  finePaid: number;
  description: string;
}

export interface BUMDesConfig {
  villageName: string;
  villageHead: string;
  bumdesName: string;
  directorName: string;
  treasurerName: string;
  initialCapitalDate: string;
  initialCapitalAmount: number;
  customInterestRate: number; // Default interest rate for official credits
  finePercentagePerDay: number; // Late payment fine: % of outstanding principal per day overdue
  geminiApiKey?: string; // Custom API key for Gemini AI assistant
  adminPassword?: string; // Admin password (default: admin123)
  targetShu?: number; // Target annual net profit (SHU)
  targetPades?: number; // Target annual village contribution (PADesa)
}

