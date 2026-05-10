/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Settings, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Download, 
  Upload,
  Layout,
  GraduationCap,
  Brain,
  Code,
  PenTool,
  Trophy,
  History,
  Info,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import { RPMData, RPMResult } from './types';
import { generateRPM } from './services/geminiService';

const PAGE_SIZE_CLASSES = {
  A4: 'w-[210mm] min-h-[297mm]',
  F4: 'w-[215mm] min-h-[330mm]'
};

export default function App() {
  const [formData, setFormData] = useState<RPMData>({
    sekolah: 'SD NEGERI 3 KENDALREJO',
    mataPelajaran: '',
    fase: 'A (Kelas 1-2)',
    kelas: '1',
    materi: '',
    semester: '1 (Ganjil)',
    tahunAjaran: '2025/2026',
    alokasiWaktu: '2 x 35 Menit',
    jumlahPertemuan: '1 Pertemuan',
    modelPembelajaran: 'Problem Based Learning (PBL)',
    namaGuru: '',
    nipGuru: '',
    integrasiCoding: false,
    paperSize: 'A4',
    useKopSurat: false,
    kopSurat: {
      baris1: 'PEMERINTAH KABUPATEN MUARO JAMBI',
      baris2: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      baris3: 'SD NEGERI 3 KENDALREJO',
      baris4: 'JL. PALUAGUNG NO. 12 KOTA JAMBI'
    },
    useLembarPengesahan: false,
    pengesahan: {
      tempatTanggal: 'Jambi, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      namaKepalaSekolah: '',
      nipKepalaSekolah: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RPMResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RPMData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.mataPelajaran || !formData.materi || !formData.namaGuru) {
      alert("Harap lengkapi setidaknya Mata Pelajaran, Materi, dan Nama Guru.");
      return;
    }

    setIsLoading(true);
    try {
      const rpm = await generateRPM(formData);
      setResult(rpm);
      setShowPreview(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    if (!printRef.current) return;

    // Create a clone of the print area to modify for Word export
    const content = printRef.current.innerHTML;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>RPM - ${formData.materi}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: black; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; font-bold; }
            h1 { text-align: center; font-size: 16pt; margin-bottom: 20px; text-decoration: underline; }
            h2 { font-size: 13pt; margin-top: 20px; color: #1a365d; border-bottom: 1px solid #eee; }
            .no-print { display: none !important; }
            .bg-blue-600 { background-color: #3b82f6 !important; color: white !important; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .underline { text-decoration: underline; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    const blob = await asBlob(htmlContent);
    saveAs(blob as Blob, `RPM_${formData.materi.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white py-10 px-6 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/30 shadow-inner">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md">AI Generator RPM</h1>
              <p className="text-blue-50 text-sm font-medium opacity-90">Solusi Cerdas Perencanaan Pembelajaran Mendalam</p>
            </div>
          </div>
          <div className="flex bg-white/10 backdrop-blur-lg px-5 py-2.5 rounded-full border border-white/20 items-center gap-2 shadow-sm hover:bg-white/20 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Created by: Andri Ardi Wilandra</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 gap-10">
        {!showPreview ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Data Pembelajaran */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Data Pembelajaran</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nama Sekolah</label>
                    <input 
                      type="text" 
                      name="sekolah" 
                      value={formData.sekolah} 
                      onChange={handleInputChange}
                      placeholder="Contoh: SD Negeri 3 Kendalrejo"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Mata Pelajaran</label>
                    <input 
                      type="text" 
                      name="mataPelajaran" 
                      value={formData.mataPelajaran} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Matematika"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Materi</label>
                    <input 
                      type="text" 
                      name="materi" 
                      value={formData.materi} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Pecahan Senilai"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Fase</label>
                    <select 
                      name="fase" 
                      value={formData.fase} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option>A (Kelas 1-2)</option>
                      <option>B (Kelas 3-4)</option>
                      <option>C (Kelas 5-6)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Kelas</label>
                    <input 
                      type="text" 
                      name="kelas" 
                      value={formData.kelas} 
                      onChange={handleInputChange}
                      placeholder="Contoh: 4"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Semester</label>
                    <select 
                      name="semester" 
                      value={formData.semester} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option>1 (Ganjil)</option>
                      <option>2 (Genap)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tahun Ajaran</label>
                    <input 
                      type="text" 
                      name="tahunAjaran" 
                      value={formData.tahunAjaran} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Alokasi Waktu</label>
                    <input 
                      type="text" 
                      name="alokasiWaktu" 
                      value={formData.alokasiWaktu} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Jumlah Pertemuan</label>
                    <input 
                      type="text" 
                      name="jumlahPertemuan" 
                      value={formData.jumlahPertemuan} 
                      onChange={handleInputChange}
                      placeholder="1 Pertemuan"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Model Pembelajaran</label>
                    <select 
                      name="modelPembelajaran" 
                      value={formData.modelPembelajaran} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option>Problem Based Learning (PBL)</option>
                      <option>Project Based Learning (PjBL)</option>
                      <option>Discovery Learning</option>
                      <option>Inquiry Learning</option>
                      <option>Cooperative Learning</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Data Guru */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <PenTool className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Identitas Guru</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nama Guru / Penyusun</label>
                    <input 
                      type="text" 
                      name="namaGuru" 
                      value={formData.namaGuru} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Andri Ardi, S.Pd."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">NIP Guru (Opsional)</label>
                    <input 
                      type="text" 
                      name="nipGuru" 
                      value={formData.nipGuru} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Integrasi Tambahan */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Code className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Integrasi Khusus</h2>
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="integrasiCoding" 
                      checked={formData.integrasiCoding} 
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">Integrasi Aktivitas Coding</span>
                  </label>
                </div>
              </section>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-8">
              {/* Pengaturan Cetak */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Pengaturan Dokumen</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">Ukuran Kertas</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, paperSize: 'A4' }))}
                        className={`py-2 px-4 rounded-xl border font-medium transition-all ${formData.paperSize === 'A4' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}
                      >
                        A4
                      </button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, paperSize: 'F4' }))}
                        className={`py-2 px-4 rounded-xl border font-medium transition-all ${formData.paperSize === 'F4' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}
                      >
                        F4/Folio
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="useKopSurat" 
                        checked={formData.useKopSurat} 
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Pakai Kop Surat</span>
                    </label>

                    {formData.useKopSurat && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-3 pt-2 pl-7 border-l-2 border-blue-100"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Logo Sekolah</label>
                          <div className="flex items-center gap-3">
                            {formData.kopSurat.logo ? (
                              <img src={formData.kopSurat.logo} alt="Logo" className="w-10 h-10 object-contain border rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setFormData(prev => ({
                                      ...prev,
                                      kopSurat: { ...prev.kopSurat, logo: reader.result as string }
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                          </div>
                        </div>
                        <input 
                          type="text" 
                          name="kopSurat.baris1" 
                          value={formData.kopSurat.baris1} 
                          onChange={handleInputChange}
                          placeholder="Pemerintah/Yayasan"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                        />
                        <input 
                          type="text" 
                          name="kopSurat.baris2" 
                          value={formData.kopSurat.baris2} 
                          onChange={handleInputChange}
                          placeholder="Dinas/Instansi"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                        />
                        <input 
                          type="text" 
                          name="kopSurat.baris3" 
                          value={formData.kopSurat.baris3} 
                          onChange={handleInputChange}
                          placeholder="Nama Sekolah"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-bold"
                        />
                        <input 
                          type="text" 
                          name="kopSurat.baris4" 
                          value={formData.kopSurat.baris4} 
                          onChange={handleInputChange}
                          placeholder="Alamat Lengkap"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 italic"
                        />
                      </motion.div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="useLembarPengesahan" 
                        checked={formData.useLembarPengesahan} 
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Pakai Lembar Pengesahan</span>
                    </label>

                    {formData.useLembarPengesahan && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-3 pt-2 pl-7 border-l-2 border-blue-100"
                      >
                        <input 
                          type="text" 
                          name="pengesahan.tempatTanggal" 
                          value={formData.pengesahan.tempatTanggal} 
                          onChange={handleInputChange}
                          placeholder="Tempat, Tanggal"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                        />
                        <input 
                          type="text" 
                          name="pengesahan.namaKepalaSekolah" 
                          value={formData.pengesahan.namaKepalaSekolah} 
                          onChange={handleInputChange}
                          placeholder="Nama Kepala Sekolah"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                        />
                        <input 
                          type="text" 
                          name="pengesahan.nipKepalaSekolah" 
                          value={formData.pengesahan.nipKepalaSekolah} 
                          onChange={handleInputChange}
                          placeholder="NIP Kepala Sekolah"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full mt-10 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:scale-[1.02] active:scale-95 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Mensinkronisasi Kurikulum...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6 group-hover:animate-pulse" />
                      <span>Hasilkan RPM Profesional</span>
                    </>
                  )}
                </button>
              </section>

              {/* Info Tips */}
              <section className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 italic text-sm text-blue-700 flex gap-3">
                <Info className="w-5 h-5 shrink-0" />
                <p>AI akan otomatis mengintegrasikan Deep Learning, Computational Thinking, dan Profil Lulusan sesuai materi yang Anda pilih.</p>
              </section>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Preview Actions */}
              <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-50">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" /> Edit Data
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDownloadWord}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md shadow-emerald-100"
                  >
                    <FileText className="w-4 h-4" /> Word (.doc)
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100"
                  >
                    <Printer className="w-4 h-4" /> Cetak / PDF
                  </button>
                </div>
              </div>

              {/* The Result Document */}
              <div className="flex justify-center overflow-x-auto pb-10">
                <div 
                  ref={printRef}
                  className={`bg-white shadow-2xl p-[20mm] text-[12pt] leading-relaxed text-black printable-area ${PAGE_SIZE_CLASSES[formData.paperSize]}`}
                  style={{ 
                    fontFamily: "'Times New Roman', serif",
                    pageBreakInside: 'auto'
                  }}
                >
                  {/* Kop Surat */}
                  {formData.useKopSurat && (
                    <div className="border-b-4 border-black pb-4 mb-8 flex items-center gap-8">
                      {formData.kopSurat.logo ? (
                        <img src={formData.kopSurat.logo} alt="Logo Sekolah" className="w-[80px] h-auto max-h-[80px] object-contain" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 rounded flex items-center justify-center text-[10pt] italic text-center font-sans border border-slate-300 no-print">
                          Logo Sekolah
                        </div>
                      )}
                      <div className="flex-1 text-center font-sans">
                        <p className="text-[14pt] leading-tight">{formData.kopSurat.baris1}</p>
                        <p className="text-[14pt] leading-tight">{formData.kopSurat.baris2}</p>
                        <p className="text-[16pt] font-extrabold leading-tight">{formData.kopSurat.baris3}</p>
                        <p className="text-[10pt] italic mt-1">{formData.kopSurat.baris4}</p>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-10">
                    <h1 className="text-[18pt] font-extrabold uppercase tracking-widest text-[#1a365d] underline decoration-4 underline-offset-8 decoration-blue-500">
                      RENCANA PEMBELAJARAN MENDALAM (RPM)
                    </h1>
                  </div>

                  {/* Identitas */}
                  <div className="mb-10">
                    <h2 className="font-bold text-[14pt] text-[#3B6BB0] mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 no-print opacity-30" /> A. Identitas Modul
                    </h2>
                    <table className="w-full border-collapse border border-slate-300 text-[11pt]">
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2 w-[30%] bg-[#F0F4FF] font-semibold">Nama</td>
                          <td className="border border-slate-300 p-2">{formData.namaGuru}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">NIP</td>
                          <td className="border border-slate-300 p-2">{formData.nipGuru || '-'}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Sekolah</td>
                          <td className="border border-slate-300 p-2">{formData.sekolah}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Mata Pelajaran</td>
                          <td className="border border-slate-300 p-2">{formData.mataPelajaran}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Kelas / Fase</td>
                          <td className="border border-slate-300 p-2">Fase {formData.fase} (Kelas {formData.kelas})</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Semester</td>
                          <td className="border border-slate-300 p-2">{formData.semester}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Materi Pokok</td>
                          <td className="border border-slate-300 p-2 uppercase">{formData.materi}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Alokasi Waktu</td>
                          <td className="border border-slate-300 p-2">{formData.alokasiWaktu}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Jumlah Pertemuan</td>
                          <td className="border border-slate-300 p-2">{formData.jumlahPertemuan}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 bg-[#F0F4FF] font-semibold">Tahun Pelajaran</td>
                          <td className="border border-slate-300 p-2">{formData.tahunAjaran}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-8 doc-content">
                    <section>
                      <h2 className="font-bold flex items-center gap-2 border-b-2 border-slate-100 pb-1 mb-3 text-[#3B6BB0]">
                        <GraduationCap className="w-5 h-5 opacity-50 no-print" /> I. CAPAIAN PEMBELAJARAN
                      </h2>
                      <div className="text-justify leading-relaxed whitespace-pre-wrap">{result?.capaianPembelajaran}</div>
                    </section>

                    <section>
                      <h2 className="font-bold flex items-center gap-2 border-b-2 border-slate-100 pb-1 mb-3 text-[#3B6BB0]">
                        <CheckCircle2 className="w-5 h-5 opacity-50 no-print" /> II. TUJUAN PEMBELAJARAN
                      </h2>
                      <div className="text-justify leading-relaxed whitespace-pre-wrap">{result?.tujuanPembelajaran}</div>
                    </section>

                    <section>
                      <h2 className="font-bold flex items-center gap-2 border-b-2 border-slate-100 pb-1 mb-4 text-[#3B6BB0]">
                        <Trophy className="w-5 h-5 opacity-50 no-print" /> III. 8 DIMENSI PROFIL LULUSAN
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-[10pt]">
                          <thead>
                            <tr className="bg-[#DAE8FC]">
                              <th className="border border-slate-300 p-3 w-[30%] text-left font-bold text-[#3B6BB0]">Dimensi</th>
                              <th className="border border-slate-300 p-3 text-left font-bold text-[#3B6BB0]">Penjelasan Singkat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result?.profilLulusan.dimensi.map((dim, idx) => (
                              <tr key={idx} className="align-middle">
                                <td className="border border-slate-300 p-3 font-bold bg-[#F0F4FF]">{dim.nama}</td>
                                <td className="border border-slate-300 p-3 text-slate-700 bg-white leading-relaxed">{dim.penjelasan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h2 className="font-bold flex items-center gap-2 border-b-2 border-slate-100 pb-1 mb-4 text-[#3B6BB0]">
                        <History className="w-5 h-5 opacity-50 no-print" /> IV. 7 KEBIASAAN ANAK INDONESIA HEBAT
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-[10pt]">
                          <thead>
                            <tr className="bg-[#DAE8FC]">
                              <th className="border border-slate-300 p-3 w-[30%] text-left font-bold text-[#3B6BB0]">Kebiasaan</th>
                              <th className="border border-slate-300 p-3 text-left font-bold text-[#3B6BB0]">Penjelasan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result?.kebiasaanAnak.daftar.map((hab, idx) => (
                              <tr key={idx} className="align-middle">
                                <td className="border border-slate-300 p-3 font-bold bg-[#F0F4FF]">{hab.nama}</td>
                                <td className="border border-slate-300 p-3 text-slate-700 bg-white leading-relaxed">{hab.penjelasan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h2 className="font-bold border-b-2 border-slate-100 pb-1 mb-3 text-[#3B6BB0]">V. INTEGRASI LINTAS DISIPLIN</h2>
                      <div className="text-justify">{result?.lintasDisiplin}</div>
                    </section>

                    <section>
                      <h2 className="font-bold border-b-2 border-slate-100 pb-1 mb-3 text-[#3B6BB0]">VI. SARANA DAN PRASARANA</h2>
                      <div className="text-justify">{result?.saranaPrasarana}</div>
                    </section>

                    <section>
                      <h2 className="font-bold border-b-2 border-slate-100 pb-1 mb-3 text-[#3B6BB0]">VII. PENDEKATAN PEMBELAJARAN MENDALAM</h2>
                      <div className="text-justify">{result?.pendekatanMendalam}</div>
                    </section>

                    {/* CT Integration */}
                    <section className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 mt-10">
                      <h2 className="font-bold flex items-center gap-2 text-[#3B6BB0] mb-4">
                        <Brain className="w-5 h-5" /> VIII. INTEGRASI COMPUTATIONAL THINKING
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10.5pt]">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                          <h3 className="font-bold text-[#3B6BB0] border-b mb-2">1. Dekomposisi</h3>
                          <p className="italic">{result?.computationalThinking.dekomposisi}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                          <h3 className="font-bold text-[#3B6BB0] border-b mb-2">2. Pengenalan Pola</h3>
                          <p className="italic">{result?.computationalThinking.pola}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                          <h3 className="font-bold text-[#3B6BB0] border-b mb-2">3. Abstraksi</h3>
                          <p className="italic">{result?.computationalThinking.abstraksi}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                          <h3 className="font-bold text-[#3B6BB0] border-b mb-2">4. Algoritma</h3>
                          <p className="italic">{result?.computationalThinking.algoritma}</p>
                        </div>
                      </div>
                    </section>

                    {formData.integrasiCoding && result?.codingActivity && (
                      <section className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative mt-10">
                         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Code className="w-24 h-24" />
                         </div>
                         <h2 className="font-bold flex items-center gap-3 text-cyan-400 mb-4 relative z-10">
                           <Code className="w-6 h-6" /> IX. AKTIVITAS CODING (UNPLUGGED/BLOCK)
                         </h2>
                         <div className="text-slate-300 leading-relaxed relative z-10 whitespace-pre-wrap">{result?.codingActivity}</div>
                      </section>
                    )}

                    {result?.mediaSupport && (
                      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-10 space-y-6">
                        <h2 className="font-bold border-b-2 border-slate-100 pb-1 uppercase flex items-center gap-2 text-[#3B6BB0]">
                          <ImageIcon className="w-5 h-5 opacity-50 no-print" /> X. MEDIA PENDUKUNG PEMBELAJARAN
                        </h2>
                        
                        {result.mediaSupport.gambarIlustrasi && (
                          <div className="space-y-2">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800"><ImageIcon className="w-4 h-4 text-blue-600" /> Contoh Gambar / Ilustrasi</h3>
                            <div className="text-[11pt] bg-white p-4 rounded-xl border border-slate-200 shadow-sm italic text-slate-600">
                              {result.mediaSupport.gambarIlustrasi}
                            </div>
                          </div>
                        )}

                        {result.mediaSupport.videoYoutube && (
                          <div className="space-y-2">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800"><Video className="w-4 h-4 text-blue-600" /> Video Pembelajaran</h3>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                              <div className="p-2 bg-red-50 rounded-lg">
                                <Video className="w-5 h-5 text-red-600" />
                              </div>
                              <a href={result.mediaSupport.videoYoutube} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium break-all">
                                {result.mediaSupport.videoYoutube}
                              </a>
                            </div>
                          </div>
                        )}

                        {result.mediaSupport.referensiLink && result.mediaSupport.referensiLink.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800"><LinkIcon className="w-4 h-4 text-blue-600" /> Referensi Tambahan</h3>
                            <div className="grid grid-cols-1 gap-2">
                              {result.mediaSupport.referensiLink.map((ref, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                                  <LinkIcon className="w-4 h-4 text-slate-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{ref.judul}</span>
                                    <a href={ref.url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm break-all font-medium">
                                      {ref.url}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    <section className="space-y-6 pt-6">
                      <h2 className="font-bold text-[14pt] border-b-2 border-black pb-1 uppercase text-[#3B6BB0]">XI. PENGALAMAN BELAJAR (LANGKAH PEMBELAJARAN)</h2>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-black text-[10pt]">
                          <thead>
                            <tr className="bg-blue-600 text-white">
                              <th className="border border-black p-2 w-[15%] text-left">Tahap</th>
                              <th className="border border-black p-2 w-[15%] text-left">Prinsip</th>
                              <th className="border border-black p-2 w-[50%] text-left">Kegiatan Pembelajaran</th>
                              <th className="border border-black p-2 w-[20%] text-left">Sintaks Model</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result?.pengalamanBelajar.map((item, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="border border-black p-2 font-bold">{item.tahap}</td>
                                <td className="border border-black p-2 italic">{item.prinsip}</td>
                                <td className="border border-black p-2">
                                  <div className="whitespace-pre-wrap">{item.kegiatan}</div>
                                </td>
                                <td className="border border-black p-2">{item.sintaks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h2 className="font-bold text-[14pt] border-b-2 border-black pb-1 uppercase text-[#3B6BB0]">XII. ASESMEN PEMBELAJARAN</h2>
                      
                      <div className="border border-black overflow-hidden">
                        {/* Asesmen Awal */}
                        <div className="flex border-b border-black min-h-[100px]">
                          <div className="w-[25%] bg-[#DAE8FC] p-3 flex items-start justify-start border-r border-black">
                            <span className="font-bold text-[#3B6BB0]">Asesmen Awal</span>
                          </div>
                          <div className="w-[75%] p-4 text-[10pt]">
                            <div className="markdown-body">
                              <Markdown remarkPlugins={[remarkGfm]}>{result?.asesmen.diagnostik}</Markdown>
                            </div>
                          </div>
                        </div>

                        {/* Asesmen Proses */}
                        <div className="flex border-b border-black min-h-[150px]">
                          <div className="w-[25%] bg-[#FFF2CC] p-3 flex items-start justify-start border-r border-black">
                            <span className="font-bold text-[#D6B656]">Asesmen Proses</span>
                          </div>
                          <div className="w-[75%] p-4 text-[10pt]">
                            <div className="markdown-body">
                              <Markdown remarkPlugins={[remarkGfm]}>{result?.asesmen.formatif}</Markdown>
                            </div>
                          </div>
                        </div>

                        {/* Asesmen Akhir */}
                        <div className="flex min-h-[100px]">
                          <div className="w-[25%] bg-[#D5E8D4] p-3 flex items-start justify-start border-r border-black">
                            <span className="font-bold text-[#82B366]">Asesmen Akhir</span>
                          </div>
                          <div className="w-[75%] p-4 text-[10pt]">
                            <div className="markdown-body">
                              <Markdown remarkPlugins={[remarkGfm]}>{result?.asesmen.sumatif}</Markdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h2 className="font-bold text-[14pt] border-b-2 border-black pb-1 text-[#3B6BB0]">XIII. REFLEKSI GURU</h2>
                      <div className="markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>{result?.refleksiGuru}</Markdown>
                      </div>
                    </section>

                    <section className="space-y-6 pt-6 mb-10">
                      <h2 className="font-bold text-[14pt] border-b-2 border-black pb-1 text-[#3B6BB0]">XIV. REFLEKSI PESERTA DIDIK</h2>
                      <div className="markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>{result?.refleksiSiswa}</Markdown>
                      </div>
                    </section>
                  </div>

                  {/* Lembar Pengesahan */}
                  {formData.useLembarPengesahan && (
                    <div className="mt-20 pt-10 border-t border-slate-200">
                      <div className="flex justify-between mt-10">
                        <div className="text-center">
                          <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                          <p className="font-bold underline uppercase">{formData.pengesahan.namaKepalaSekolah || '...................................'}</p>
                          <p>NIP. {formData.pengesahan.nipKepalaSekolah || '...................................'}</p>
                        </div>
                        <div className="text-center">
                          <p className="mb-2">{formData.pengesahan.tempatTanggal || '..................., ....................'}</p>
                          <p className="mb-20">Guru Mata Pelajaran</p>
                          <p className="font-bold underline uppercase">{formData.namaGuru}</p>
                          <p>NIP. {formData.nipGuru || '...................................'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Creator Mark */}
                  <div className="mt-12 text-[8pt] italic text-slate-400 no-print flex justify-between border-t pt-4">
                    <span>Generated by AI RPM Generator</span>
                    <span>Creator: Andri Ardi Wilandra</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          header, footer, nav, button, .sidebar-controls {
            display: none !important;
          }
          .printable-area {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .doc-content section {
            page-break-inside: avoid;
          }
          .html-table-container table {
             width: 100% !important;
             border-collapse: collapse !important;
          }
          .html-table-container th, .html-table-container td {
            border: 1px solid black !important;
            padding: 8px !important;
          }
        }
        
        .html-table-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .html-table-container th, .html-table-container td {
          border: 1px solid #000;
          padding: 10px;
          text-align: left;
        }
        .html-table-container th {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
