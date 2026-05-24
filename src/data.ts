import { Citizen, CashTransaction, SavingAccount, SavingTransaction, Loan, LoanRepayment, BUMDesConfig } from "./types";

export const initialBUMDesConfig: BUMDesConfig = {
  villageName: "Desa Sukamaju",
  villageHead: "Bapak H. Mulyono",
  bumdesName: "BUMDes Karya Bersama",
  directorName: "Bapak Hermawan, S.E.",
  treasurerName: "Ibu Lilis Suryani",
  initialCapitalDate: "2026-01-02",
  initialCapitalAmount: 150000000, // Rp 150.000.000,- penyertaan modal desa awal
  customInterestRate: 1, // 1% jasa administratif per bulan sesuai mufakat
  finePercentagePerDay: 0.1, // 0.1% dari sisa pokok per hari keterlambatan
};

export const initialCitizens: Citizen[] = [
  {
    id: "cit-1",
    name: "Ahmad Subarjo",
    nik: "3204120804750001",
    phone: "081234567890",
    rtRw: "RT 02 / RW 01",
    address: "Jl. Lapangan Desa No. 12",
    joinedAt: "2026-01-10",
  },
  {
    id: "cit-2",
    name: "Siti Aminah",
    nik: "3204124912800003",
    phone: "085712345678",
    rtRw: "RT 03 / RW 01",
    address: "Gang Mawar Samping Masjid Al-Huda",
    joinedAt: "2026-01-12",
  },
  {
    id: "cit-3",
    name: "Joko Widodo Susilo",
    nik: "3204122303830002",
    phone: "081998765432",
    rtRw: "RT 01 / RW 02",
    address: "Dusun Krajan Lor No. 44",
    joinedAt: "2026-01-15",
  },
  {
    id: "cit-4",
    name: "Sri Rahayu",
    nik: "3204121510880001",
    phone: "082111223344",
    rtRw: "RT 02 / RW 02",
    address: "Dusun Krajan Kidul No. 05",
    joinedAt: "2026-01-20",
  },
  {
    id: "cit-5",
    name: "Budi Santoso",
    nik: "3204121107770004",
    phone: "081344556677",
    rtRw: "RT 01 / RW 03",
    address: "Perbatasan Desa Sukamaju Rt 1",
    joinedAt: "2026-02-05",
  },
  {
    id: "cit-6",
    name: "Agus Riyadi",
    nik: "3204120108900005",
    phone: "087788990011",
    rtRw: "RT 02 / RW 03",
    address: "Dusun Sawah Baru No. 1B",
    joinedAt: "2026-03-01",
  }
];

export const initialSavingAccounts: SavingAccount[] = [
  {
    id: "sa-1",
    citizenId: "cit-1",
    citizenName: "Ahmad Subarjo",
    savingType: "Sukarela",
    balance: 4500000,
    lastUpdated: "2026-05-10",
  },
  {
    id: "sa-2",
    citizenId: "cit-2",
    citizenName: "Siti Aminah",
    savingType: "Sukarela",
    balance: 7500000,
    lastUpdated: "2026-05-18",
  },
  {
    id: "sa-3",
    citizenId: "cit-3",
    citizenName: "Joko Widodo Susilo",
    savingType: "Wajib",
    balance: 1500000,
    lastUpdated: "2026-04-20",
  },
  {
    id: "sa-4",
    citizenId: "cit-4",
    citizenName: "Sri Rahayu",
    savingType: "Sukarela",
    balance: 3200000,
    lastUpdated: "2026-05-22",
  }
];

