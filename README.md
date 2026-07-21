# Aplikasi Pencatatan Bon Multi-Profil

Aplikasi ini dirancang untuk mempermudah pengelolaan dan pencatatan bon (piutang) dari berbagai lembaga atau instansi secara terpisah. Dengan sistem multi-profil, Anda dapat memisahkan catatan utang-piutang antar lembaga (misalnya: SD, Kantor Desa, Toko A, dll.) tanpa mencampuradukkan datanya.

## 📌 Alur Penggunaan

1. **Pilih Target "Profile" Bon**

- Pilih profil lembaga yang ingin diakses (misal: SD, Desa, dll.).
- Jika lembaga belum terdaftar, pengguna dapat membuat profil baru terlebih dahulu.

2. **Representasi Data**

- Setiap profil akan memiliki dan diwakili oleh satu tabel khusus yang berdiri sendiri.

## 📊 Struktur Tabel Catatan

Setiap profil akan merekam data transaksi dengan format tabel berikut:

<!-- prettier-ignore -->
+---------+-----------+------------+------------------------+--------------------------+---------------+--------------+-----------+
| Tanggal | Pelanggan | Nama Item  | Jumlah Item (optional) | Harga Item (conditional) | Tambah Hutang | Bayar Hutang | Akumulasi |
+---------+-----------+------------+------------------------+--------------------------+---------------+--------------+-----------+
| 20/07   | A         | Buku Tulis |                     10 |                    4.000 |        40.000 |              |    40.000 |
| 20/07   | B         | Fotocopy   |                      - |                    2.000 |         2.000 |              |    42.000 |
| 20/07   | C         | Fotocopy   |                     50 |                      400 |        20.000 |              |    62.000 |
| 20/07   | D         | Cetak Foto |                      - |                    5.000 |         5.000 |              |    67.000 |
| 20/07   | E         | Pembayaran |                      - |                        - |               |       50.000 |    17.000 |
+---------+-----------+------------+------------------------+--------------------------+---------------+--------------+-----------+

### Keterangan Kolom:

- **Jumlah Item _(Optional)_:** Bisa dikosongkan jika transaksi berupa jasa atau item yang tidak dihitung per satuan.
- **Harga Item _(Conditional)_:** Menyesuaikan dengan kondisi jumlah item.
- **Akumulasi:** Total saldo piutang berjalan yang otomatis terhitung dari transaksi-transaksi sebelumnya.

## ⚡ Aksi & Fitur Utama

Aplikasi ini mendukung dua aksi utama dalam pengelolaan piutang:

### A. Menambahkan Piutang (Tambah Hutang)

Digunakan saat ada anggota lembaga yang mengambil barang atau menggunakan jasa secara bon.

- **Input yang diperlukan:** Tanggal, Nama Orang, Nama Item, Jumlah Item _(opsional)_, dan Harga Item.
- **Logika Perhitungan:**
- **Jika Jumlah Item KOSONG:** Total piutang yang masuk ke kolom `Tambah Hutang` sama dengan `Harga Item` (kasus untuk layanan jasa atau borongan).
- **Jika Jumlah Item DIISI:** Total piutang pada kolom `Tambah Hutang` dihitung secara otomatis dengan rumus:

$$\text{Tambah Hutang} = \text{Jumlah Item} \times \text{Harga Item}$$

### B. Menerima Pembayaran (Bayar Hutang)

Digunakan saat lembaga atau perwakilan melakukan pembayaran untuk memotong saldo bon yang ada.

- **Input yang diperlukan:** Tanggal, Nama Orang, Nama Item (diisi manual atau otomatis bernilai "Pembayaran"), dan Nominal Pembayaran.
- **Logika Perhitungan:**
- Nominal yang dimasukkan akan masuk ke kolom `Bayar Hutang`.
- Kolom `Jumlah Item` dan `Harga Item` otomatis dikosongkan (`-`).

### C. Kalkulasi Saldo Otomatis (Akumulasi)

Setiap kali ada aksi tambah atau bayar hutang, sistem secara otomatis memperbarui kolom `Akumulasi` pada baris terbaru dengan rumus:

$$\text{Akumulasi Baru} = \text{Akumulasi Sebelumnya} + \text{Tambah Hutang} - \text{Bayar Hutang}$$
