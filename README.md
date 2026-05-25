# SIM-BUMDes (Sistem Informasi Manajemen BUMDes)
Sistem Informasi Manajemen Keuangan, Simpan Pinjam, dan Pelaporan Pertanggungjawaban (LPJ) Badan Usaha Milik Desa (BUMDes) yang dirancang secara kokoh, andal, dan siap tempur (*production-ready*). Sistem ini diselaraskan dengan standar administrasi, tata kelola, dan regulasi **Peraturan Menteri Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi (Permendesa PDTT) No. 3 Tahun 2021** tentang Pendaftaran, Pendataan dan Pemeringkatan, Pembinaan dan Pengembangan, serta Pengadaan Barang dan/atau Jasa BUMDes/BUMDes Bersama.

Aplikasi ini beroperasi secara penuh **tanpa unsur simulatif/dummy**. Seluruh pencatatan kas umum, penyaluran kredit mufakat, tabungan warga, hingga lembar penagihan angsuran bersifat riil, mengikat secara akuntansi berpasangan, dan teruji mutlak secara matematis.

---

## 🌟 Fitur Utama & Keunggulan Premium

### 1. Dashboard Visual Analytics Premium (Pure SVG & HSL)
*   **Tren Arus Kas Dinamis (Line Chart)**: Grafik garis penerimaan vs pengeluaran bulanan yang interaktif dengan area gradasi bercahaya (*glowing area under curve*) berbasis SVG responsif berkecepatan tinggi tanpa dependensi pustaka chart eksternal.
*   **Analisis Kontribusi Sektor (Donut Chart)**: Grafik lingkaran proporsional pembagian pendapatan bersih per unit usaha (Pamsimas/Air Bersih, Toko Desa, Sewa Alat Tani, Sampah Lingkungan) dengan indikator persentase HSL yang elegan.
*   **Visual Health & Liquidity Gauges**: KPI Cards untuk rasio kredit macet (**NPL**) dan **Likuiditas** dibekali *mini horizontal stacked bar* untuk melacak tingkat kesehatan kas secara instan.

### 2. Buku Kas Umum (BKU) Terintegrasi & Jurnal Ganda
*   **Pencatatan Ganda Berkorelasi**: Setiap mutasi dana simpanan, penarikan dana, penyaluran kredit baru, maupun pembayaran angsuran terfase otomatis ke dalam jurnal debit/kredit Buku Kas Umum.
*   **Audit Laporan dengan Koreksi Mutasi Balik**: Algoritma kalkulasi kas yang kokoh menyaring arah arus kas penyesuaian secara otomatis (`t.type === "keluar" ? t.amount : -t.amount` untuk beban, dan `t.type === "masuk" ? t.amount : -t.amount` untuk pendapatan unit) demi keabsahan nilai Buku Besar.
*   **Garansi Penghapusan Berjenjang (*Cascade Cleanup*)**: Menghapus data debitur/warga secara otomatis menyapu bersih seluruh mutasi kas, sub-ledger tabungan, dan kuitansi cicilan terkait guna mencegah kebocoran data yatim (*orphan records*).

### 3. Unit Tabungan & Simpanan Warga Terproteksi
*   **Klasifikasi Koperasi Resmi**: Mendukung jenis tabungan warga terstruktur: **Simpanan Pokok**, **Simpanan Wajib**, dan **Simpanan Sukarela**.
*   **Sistem Proteksi Kas Utama**: Menghalangi penarikan tabungan yang melampaui sisa saldo rekening warga maupun total ketersediaan dana kas likuid BUMDes, mencegah terjadinya selisih neraca kasir dan *bank run* lokal.