export const initialSavingTransactions: SavingTransaction[] = [
  {
    id: "st-1",
    savingAccountId: "sa-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-01-10",
    type: "setor",
    amount: 5000000,
    description: "Tabungan sukarela pembukaan rekening",
  },
  {
    id: "st-2",
    savingAccountId: "sa-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-04-12",
    type: "tarik",
    amount: 500000,
    description: "Tarik tunai keperluan bibit jagung",
  },
  {
    id: "st-3",
    savingAccountId: "sa-2",
    citizenName: "Siti Aminah",
    date: "2026-01-12",
    type: "setor",
    amount: 6000000,
    description: "Setoran tabungan sukarela awal",
  },
  {
    id: "st-4",
    savingAccountId: "sa-2",
    citizenName: "Siti Aminah",
    date: "2026-03-15",
    type: "setor",
    amount: 1500000,
    description: "Setoran tambahan dari hasil panen sayurnya",
  },
  {
    id: "st-5",
    savingAccountId: "sa-3",
    citizenName: "Joko Widodo Susilo",
    date: "2026-01-15",
    type: "setor",
    amount: 1500000,
    description: "Simpanan wajib pengurus/anggota awal",
  },
  {
    id: "st-6",
    savingAccountId: "sa-4",
    citizenName: "Sri Rahayu",
    date: "2026-01-20",
    type: "setor",
    amount: 3200000,
    description: "Tabungan sukarela awal",
  }
];

export const initialLoans: Loan[] = [
  {
    id: "loan-1",
    citizenId: "cit-1",
    citizenName: "Ahmad Subarjo",
    amount: 10000000,
    interestPercentage: 1.0,
    tenorMonths: 10,
    repaymentPeriod: "Bulanan",
    dateDisbursed: "2026-01-15",
    dueDate: "2026-11-15",
    status: "Lancar",
    amountPaidPrincipal: 4000000,
    amountPaidInterest: 400000,
  },
  {
    id: "loan-2",
    citizenId: "cit-3",
    citizenName: "Joko Widodo Susilo",
    amount: 15000000,
    interestPercentage: 1.2,
    tenorMonths: 12,
    repaymentPeriod: "Bulanan",
    dateDisbursed: "2026-01-20",
    dueDate: "2027-01-20",
    status: "Lancar",
    amountPaidPrincipal: 5000000,
    amountPaidInterest: 720000,
  },
  {
    id: "loan-3",
    citizenId: "cit-5",
    citizenName: "Budi Santoso",
    amount: 5000000,
    interestPercentage: 1.0,
    tenorMonths: 6,
    repaymentPeriod: "Bulanan",
    dateDisbursed: "2026-02-10",
    dueDate: "2026-08-10",
    status: "Macet",
    amountPaidPrincipal: 833333,
    amountPaidInterest: 50000,
  }
];

export const initialLoanRepayments: LoanRepayment[] = [
  {
    id: "lr-1",
    loanId: "loan-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-02-15",
    principalPaid: 1000000,
    interestPaid: 100000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-1 (Lancar)",
  },
  {
    id: "lr-2",
    loanId: "loan-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-03-15",
    principalPaid: 1000000,
    interestPaid: 100000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-2 (Lancar)",
  },
  {
    id: "lr-3",
    loanId: "loan-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-04-15",
    principalPaid: 1000000,
    interestPaid: 100000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-3 (Lancar)",
  },
  {
    id: "lr-4",
    loanId: "loan-1",
    citizenName: "Ahmad Subarjo",
    date: "2026-05-15",
    principalPaid: 1000000,
    interestPaid: 100000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-4 (Lancar)",
  },
  {
    id: "lr-5",
    loanId: "loan-2",
    citizenName: "Joko Widodo Susilo",
    date: "2026-02-20",
    principalPaid: 1250000,
    interestPaid: 180000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-1 (Lancar)",
  },
  {
    id: "lr-6",
    loanId: "loan-2",
    citizenName: "Joko Widodo Susilo",
    date: "2026-03-20",
    principalPaid: 1250000,
    interestPaid: 180000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-2 (Lancar)",
  },
  {
    id: "lr-7",
    loanId: "loan-2",
    citizenName: "Joko Widodo Susilo",
    date: "2026-04-20",
    principalPaid: 1250000,
    interestPaid: 180000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-3 (Lancar)",
  },
  {
    id: "lr-8",
    loanId: "loan-2",
    citizenName: "Joko Widodo Susilo",
    date: "2026-05-20",
    principalPaid: 1250000,
    interestPaid: 180000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-4 (Lancar)",
  },
  {
    id: "lr-9",
    loanId: "loan-3",
    citizenName: "Budi Santoso",
    date: "2026-03-10",
    principalPaid: 833333,
    interestPaid: 50000,
    finePaid: 0,
    description: "Pembayaran Angsuran ke-1 (Mulai menunggak setelah ini)",
  }
];

