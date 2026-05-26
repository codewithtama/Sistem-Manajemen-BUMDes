import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

const DB_PATH = path.join(process.cwd(), "bumdes_db.json");

// Helper function to lazily initialize GoogleGenAI with safe checks
function getGeminiClient(reqHeaders?: any) {
  const apiKey = reqHeaders?.["x-gemini-api-key"] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API key in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ── LOCAL SERVER JSON DATABASE ENDPOINTS ──────────────────────────────────────
app.get("/api/db", async (req, res) => {
  try {
    await fs.access(DB_PATH);
    const data = await fs.readFile(DB_PATH, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ message: "No database file found on server yet." });
  }
});

app.post("/api/db", async (req, res) => {
  try {
    const stateData = req.body;
    await fs.writeFile(DB_PATH, JSON.stringify(stateData, null, 2), "utf-8");
    res.json({ success: true, message: "State saved to server database." });
  } catch (err: any) {
    console.error("Failed to save database:", err);
    res.status(500).json({ error: err.message || "Failed to save state to server." });
  }
});

// API endpoint for general regulatory Q&A with context
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], contextData } = req.body;
    
    let ai;
    try {
      ai = getGeminiClient(req.headers);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }

    const systemInstruction = `Anda adalah 'Asisten Regulasi & Akuntansi BUMDes Mandiri'. 
Tugas Anda adalah membantu pengurus BUMDes (Badan Usaha Milik Desa) mengelola administrasi keuangan, unit simpan pinjam warga, dan kas operasional sesuai dengan Peraturan Menteri Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi (Permendesa PDTT) No. 3 Tahun 2021 dan standar akuntansi keuangan yang berlaku untuk BUMDes di Indonesia.

Panduan Regulasi Kemendesa kunci:
1. Alokasi Pembagian Hasil Usaha (PADesa, Dana Cadangan, Jasa Produksi, Jasa Pembina/Pengawas/Pengurus, CSR/Dana Sosial).
2. Transparansi BKU (Buku Kas Umum) dan Buku Pembantu (Pembantu Kas, Bank, Pajak).
3. Batas rasio pinjaman yang sehat dalam Simpan Pinjam, suku bunga berkeadilan desa tanpa riba berlebih, perlunya analisis kelayakan warga (5C: Character, Capacity, Capital, Collateral, Condition).
4. Kewajiban pelaporan berkala lewat Musyawarah Desa (Musdes) minimal 1 kali setahun (Laporan Pertanggungjawaban/LPJ).

Gunakan bahasa Indonesia yang profesional, ramah, dan mudah dipahami oleh perangkat desa / pengurus BUMDes. Sertakan tips akuntansi praktis jika diminta.`;

    const chatContext = contextData ? `\n\nUntuk referensi, berikut adalah ringkasan data keuangan BUMDes saat ini:\n${JSON.stringify(contextData, null, 2)}` : "";

    // Map incoming history to standard contents format if provided, or build formatted prompt
    const contents: any[] = [];
    for (const h of history) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      });
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message + chatContext }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini API." });
  }
});

// API endpoint to analyze current financial reports against Kemendesa standards
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { cashTransactions, savingsData, loanData, parameters } = req.body;

    let ai;
    try {
      ai = getGeminiClient(req.headers);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }

    const sysInstruction = `Anda adalah auditor keuangan ahli khusus BUMDes (Badan Usaha Milik Desa) sesuai standar Kemendesa PDTT RI.
Tugas Anda adalah menelaah berkas laporan keuangan BUMDes (Buku Kas Umum, Unit Simpan Pinjam, Tabungan Warga) dan mengeluarkan laporan analisis audit kepatuhan regulasi (compliance report) yang ramah, objektif, dan solutif.

Berikan analisis terstruktur dalam format Markdown berisi:
1. **Ringkasan Penilaian Kepatuhan**: Apakah pelaporan BKU, kas masuk, kas keluar, dan penanganan simpan pinjam sudah tertib sesuai regulasi (misal Permendesa No 3/2021).
2. **Analisis Rasio & Kinerja**:
   - Likuiditas kas (apakah dana kas aman untuk mencukupi penarikan simpanan warga).
   - Rasio Kredit Macet (NPL - Non-Performing Loan) simpan pinjam: hitung rasionya dan tentukan kategori kesehatannya (Sangat Sehat <5%, Sehat 5-10%, Cukup Sehat 10-15%, Kurang Sehat 15-20%, Tidak Sehat >20%).
   - Profitabilitas (efisiensi surplus usaha).
3. **Catatan Atas Laporan Keuangan (CALK) Ringkas**: Masukan penjelasan kualitatif operasional BUMDes berdasarkan angka yang dilaporkan.
4. **Rekomendasi Tindakan Strategis**: Langkah-langkah penyelesaian kredit macet, penertiban kas, atau cara meningkatkan keikutsertaan warga desa.

Gunakan data rill dari input transaksi dan data simpan pinjam yang dikirimkan. Tulis respon penuh dalam Bahasa Indonesia terstruktur rapi.`;

    const dataPrompt = `Berikut adalah data terperinci keuangan BUMDes saat ini:

DATA TRANSAKSI KAS (BUKU KAS UMUM):
${JSON.stringify(cashTransactions, null, 2)}

DATA TABUNGAN WARGA (SIMPANAN):
${JSON.stringify(savingsData, null, 2)}

DATA PINJAMAN WARGA (KREDIT):
${JSON.stringify(loanData, null, 2)}

Parameter / Metadata Tambahan:
${JSON.stringify(parameters, null, 2)}

Harap lakukan analisis kepatuhan regulasi menyeluruh dan rincikan laporan audit Anda.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: dataPrompt,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.2, // low temperature for precise factual regulatory auditing
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini Analyze API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini API." });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BUMDes Server running on port ${PORT}`);
  });
}

startServer();
