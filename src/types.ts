export interface RPMData {
  sekolah: string;
  mataPelajaran: string;
  fase: string;
  kelas: string;
  materi: string;
  semester: string;
  tahunAjaran: string;
  alokasiWaktu: string;
  jumlahPertemuan: string;
  modelPembelajaran: string;
  namaGuru: string;
  nipGuru?: string;
  integrasiCoding: boolean;
  paperSize: 'A4' | 'F4';
  useKopSurat: boolean;
  kopSurat: {
    logo?: string;
    baris1: string;
    baris2: string;
    baris3: string;
    baris4: string;
  };
  useLembarPengesahan: boolean;
  pengesahan: {
    tempatTanggal: string;
    namaKepalaSekolah: string;
    nipKepalaSekolah: string;
  };
}

export interface RPMLangkah {
  tahap: string;
  prinsip: string;
  kegiatan: string;
  sintaks: string;
}

export interface RPMResult {
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  profilLulusan: {
    dimensi: { nama: string; penjelasan: string }[];
  };
  kebiasaanAnak: {
    daftar: { nama: string; penjelasan: string }[];
  };
  lintasDisiplin: string;
  saranaPrasarana: string;
  pendekatanMendalam: string;
  computationalThinking: {
    dekomposisi: string;
    pola: string;
    abstraksi: string;
    algoritma: string;
  };
  codingActivity?: string;
  pengalamanBelajar: RPMLangkah[];
  asesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
  };
  refleksiGuru: string;
  refleksiSiswa: string;
  mediaSupport?: {
    gambarIlustrasi?: string;
    videoYoutube?: string;
    referensiLink?: { judul: string; url: string }[];
  };
}