export const initialCashTransactions: CashTransaction[] = [
  {
    id: "tx-1",
    date: "2026-01-02",
    type: "masuk",
    category: "Modal Awal BUMDes",
    amount: 150000000,
    description: "Penerimaan modal awal dari Anggaran Pendapatan Belanja Desa (APBDes)",
  },
  {
    id: "tx-2",
    date: "2026-01-10",
    type: "masuk",
    category: "Simpanan Warga",
    amount: 5000000,
    description: "Setoran tabungan sukarela awal - Rek. Ahmad Subarjo",
    referenceId: "cit-1",
  },
  {
    id: "tx-3",
    date: "2026-01-12",
    type: "masuk",
    category: "Simpanan Warga",
    amount: 6000000,
    description: "Setoran tabungan sukarela awal - Rek. Siti Aminah",
    referenceId: "cit-2",
  },
  {
    id: "tx-4",
    date: "2026-01-15",
    type: "masuk",
    category: "Simpanan Warga",
    amount: 1500000,
    description: "Simpanan wajib awal pengurus - Joko Widodo Susilo",
    referenceId: "cit-3",
  },
  {
    id: "tx-5",
    date: "2026-01-15",
    type: "keluar",
    category: "Disbursement Pinjaman",
    amount: 10000000,
    description: "Penyaluran pinjaman modal pertanian - Ahmad Subarjo (Tenor 10 bln)",
    referenceId: "loan-1",
  },
  {
    id: "tx-6",
    date: "2026-01-20",
    type: "masuk",
    category: "Simpanan Warga",
    amount: 3200000,
    description: "Setoran tabungan sukarela awal - Sri Rahayu",
    referenceId: "cit-4",
  },
  {
    id: "tx-7",
    date: "2026-01-20",
    type: "keluar",
    category: "Disbursement Pinjaman",
    amount: 15000000,
    description: "Penyaluran pinjaman usaha perdagangan toko kelontong - Joko Widodo Susilo (Tenor 12 bln)",
    referenceId: "loan-2",
  },
  {
    id: "tx-8",
    date: "2026-02-10",
    type: "keluar",
    category: "Disbursement Pinjaman",
    amount: 5000000,
    description: "Penyaluran pinjaman peternakan bebek - Budi Santoso (Tenor 6 bln)",
    referenceId: "loan-3",
  },
  {
    id: "tx-9",
    date: "2026-02-15",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1100000,
    description: "Setoran Angsuran 1 Pinjaman - Ahmad Subarjo",
    referenceId: "lr-1",
  },
  {
    id: "tx-10",
    date: "2026-02-20",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1430000,
    description: "Setoran Angsuran 1 Pinjaman - Joko Widodo Susilo",
    referenceId: "lr-5",
  },
  {
    id: "tx-11",
    date: "2026-03-01",
    type: "keluar",
    category: "Beban Gaji & Honor",
    amount: 2500000,
    description: "Gaji & honor bulanan pengurus BUMDes Karya Bersama (Maret 2026)",
  },
  {
    id: "tx-12",
    date: "2026-03-10",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 883333,
    description: "Setoran Angsuran 1 Pinjaman - Budi Santoso",
    referenceId: "lr-9",
  },
  {
    id: "tx-13",
    date: "2026-03-15",
    type: "masuk",
    category: "Simpanan Warga",
    amount: 1500000,
    description: "Setoran tabungan sukarela tambahan - Rek. Siti Aminah",
    referenceId: "cit-2",
  },
  {
    id: "tx-14",
    date: "2026-03-15",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1100000,
    description: "Setoran Angsuran 2 Pinjaman - Ahmad Subarjo",
    referenceId: "lr-2",
  },
  {
    id: "tx-15",
    date: "2026-03-20",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1430000,
    description: "Setoran Angsuran 2 Pinjaman - Joko Widodo Susilo",
    referenceId: "lr-6",
  },
  {
    id: "tx-16",
    date: "2026-04-01",
    type: "keluar",
    category: "Beban Gaji & Honor",
    amount: 2500000,
    description: "Gaji & honor bulanan pengurus BUMDes Karya Bersama (April 2026)",
  },
  {
    id: "tx-17",
    date: "2026-04-12",
    type: "keluar",
    category: "Withdrawal Simpanan",
    amount: 500000,
    description: "Penarikan sebagian tabungan sukarela - Ahmad Subarjo",
    referenceId: "cit-1",
  },
  {
    id: "tx-18",
    date: "2026-04-15",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1100000,
    description: "Setoran Angsuran 3 Pinjaman - Ahmad Subarjo",
    referenceId: "lr-3",
  },
  {
    id: "tx-19",
    date: "2026-04-20",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1430000,
    description: "Setoran Angsuran 3 Pinjaman - Joko Widodo Susilo",
    referenceId: "lr-7",
  },
  {
    id: "tx-20",
    date: "2026-05-01",
    type: "keluar",
    category: "Beban Gaji & Honor",
    amount: 2500000,
    description: "Gaji & honor bulanan pengurus BUMDes Karya Bersama (Mei 2026)",
  },
  {
    id: "tx-21",
    date: "2026-05-05",
    type: "keluar",
    category: "Beban Operasional",
    amount: 850000,
    description: "Pembelian ATK dan cetak formulir pengajuan simpan pinjam",
  },
  {
    id: "tx-22",
    date: "2026-05-10",
    type: "masuk",
    category: "Pendapatan Unit Usaha",
    amount: 4350000,
    description: "Penerimaan bagi hasil Unit Toko Desa & Air Bersih (Periode April 2026)",
  },
  {
    id: "tx-23",
    date: "2026-05-15",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1100000,
    description: "Setoran Angsuran 4 Pinjaman - Ahmad Subarjo",
    referenceId: "lr-4",
  },
  {
    id: "tx-24",
    date: "2026-05-20",
    type: "masuk",
    category: "Repayment Pinjaman",
    amount: 1430000,
    description: "Setoran Angsuran 4 Pinjaman - Joko Widodo Susilo",
    referenceId: "lr-8",
  }
];

