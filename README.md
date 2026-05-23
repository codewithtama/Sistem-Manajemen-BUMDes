# SIM-BUMDes (Sistem Informasi Manajemen BUMDes)

Sistem Informasi Manajemen Keuangan, Simpan Pinjam, dan Pelaporan Keuangan Badan Usaha Milik Desa (BUMDes) yang dirancang untuk memenuhi standar administrasi, tata kelola, dan regulasi **Peraturan Menteri Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi (Permendesa PDTT) No. 3 Tahun 2021**.

Aplikasi ini mengusung tema **Clean Minimalism** yang intuitif, cepat, responsif, serta dilengkapi oleh integrasi **Gemini AI** untuk membantu pengurus desa melakukan audit kepatuhan regulasi secara otomatis.

---

## 🌟 Fitur Utama

### 1. Ringkasan Eksekutif (Dashboard)
*   **Informasi Likuiditas Real-Time**: Pemantauan langsung saldo Kas Utama BUMDes, total Tabungan Warga, serta alokasi Piutang Simpan Pinjam produktif.
*   **Rasio Kredit Macet (NPL)**: Penghitungan otomatis rasio kredit bermasalah sesuai indikator kesehatan keuangan mikro Kemendesa (Sangat Sehat < 5%, hingga Kritis > 20%).
*   **Interactive Metric Breakdown**: Dilengkapi dengan tooltip kalkulasi interaktif yang menampilkan rumus akuntansi dan breakdown rincian perolehan angka metrik dari buku kas.

### 2. Buku Kas Umum (BKU) Terintegrasi
*   **Pencatatan Ganda Berkorelasi**: Setiap penyetoran tabungan, penarikan dana, penyaluran kredit baru, maupun pembayaran angsuran terfase otomatis ke dalam jurnal debit/kredit Buku Kas Umum.
*   **Filter & Korelasi Transaksi**: Memudahkan bendahara melacak bukti pengeluaran operasional, gaji, penyertaan modal awal desa (APBDes), atau pendapatan unit usaha murni.

### 3. Unit Tabungan & Simpanan Warga
*   **Multi-Rekening**: Mendukung klasifikasi tabungan warga berbasis regulasi koperasi: **Simpanan Pokok**, **Simpanan Wajib**, dan **Simpanan Sukarela**.
*   **Mutasi Rekening Otomatis**: Riwayat pencatatan setor/tarik tunai dengan verifikasi kecukupan saldo yang ketat untuk mencegah selisih kas.

### 4. Unit Simpan Pinjam (Kredit Bergulir)
*   **Kolektibilitas Otomatis**: Sistem melacak ketertiban pembayaran angsuran pokok dan jasa administratif, serta menggolongkan status pinjaman warga secara dinamis (*Lancar*, *Kurang Lancar*, *Diragukan*, *Macet*).
*   **Formulir Penyaluran & Angsuran Kontrol**: Menghitung porsi bagi hasil mufakat/jasa administratif desa tanpa sistem bunga melingkar yang memberatkan masyarakat.

### 5. Laporan Pertanggungjawaban (LPJ) Musyawarah Desa
*   **Perhitungan SHU Otomatis**: Membagi sisa hasil usaha (surplus) bersih BUMDes langsung ke pos-pos wajib regulasi Permendesa No. 3/2021:
    *   **Ke Pendapatan Asli Desa (PADesa)**: 40%
    *   **Dana Cadangan Penguat Modal**: 30%
    *   **Honorarium/Insentif Pengurus**: 15%
    *   **Bonus Sektor Keikutsertaan Warga**: 10%
    *   **Dana Sosial & CSR Lingkungan**: 5%
*   **Ramah Cetak (Printable)**: Antarmuka yang teroptimasi penuh untuk langsung dicetak melalui browser (`Ctrl+P`) untuk kelancaran presentasi saat Musyawarah Desa (Musdes).

### 6. Asisten Regulasi & Audit Kepatuhan Berbasis AI (Gemini)
*   **Audit Kepatuhan Instan**: Mengirimkan data pembukuan kas serta portofolio pinjaman berjalan ke model Gemini untuk menganalisis risiko, likuiditas, kategori kesehatan NPL, serta memproduksi Catatan Atas Laporan Keuangan (CALK) ringkas secara objektif.
*   **Tanya Jawab Aturan Hukum**: Konsultasi interaktif seputar administrasi hukum BUMDes berdasarkan undang-undang dan peraturan menteri terkait.

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: React 19 (TypeScript), Vite 6, Tailwind CSS (Vite plugin `@tailwindcss/vite`).
*   **Backend & Server**: Node.js, Express (API routes proxy).
*   **AI Engine**: `@google/genai` (Gemini 3.5 Flash).
*   **Ikonografi**: Lucide React.
*   **Bundler & Runtime**: esbuild (Server compilation CJS), tsx (Development hot-running).

---

## 🚀 Panduan Instalasi Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/username/sim-bumdes.git
cd sim-bumdes
```

### 2. Instalasi Dependensi
Aplikasi ini menggunakan npm untuk instalasi paket kode:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat berkas `.env` dari salinan `.env.example` di root proyek:
```bash
cp .env.example .env
```
Isi konfigurasi kunci di dalam berkas `.env`:
```env
# Google Gemini API Key dari Google AI Studio
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Opsional: Dokumen URL host jika diperlukan
APP_URL="http://localhost:3000"
```

### 4. Jalankan Mode Pengembangan
Jalankan server pengembangan berbasis tsx + Vite middleware mode:
```bash
npm run dev
```
Buka peramban jaringan Anda dan akses alamat `http://localhost:3000`.

### 5. Kompilasi Produksi (Build)
Untuk membuat paket redistribusi produksi yang teroptimasi cepat:
```bash
npm run build
npm start
```

---

## ⚖️ Penafian & Regulasi
Sistem ini dibuat untuk memperkuat kemandirian ekonomi desa di Indonesia dalam rangka keterbukaan informasi publik dan akuntabilitas keuangan mikro. Formulasi dan algoritma bagi hasil di dalam kode ini diselaraskan dengan amanah penyertaan modal desa sesuai kerangka hukum Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi Republik Indonesia.
