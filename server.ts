import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route untuk Generate RPM
  app.post("/api/generate-rpm", async (req, res) => {
    const { data } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY belum dikonfigurasi di server." });
    }

    try {
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              capaianPembelajaran: { type: Type.STRING },
              tujuanPembelajaran: { type: Type.STRING },
              profilLulusan: {
                type: Type.OBJECT,
                properties: {
                  dimensi: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nama: { type: Type.STRING },
                        penjelasan: { type: Type.STRING }
                      },
                      required: ["nama", "penjelasan"]
                    }
                  }
                },
                required: ["dimensi"]
              },
              kebiasaanAnak: {
                type: Type.OBJECT,
                properties: {
                  daftar: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nama: { type: Type.STRING },
                        penjelasan: { type: Type.STRING }
                      },
                      required: ["nama", "penjelasan"]
                    }
                  }
                },
                required: ["daftar"]
              },
              lintasDisiplin: { type: Type.STRING },
              saranaPrasarana: { type: Type.STRING },
              pendekatanMendalam: { type: Type.STRING },
              computationalThinking: {
                type: Type.OBJECT,
                properties: {
                  dekomposisi: { type: Type.STRING },
                  pola: { type: Type.STRING },
                  abstraksi: { type: Type.STRING },
                  algoritma: { type: Type.STRING }
                },
                required: ["dekomposisi", "pola", "abstraksi", "algoritma"]
              },
              codingActivity: { type: Type.STRING },
              pengalamanBelajar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tahap: { type: Type.STRING },
                    prinsip: { type: Type.STRING },
                    kegiatan: { type: Type.STRING },
                    sintaks: { type: Type.STRING }
                  },
                  required: ["tahap", "prinsip", "kegiatan", "sintaks"]
                }
              },
              asesmen: {
                type: Type.OBJECT,
                properties: {
                  diagnostik: { type: Type.STRING },
                  formatif: { type: Type.STRING },
                  sumatif: { type: Type.STRING }
                },
                required: ["diagnostik", "formatif", "sumatif"]
              },
              refleksiGuru: { type: Type.STRING },
              refleksiSiswa: { type: Type.STRING },
              mediaSupport: {
                type: Type.OBJECT,
                properties: {
                  gambarIlustrasi: { type: Type.STRING },
                  videoYoutube: { type: Type.STRING },
                  referensiLink: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        judul: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ["judul", "url"]
                    }
                  }
                }
              }
            },
            required: [
              "capaianPembelajaran", 
              "tujuanPembelajaran", 
              "profilLulusan", 
              "kebiasaanAnak", 
              "lintasDisiplin", 
              "saranaPrasarana", 
              "pendekatanMendalam", 
              "computationalThinking", 
              "pengalamanBelajar", 
              "asesmen", 
              "refleksiGuru", 
              "refleksiSiswa"
            ]
          }
        }
      });

      const prompt = `
        Kamu adalah pakar kurikulum SD di Indonesia. Buatlah Rencana Pembelajaran Mendalam (RPM) lengkap berdasarkan data berikut:
        Mata Pelajaran: ${data.mataPelajaran}
        Fase: ${data.fase}
        Kelas: ${data.kelas}
        Materi: ${data.materi}
        Semester: ${data.semester}
        Alokasi Waktu: ${data.alokasiWaktu}
        Model Pembelajaran: ${data.modelPembelajaran}
        Integrasi Coding: ${data.integrasiCoding ? "Ya" : "Tidak"}

        Gunakan bahasa Indonesia yang profesional, modern, dan mudah dipahami guru SD.
        Pastikan aktivitas pembelajaran berpusat pada siswa dan mengintegrasikan CT (Computational Thinking) dan Deep Learning.
        
        PENTING: Pada bagian "profilLulusan", pilih minimal 3-5 dimensi yang PALING RELEVAN dengan materi. 
        Wajib mencakup "dimensi" (nama dimensi) dan "penjelasan" (deskripsi singkat 1-2 kalimat).
        
        PENTING: Pada bagian "kebiasaanAnak", pilih 1-2 kebiasaan dari "7 Kebiasaan Anak Indonesia Hebat" yang PALING RELEVAN dengan materi.
        Wajib mencakup "daftar" (array objek dengan nama dan penjelasan).
        Daftar kebiasaan: Bangun pagi, Beribadah, Berolahraga, Makan sehat dan bergizi, Gemar belajar, Bermasyarakat, Istirahat yang cukup.
        
        PENTING: Pada bagian "pengalamanBelajar", buatlah minimal 5 baris/objek dalam array:
        1. Tahap: AWAL (Pendahuluan)
        2. Tahap: INTI - Memahami
        3. Tahap: INTI - Mengaplikasi
        4. Tahap: INTI - Merefleksi
        5. Tahap: PENUTUP
        
        Kolom "sintaks" harus disesuaikan dengan Model Pembelajaran: ${data.modelPembelajaran}.
        Misal untuk PBL: Orientasi Masalah, Organisasi Belajar, Penyelidikan, Pengembangan Hasil, Analisis & Evaluasi.
        Misal untuk PjBL: Pertanyaan Mendasar, Desain Proyek, Jadwal, Monitoring, Menguji Hasil, Evaluasi.
        
        Data "kegiatan" harus berupa poin-poin langkah yang detail (misal: 1. Guru menyapa... 2. Siswa mengamati...).
        
        PENTING: Pada bagian "asesmen", buatlah konten HTML yang sangat detail:
        1. Diagnostik (Asesmen Awal): Sertakan Jenis (Assessment as Learning), Metode, dan detail aktivitas.
        2. Formatif (Asesmen Proses): Sertakan Jenis (Assessment for Learning), Metode, dan WAJIB buatkan TABEL RUBRIK PENILAIAN (Kolom: Aspek Penilaian, Sangat Baik, Baik, Perlu Bimbingan).
        3. Sumatif (Asesmen Akhir): Sertakan Jenis (Assessment of Learning), Metode, dan detail tugas/pertanyaan evaluasi.
        
        Tambahkan juga dukungan media pembelajaran:
        1. gambarIlustrasi: Deskripsi atau narasi singkat tentang gambar yang cocok untuk materi ini.
        2. videoYoutube: Berikan 1 link video YouTube edukatif yang relevan (jika ada).
        3. referensiLink: Berikan minimal 2 link sumber belajar tambahan berupa array objek {judul, url}.
        
        Berikan respon dalam format JSON yang valid menyesuaikan schema yang diminta.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Gagal menghasilkan RPM." });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
