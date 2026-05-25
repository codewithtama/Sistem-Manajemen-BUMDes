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

export const initialCitizens: Citizen[] = [];

export const initialSavingAccounts: SavingAccount[] = [];

export const initialSavingTransactions: SavingTransaction[] = [];

export const initialLoans: Loan[] = [];

export const initialLoanRepayments: LoanRepayment[] = [];

export const initialCashTransactions: CashTransaction[] = [
  {
    id: "tx-1",
    date: "2026-01-02",
    type: "masuk",
    category: "Modal Awal BUMDes",
    amount: 150000000, // Rp 150.000.000,- penyertaan modal desa awal
    description: "Penerimaan modal awal dari Anggaran Pendapatan Belanja Desa (APBDes)",
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
