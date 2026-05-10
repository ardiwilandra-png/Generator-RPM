import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { GoogleGenAI, Type } from "@google/genai";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/generate-rpm' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const { data } = JSON.parse(body);
                  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                  
                  if (!apiKey) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }));
                    return;
                  }

                  const genAI = new GoogleGenAI({ apiKey });
                  
                  const response = await genAI.models.generateContent({ 
                    model: "gemini-3-flash-preview",
                    contents: `
                      Kamu adalah pakar kurikulum SD di Indonesia. Buatlah Rencana Pembelajaran Mendalam (RPM) lengkap berdasarkan data berikut:
                      Sekolah: ${data.namaSekolah}
                      Mata Pelajaran: ${data.mataPelajaran}
                      Fase: ${data.fase}
                      Kelas: ${data.kelas}
                      Materi: ${data.materi}
                      Semester: ${data.semester}
                      Alokasi Waktu: ${data.alokasiWaktu}
                      Model Pembelajaran: ${data.modelPembelajaran}
                      Integrasi Coding: ${data.integrasiCoding ? "Ya" : "Tidak"}

                      Gunakan bahasa Indonesia yang profesional, modern, dan mudah dipahami guru SD.
                      
                      PENTING: Pada bagian "profilLulusan", pilih minimal 3-5 dimensi yang PALING RELEVAN.
                      PENTING: Pada bagian "kebiasaanAnak", pilih 1-2 kebiasaan dari "7 Kebiasaan Anak Indonesia Hebat".
                      PENTING: Pada bagian "asesmen", "refleksiGuru", dan "refleksiSiswa", gunakan format MARKDOWN.
                      WAJIB sertakan tabel rubrik penilaian dalam format Markdown pada asesmen formatif.
                      
                      Berikan respon dalam format JSON yang valid.
                    `,
                    config: {
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

                  res.setHeader('Content-Type', 'application/json');
                  res.end(response.text);
                } catch (e) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
