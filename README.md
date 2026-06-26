# Loan Payoff Estimator

Loan Payoff Estimator membantu Anda memperkirakan berapa lama pinjaman bisa lunas berdasarkan saldo pinjaman, bunga tahunan, dan pembayaran bulanan.

## Cara Menggunakan

1. Buka halaman Loan Payoff Estimator.
2. Isi **Loan balance** dengan sisa pinjaman Anda.
   Contoh: `8500` untuk pinjaman sebesar $8,500.
3. Isi **Annual interest rate** dengan bunga tahunan.
   Contoh: `6.5` untuk bunga 6.5% per tahun.
4. Isi **Monthly payment** dengan jumlah yang akan Anda bayar setiap bulan.
   Contoh: `200` untuk pembayaran $200 per bulan.
5. Hasil akan langsung berubah otomatis saat Anda mengetik.

## Arti Hasil

**Months to payoff**  
Jumlah bulan yang dibutuhkan sampai pinjaman lunas.

**Total amount paid**  
Total seluruh uang yang Anda bayarkan sampai pinjaman lunas.

**Total interest paid**  
Total bunga yang Anda bayar di luar jumlah pinjaman awal.

## Tabel Bulanan

Tabel di bagian bawah menunjukkan rincian setiap bulan:

- **Month**: bulan pembayaran ke berapa.
- **Interest**: bagian pembayaran yang dipakai untuk membayar bunga.
- **Principal**: bagian pembayaran yang mengurangi pokok pinjaman.
- **Remaining balance**: sisa pinjaman setelah pembayaran bulan tersebut.

Jika tabel terlalu panjang, data akan ditampilkan maksimal 10 baris per bagian.
Di desktop, gunakan tombol **Previous** dan **Next** untuk berpindah halaman.
Di mobile, tekan **Load more** atau gulir sampai bawah untuk memuat 10 baris berikutnya.
Gunakan tombol **Back to inputs** di mobile untuk kembali cepat ke form input.

## Peringatan Pembayaran Terlalu Rendah

Jika muncul pesan **"Payment too low - balance will never be paid off"**, artinya pembayaran bulanan Anda terlalu kecil untuk menutup bunga bulan pertama. Dalam kondisi itu, pinjaman tidak akan lunas dengan jumlah pembayaran tersebut.

Coba naikkan nilai **Monthly payment** sampai hasil perhitungan muncul kembali.

## Pilihan Tampilan

Di bagian atas tersedia dua pilihan tampilan:

- **Light**: tampilan utama berbasis Comfort, lebih besar dan mudah dibaca.
- **Dark**: tampilan gelap dengan kontras tinggi untuk kondisi minim cahaya.

Pilih tampilan yang paling nyaman untuk Anda.

## Struktur File

- `index.html`: struktur halaman.
- `styles.css`: style tampilan desktop dan mobile.
- `app.js`: logika kalkulasi, pagination, dan load more.
