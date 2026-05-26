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

// Pure-JS synchronous SHA-256 Cryptographic Hash algorithm
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;

  const hash: number[] = [];
  const k: number[] = [];
  const primeCounter = 2;
  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };
  let candidate = 2;
  while (hash[lengthProperty] < 8) {
    if (isPrime(candidate)) {
      hash.push((mathPow(candidate, 1 / 2) * maxWord) | 0);
      k.push((mathPow(candidate, 1 / 3) * maxWord) | 0);
    }
    candidate++;
  }
  while (k[lengthProperty] < 64) {
    if (isPrime(candidate)) {
      k.push((mathPow(candidate, 1 / 3) * maxWord) | 0);
    }
    candidate++;
  }

  const words: number[] = [];
  const asciiLength = ascii[lengthProperty];
  const wordsLength = ((asciiLength + 8) >> 6) + 1;
  const maxWords = wordsLength * 16;
  for (i = 0; i < maxWords; i++) words[i] = 0;
  for (i = 0; i < asciiLength; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
  words[maxWords - 1] = asciiLength * 8;

  for (i = 0; i < maxWords; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);
    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const w15 = w[j - 15], w2 = w[j - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const a = hash[0], e = hash[4];
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;
      const temp2 = (s0 + maj) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (j = 0; j < 8; j++) hash[j] = (hash[j] + oldHash[j]) | 0;
  }

  let result = '';
  for (i = 0; i < 8; i++) {
    const word = hash[i];
    const hex = (word >>> 0).toString(16);
    result += ('00000000' + hex).slice(-8);
  }
  return result;
}

// Symmetric XOR + Base64 Cipher for securing exported JSON backups
export function encryptData(payload: string, key: string): string {
  if (!key) key = "bumdes_secure_key";
  const utf8String = encodeURIComponent(payload);
  let xorResult = "";
  for (let i = 0; i < utf8String.length; i++) {
    const payloadChar = utf8String.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    xorResult += String.fromCharCode(payloadChar ^ keyChar);
  }
  return btoa(xorResult);
}

export function decryptData(payload: string, key: string): string {
  if (!key) key = "bumdes_secure_key";
  const xorString = atob(payload);
  let decryptedUtf8 = "";
  for (let i = 0; i < xorString.length; i++) {
    const payloadChar = xorString.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    decryptedUtf8 += String.fromCharCode(payloadChar ^ keyChar);
  }
  return decodeURIComponent(decryptedUtf8);
}

// Cryptographic Ledger Hash Chaining calculation helper
export function computeTransactionHash(tx: CashTransaction, prevHash: string): string {
  const content = `${tx.date}|${tx.type}|${tx.category}|${tx.amount}|${tx.description}|${tx.referenceId || ""}|${prevHash}`;
  return sha256(content);
}

