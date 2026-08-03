<script setup>
// Halaman publik permintaan penghapusan data — dapat dibuka tanpa login.
// Isinya harus sepakat dengan bagian "Menghapus akun dan data" di
// PrivacyPolicyView.vue. Dipakai sebagai URL "Data deletion" Play Console,
// karena itu route-nya bertanda meta.public.
</script>

<template>
  <div class="legal-page">
    <main>
      <h1>Permintaan Hapus Akun dan Data — MAHIR</h1>

      <p>
        Akun MAHIR dibuat dan dikelola oleh unit HR Mazta Group, bukan
        didaftarkan sendiri oleh karyawan. Karena itu akun tidak bisa dihapus
        langsung dari dalam aplikasi — penghapusan dilakukan lewat permintaan ke
        HR, agar catatan kehadiran yang menjadi dasar penggajian tidak terputus
        tanpa pemeriksaan.
      </p>

      <h2>Cara mengajukan</h2>
      <p>
        Kirim email berisi <strong>nama lengkap</strong>,
        <strong>nama pengguna MAHIR</strong>, dan
        <strong>NIK/nomor karyawan</strong> Anda ke alamat di bawah ini.
        Sebutkan bahwa Anda meminta penghapusan data pribadi pada aplikasi
        MAHIR.
      </p>

      <div class="card">
        <a
          class="cta"
          href="mailto:hrd@maztafarma.co.id?subject=Permintaan%20Penghapusan%20Data%20Pribadi%20-%20MAHIR"
        >
          Kirim permintaan ke hrd@maztafarma.co.id
        </a>
      </div>

      <p>
        Karyawan aktif juga dapat mengajukannya lewat menu
        <em>Akun Saya → Permintaan Hapus Data</em> di dalam aplikasi.
      </p>

      <h2>Data yang dihapus</h2>
      <ul>
        <li>Akun dan kredensial MAHIR Anda.</li>
        <li>Swafoto bukti kehadiran.</li>
        <li>Titik lokasi yang tercatat pada setiap absensi.</li>
        <li>Catatan identitas dan integritas perangkat.</li>
        <li>Berkas lampiran pengajuan cuti.</li>
      </ul>

      <h2>Data yang tetap disimpan</h2>
      <p>
        Catatan kehadiran, cuti, dan penggajian disimpan dalam bentuk yang
        diwajibkan peraturan ketenagakerjaan dan perpajakan, selama jangka waktu
        yang ditentukan peraturan tersebut. Setelah jangka waktu itu lewat, data
        tersebut ikut dihapus.
      </p>

      <h2>Jangka waktu</h2>
      <p>
        Permintaan ditanggapi selambat-lambatnya dalam 3 x 24 jam hari kerja dan
        diselesaikan dalam 30 hari.
      </p>

      <p>
        Penjelasan lengkap tentang data yang dikumpulkan aplikasi ini ada di
        <RouterLink to="/kebijakan-privasi">Kebijakan Privasi MAHIR</RouterLink>.
      </p>

      <footer>MAHIR Mobile · Mazta Group</footer>
    </main>
  </div>
</template>

<style scoped>
.legal-page {
  --bg: #ffffff;
  --fg: #1a1c1e;
  --muted: #5a5f66;
  --rule: #e2e5e9;
  --accent: #0b6b52;
  --card: #f5f7f8;
  min-height: 100vh;
  padding: 2.5rem 1.25rem 5rem;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.7 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
@media (prefers-color-scheme: dark) {
  .legal-page {
    --bg: #121416;
    --fg: #e6e8ea;
    --muted: #a2a8af;
    --rule: #2a2e33;
    --accent: #6fd0b0;
    --card: #1b1e21;
  }
}
.legal-page * {
  box-sizing: border-box;
}
.legal-page main {
  max-width: 40rem;
  margin: 0 auto;
}
.legal-page h1 {
  font-size: 1.75rem;
  line-height: 1.25;
  margin: 0 0 1.25rem;
}
.legal-page h2 {
  font-size: 1.1rem;
  margin: 2.25rem 0 0.6rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rule);
}
.legal-page ul {
  padding-left: 1.25rem;
}
.legal-page li {
  margin: 0.45rem 0;
}
.legal-page a {
  color: var(--accent);
}
.legal-page .card {
  background: var(--card);
  border: 1px solid var(--rule);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
}
.legal-page .cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background: var(--accent);
  color: var(--bg);
  text-decoration: none;
  font-weight: 600;
}
.legal-page footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