### 4. Unit Simpan Pinjam & Penilaian Kolektibilitas OJK (NPL)
*   **Dynamic Overdue Tracker**: Sistem melacak selisih tanggal jatuh tempo terhadap tanggal berjalan secara riil untuk mengalkulasi sisa hari keterlambatan (`daysOverdue`) secara presisi.
*   **OJK Collectability Badges**: Debitur dikelompokkan secara akurat ke dalam status kolektibilitas standar perbankan/OJK:
    *   **Kolektibilitas 1 (Lancar)**: Keterlambatan $\le 30$ hari.
    *   **Kolektibilitas 2 (Dalam Perhatian Khusus - DPK)**: Keterlambatan $31 - 90$ hari.
    *   **Kolektibilitas 3 (Kurang Lancar)**: Keterlambatan $91 - 180$ hari.
    *   **Kolektibilitas 4 (Diragukan)**: Keterlambatan $181 - 360$ hari.
    *   **Kolektibilitas 5 (Macet)**: Keterlambatan $> 360$ hari.
*   **Kalkulator Denda Terintegrasi**: Perhitungan denda harian dinamis terotomatisasi berdasarkan persentase parameter keterlambatan dari sisa pokok pinjaman berjalan.

### 5. Laporan Keuangan Neraca Posisi Keuangan & Ekspor LPJ Dinas
*   **Laporan Neraca Ganda Seimbang (*Balanced*)**: Menyajikan tabel Neraca Kiri (**Aktiva**: Kas Likuid + Piutang Aktif) yang bersanding seimbang dengan Neraca Kanan (**Pasiva**: Simpanan Warga + Modal Awal BUMDes + Sisa Hasil Usaha/SHU Ditahan).
*   **Ekspor BKU Dinas (CSV/Excel)**: Menyediakan tombol satu-klik untuk mengunduh seluruh transaksi kas umum terformat rapi untuk diserahkan ke Dinas Pemberdayaan Masyarakat Desa (PMD).
*   **Layout Ramah Cetak (LPJ Tab)**: Dioptimalkan dengan CSS media print (`Ctrl+P`) untuk menghasilkan laporan fisik pertanggungjawaban BUMDes yang bersih tanpa elemen UI web, dilengkapi QR Code e-Signature verifikasi Musyawarah Desa (Musdes).

### 6. Asisten Regulasi & Audit Kepatuhan Berbasis AI (Gemini)
*   **Audit Kepatuhan Instan**: Mengirimkan data pembukuan kas serta portofolio pinjaman berjalan ke model Gemini untuk menganalisis risiko, likuiditas, kategori kesehatan NPL, serta memproduksi Catatan Atas Laporan Keuangan (CALK) ringkas secara objektif.
*   **Konsultasi Interaktif**: Menyediakan ruang diskusi hukum/akuntansi desa interaktif terpandu Permendesa No 3 Tahun 2021 secara dinamis.

### 7. Toast Notification & Sistem Umpan Balik Modern
*   **Slide-in Glassmorphic Toast**: Dialog `alert()` bawaan browser yang kaku telah digantikan oleh sistem notifikasi mengambang yang halus dengan ikon Lucide penanda sukses (emerald), peringatan (amber), eror (rose), dan info (slate).

### 8. Tombol "Go-Live" Pembersih Data
*   **One-Click Clean Database**: Menyediakan tombol pembersihan data dummy untuk menghapus seluruh data contoh di browser `localStorage` dan mereset sistem ke pembukuan murni desa, siap digunakan untuk pencatatan riil warga.

---

## 🗂️ Struktur Direktori Proyek

