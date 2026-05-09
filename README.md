# AI Generator RPM - Panduan Deployment Vercel

Aplikasi ini telah siap untuk dideploy ke [Vercel](https://vercel.com). Ikuti langkah-langkah di bawah ini untuk mengonlinekan aplikasi Anda.

## Persiapan
1. Pastikan Anda memiliki akun di [Vercel](https://vercel.com).
2. Hubungkan akun GitHub/GitLab/Bitbucket Anda.

## Langkah Deployment
1. **Import Project**: Pilih repositori aplikasi ini di dashboard Vercel.
2. **Framework Preset**: Vercel akan otomatis mendeteksi **Vite**.
3. **Environment Variables (PENTING)**:
   Aplikasi ini memerlukan API Key Gemini agar fitur AI dapat bekerja. Di bagian **Environment Variables**, tambahkan:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: (Masukkan API Key Google Gemini Anda)
4. **Deploy**: Klik tombol **Deploy** dan tunggu proses selesai.

## Keamanan
Perlu dicatat bahwa dalam konfigurasi saat ini, API Key tersebut akan disertakan dalam kode sisi klien (browser) saat proses build. Untuk penggunaan produksi yang lebih publik, disarankan menggunakan sistem backend (Serverless Functions) untuk menyembunyikan API Key tersebut.