// Indonesian standard styling currency formatter
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// CSV Export Utility
export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.join(","),
    ...rows.map(row =>
      row.map(val => {
        const strVal = String(val === null || val === undefined ? "" : val).replace(/"/g, '""');
        return strVal.includes(",") || strVal.includes("\n") || strVal.includes('"')
          ? `"${strVal}"`
          : strVal;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Computes loan collectability status automatically based on due date.
 * Follows Bank Indonesia / OJK NPL classification:
 * - Lancar       : not yet overdue or < 30 days overdue
 * - Kurang Lancar: 31–90 days overdue
 * - Diragukan    : 91–180 days overdue
 * - Macet        : > 180 days overdue (or fully paid → stays Lancar)
 */
export const computeLoanStatus = (
  dueDate: string,
  amountPaidPrincipal: number,
  totalPrincipal: number
): "Lancar" | "Kurang Lancar" | "Diragukan" | "Macet" => {
  if (amountPaidPrincipal >= totalPrincipal) return "Lancar";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - due.getTime();
  const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 30) return "Lancar";
  if (daysOverdue <= 90) return "Kurang Lancar";
  if (daysOverdue <= 180) return "Diragukan";
  return "Macet";
};

// Backup: export all app data as a downloadable JSON file
export const exportToJSON = (data: object, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