```
Sistem-Manajemen-BUMDes/
├── .env.example              # Template variabel lingkungan untuk konfigurasi API
├── .gitignore                # Daftar berkas yang diabaikan oleh Git
├── index.html                # Entry point HTML aplikasi web
├── package.json              # Definisi dependensi dan skrip manajemen proyek
├── server.ts                 # Server backend Express (Proxy API Gemini & Static Server)
├── tsconfig.json             # Konfigurasi transpiler TypeScript
├── vite.config.ts            # Konfigurasi build tool Vite + Tailwind CSS v4
├── src/
│   ├── main.tsx              # Bootstrapper React & Rendering DOM
│   ├── App.tsx               # Cangkang aplikasi utama, layout, & sistem Toast
│   ├── index.css             # Desain token, Google Fonts, animasi, & CSS Media Print
│   ├── types.ts              # Kontrak tipe data & interface TypeScript untuk pembukuan
│   ├── data.ts               # Konfigurasi default BUMDes, pemformatan rupiah, & utilitas ekspor
│   ├── hooks/
│   │   └── useBumdesState.ts # Core State Engine (Operasi Ledger, CRUD, & Sinkronisasi LocalStorage)
│   ├── components/
│   │   ├── DashboardOverview.tsx # Grafik visual analitik (SVG) & panel indikator kesehatan
│   │   ├── Header.tsx            # Header atas & panel metadata nama desa/pengurus
│   │   ├── Sidebar.tsx           # Navigasi panel samping yang responsif
│   │   └── Modals.tsx            # Modul formulir input (Warga, Tabungan, Pinjaman, Config & Go-Live)
│   └── views/
│       ├── WargaView.tsx         # Manajemen pendaftaran kependudukan warga desa
│       ├── SimpananView.tsx      # Manajemen setoran/penarikan tabungan warga
│       ├── PinjamanView.tsx      # Penyaluran pinjaman, angsuran, & tracker OJK NPL
│       ├── BukuKasView.tsx       # Jurnal Buku Kas Umum riil & tombol input kas manual
│       ├── LaporanView.tsx       # Laporan Neraca Keuangan seimbang & Ekspor Dinas CSV
│       └── AdvisorView.tsx       # Integrasi Asisten Akuntansi AI (Gemini) & CALK Generator
```

---

## 📊 Referensi Skema Data Keuangan (TypeScript)

Aplikasi ini dibangun di atas pondasi tipe data yang sangat ketat untuk menjamin konsistensi audit keuangan desa.

### 1. Buku Kas Umum (CashTransaction)
Mencatat seluruh arus kas masuk dan kas keluar BUMDes secara kronologis.
```typescript
export interface CashTransaction {
  id: string;
  date: string;
  type: "masuk" | "keluar";
  category: 
    | "Simpanan Warga" 
    | "Repayment Pinjaman" 
    | "Disbursement Pinjaman" 
    | "Withdrawal Simpanan" 
    | "Pendapatan Unit Usaha" 
    | "Beban Gaji & Honor" 
    | "Beban Operasional" 
    | "Modal Awal BUMDes" 
    | "Lain-lain";
  amount: number;
  description: string;
  referenceId?: string; // Menghubungkan transaksi ke ID warga, tabungan, atau pinjaman terkait
}
```

### 2. Buku Pembantu Simpanan Warga (SavingAccount)
Melacak kepemilikan tabungan per warga desa dengan klasifikasi koperasi.
```typescript
export interface SavingAccount {
  id: string;
  citizenId: string;
  citizenName: string;
  savingType: "Sukarela" | "Wajib" | "Pokok";
  balance: number;
  lastUpdated: string;
}
```

### 3. Buku Pembantu Kredit/Pinjaman (Loan)
Melacak portofolio kredit simpan pinjam warga secara akurat dengan status kolektibilitas OJK.
```typescript
export interface Loan {
  id: string;
  citizenId: string;
  citizenName: string;
  amount: number;               // Sisa Pokok Pinjaman Awal
  interestPercentage: number;   // Jasa administratif BUMDes per bulan (misal 1%)
  tenorMonths: number;          // Durasi pinjaman dalam bulan
  repaymentPeriod: "Bulanan" | "Mingguan";
  dateDisbursed: string;
  dueDate: string;
  status: "Lancar" | "Kurang Lancar" | "Diragukan" | "Macet";
  amountPaidPrincipal: number;  // Akumulasi cicilan pokok yang telah dibayar
  amountPaidInterest: number;   // Akumulasi bunga/jasa administratif yang telah dibayar
}
```

---

## 🧮 Persamaan Akuntansi Berpasangan BUMDes
Seluruh mutasi kas di dalam aplikasi diverifikasi secara real-time berdasarkan hukum dasar akuntansi double-entry:

$$\text{Aktiva} = \text{Pasiva}$$

$$\text{Kas Likuid BUMDes} + \text{Sisa Piutang Aktif} = \text{Total Simpanan Warga} + \text{Modal Awal Desa} + \text{Sisa Hasil Usaha (SHU) Ditahan}$$

Di mana:
1.  **Kas Likuid**: Total penerimaan kas dikurangi total pengeluaran kas di dalam Buku Kas Umum.
2.  **Sisa Piutang Aktif**: Total nilai pokok pinjaman yang telah disalurkan dikurangi total pengembalian pokok yang telah diterima.
3.  **Total Simpanan Warga**: Akumulasi seluruh setoran simpanan pokok, wajib, dan sukarela warga dikurangi penarikan dana berjalan.
4.  **Sisa Hasil Usaha (SHU)**: Bersumber dari laba unit usaha (pendapatan dikurangi beban operasional) ditambah pendapatan denda dan bunga simpan pinjam warga yang telah dibukukan.

Jika persamaan di atas seimbang, indikator **"Status Neraca: SEIMBANG (BALANCED)"** berwarna emerald akan aktif di tab Laporan Neraca Keuangan.

---

## 🛠️ Panduan Instalasi & Pengembangan Lokal

### Prasyarat Sistem
*   Node.js versi 22.0.0 atau yang lebih baru.
*   NPM versi 10.0.0 atau yang lebih baru.

### 1. Kloning Repositori
```bash
git clone https://github.com/codewithtama/Sistem-Manajemen-BUMDes.git
cd Sistem-Manajemen-BUMDes
```

### 2. Instalasi Dependensi
Aplikasi ini menggunakan modul modern berkecepatan tinggi seperti `@google/genai` untuk AI, `@tailwindcss/vite` untuk CSS engine v4, dan `motion` untuk animasi premium.
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env` di root direktori proyek:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan kunci API Gemini dari Google AI Studio:
```env
# Google Gemini API Key dari Google AI Studio (Wajib untuk tab Konsultasi & Audit AI)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Opsional: Alamat server lokal jika diubah
APP_URL="http://localhost:3000"
```

### 4. Menjalankan Server Pengembangan (Development Mode)
Jalankan server pengembangan berbasis `tsx` (TypeScript Executor) yang secara otomatis mendukung hot-reload pada file frontend dan backend Express secara bersamaan:
```bash
npm run dev
```
Buka peramban (browser) Anda dan akses alamat **`http://localhost:3000`**.

### 5. Kompilasi & Menjalankan Versi Produksi (Production Build)
Untuk membangun bundel aplikasi yang dioptimasi secara penuh (minified, code-splitted, dan cepat):
```bash
# Melakukan build kompilasi frontend via Vite & bundel server via esbuild
npm run build

# Menjalankan server Node.js hasil kompilasi produksi
npm start
```

### 6. Skrip Pendukung Lainnya
*   **`npm run lint`**: Menjalankan pengecekan statik TypeScript compiler (`tsc --noEmit`) tanpa menghasilkan output file guna mengaudit integritas tipe data dan error koding.
*   **`npm run clean`**: Membersihkan folder `dist` dan berkas server temporer untuk mereset cache kompilasi.

---

## 🛡️ Catatan Keamanan & Kepatuhan Data
1.  **Proteksi API Key**: File `.env` yang berisi `GEMINI_API_KEY` telah didaftarkan di dalam `.gitignore` sehingga tidak akan pernah terunggah ke repositori publik.
2.  **Pemrosesan Sisi Server (Server-Side Proxy)**: API Key Gemini hanya diakses di sisi server (`server.ts`) dan tidak pernah dikirimkan ke peramban klien, mengeliminasi risiko pembajakan token API pihak ketiga.
3.  **Desentralisasi Penyimpanan**: Seluruh data warga dan transaksi keuangan disimpan secara lokal di dalam browser klien menggunakan enkripsi `localStorage`. Jika server mati, data warga tetap aman di peranti masing-masing. Selalu unduh backup data dalam format JSON secara berkala.

---

## ⚖️ Penafian & Regulasi
Perangkat lunak ini dikembangkan untuk memperkuat kemandirian tata kelola ekonomi desa di Indonesia secara profesional, transparan, dan akuntabel. Formulasi perhitungan alokasi SHU, denda keterlambatan pinjaman, serta pengkategorian status kolektibilitas disesuaikan dengan kerangka peraturan resmi dari **Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi Republik Indonesia** serta **Otoritas Jasa Keuangan (OJK)**.
