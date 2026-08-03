<script setup>
// Halaman publik Kebijakan Privasi — dapat dibuka tanpa login (meta.public).
// Play mencocokkan halaman ini dengan jawaban Data safety form, jadi keduanya
// harus bercerita hal yang sama. Bila mengubah isi, samakan pula dengan
// DataDeletionView.vue pada bagian penghapusan data.
</script>

<template>
  <div class="legal-page">
    <main>
      <h1>Kebijakan Privasi MAHIR</h1>
      <p class="effective">Berlaku sejak 30 Juli 2026</p>

      <p>
        MAHIR adalah aplikasi kepegawaian (HRIS) untuk karyawan Mazta Group.
        Akun MAHIR dibuat dan dikelola oleh HR — Anda tidak mendaftar sendiri,
        dan aplikasi ini tidak bisa dipakai di luar hubungan kerja Anda dengan
        perusahaan.
      </p>

      <p>
        Kebijakan ini menjelaskan data pribadi apa yang aplikasi ini kumpulkan,
        untuk apa, berapa lama disimpan, dan bagaimana Anda menggunakan hak Anda
        atas data itu. Ditulis mengacu pada Undang-Undang No. 27 Tahun 2022
        tentang Perlindungan Data Pribadi.
      </p>

      <h2>Pengendali data</h2>
      <p>
        Pengendali data pribadi dalam aplikasi ini adalah Mazta Group, melalui
        unit Human Resource. Seluruh data yang dikirim aplikasi ini disimpan di
        server MAHIR milik perusahaan.
      </p>
      <p>
        Pertanyaan, keberatan, dan permintaan terkait data pribadi Anda dapat
        dikirim ke
        <a href="mailto:hrd@maztafarma.co.id">hrd@maztafarma.co.id</a>.
      </p>

      <h2>Data yang kami kumpulkan</h2>
      <p>
        Aplikasi ini hanya mengumpulkan data yang dipakai untuk menjalankan
        fungsinya. Tidak ada data yang dikumpulkan untuk iklan, profiling, atau
        dijual.
      </p>
      <ul>
        <li>
          <strong>Identitas akun</strong> — nama pengguna, alamat email, grup
          hak akses, dan waktu login terakhir. Dipakai untuk mengautentikasi
          Anda dan menentukan menu mana yang boleh Anda buka.
        </li>
        <li>
          <strong>Data kepegawaian</strong> — nama, foto profil, jabatan, unit
          kerja, cabang, atasan, dan data kontak yang sudah tercatat di sistem
          HR. Aplikasi menampilkan dan membacanya; sumber datanya tetap HR,
          bukan aplikasi ini.
        </li>
        <li>
          <strong>Lokasi presisi</strong> — koordinat, tingkat akurasi,
          ketinggian, kecepatan, arah, dan waktu pengambilan titik — diambil
          hanya pada saat Anda menekan absen masuk atau absen keluar, dan pada
          saat memulai atau menghentikan aktivitas yang terikat lokasi. Aplikasi
          tidak melacak posisi Anda di latar belakang dan tidak pernah meminta
          izin lokasi “selalu”.
        </li>
        <li>
          <strong>Foto kehadiran (swafoto)</strong> — diambil langsung dari
          kamera saat absensi sebagai bukti bahwa yang absen adalah Anda.
          Aplikasi tidak pernah membuka galeri foto Anda.
        </li>
        <li>
          <strong>Identitas dan integritas perangkat</strong> — pengenal serta
          nama perangkat, dan sinyal apakah perangkat di-root/jailbreak, berupa
          emulator, atau memakai lokasi palsu. Tujuannya satu: menolak absensi
          yang dipalsukan. Sinyal ini dibaca pada saat absensi, bukan
          terus-menerus.
        </li>
        <li>
          <strong>Lampiran pengajuan cuti</strong> — berkas yang Anda pilih
          sendiri untuk dilampirkan, misalnya surat keterangan dokter. Berkas
          semacam itu dapat memuat informasi kesehatan, yang menurut UU PDP
          tergolong data pribadi yang bersifat spesifik. Melampirkannya adalah
          tindakan sukarela Anda dan hanya diminta oleh jenis cuti yang memang
          mensyaratkannya.
        </li>
        <li>
          <strong>Catatan aktivitas kerja</strong> — tugas yang Anda kerjakan,
          waktu mulai dan selesai, serta catatan yang Anda tulis sendiri pada
          lembar aktivitas.
        </li>
        <li>
          <strong>Data pengajuan cuti dan persetujuan</strong> — jenis cuti,
          tanggal, alasan, dan riwayat langkah persetujuannya.
        </li>
      </ul>

      <h2>Data yang tidak kami kumpulkan</h2>
      <p>
        Beberapa hal disebut di sini karena ketiadaannya sama pentingnya dengan
        keberadaan yang lain:
      </p>
      <ul>
        <li>
          Tidak ada pelacakan lintas aplikasi maupun lintas situs, dan tidak ada
          pengenal iklan.
        </li>
        <li>
          Tidak ada layanan analitik, iklan, maupun pengukuran pihak ketiga di
          dalam aplikasi ini.
        </li>
        <li>
          Aplikasi tidak membaca kontak, kalender, mikrofon, galeri foto, SMS,
          maupun riwayat panggilan Anda.
        </li>
        <li>Aplikasi tidak mengambil lokasi saat sedang tidak dipakai.</li>
        <li>
          Tidak ada data yang dipakai untuk melatih model kecerdasan buatan.
        </li>
      </ul>

      <h2>Izin perangkat yang diminta</h2>
      <ul>
        <li>
          <strong>Lokasi (saat aplikasi dipakai)</strong> — memastikan absensi
          dilakukan di area kerja. Absensi tidak dapat diproses tanpa izin ini.
        </li>
        <li>
          <strong>Kamera</strong> — mengambil swafoto bukti kehadiran. Bersifat
          opsional — absensi tetap bisa dilakukan tanpa foto bila kebijakan unit
          Anda mengizinkan.
        </li>
      </ul>
      <p>
        Anda dapat mencabut izin ini kapan saja lewat pengaturan sistem
        perangkat Anda. Mencabut izin lokasi berarti fitur absensi berhenti
        berfungsi, tetapi fitur lain tetap dapat dipakai.
      </p>

      <h2>Dasar pemrosesan</h2>
      <p>
        Sebagian besar data di atas diproses untuk memenuhi hubungan kerja
        antara Anda dan perusahaan — pencatatan kehadiran, pengelolaan cuti, dan
        pelaporan aktivitas adalah bagian dari kewajiban ketenagakerjaan kedua
        pihak.
      </p>
      <p>
        Untuk lokasi presisi, swafoto kehadiran, dan lampiran cuti yang memuat
        informasi kesehatan, aplikasi meminta persetujuan Anda secara terpisah
        dan eksplisit sebelum pengambilan data pertama. Persetujuan itu dapat
        Anda tarik dengan mencabut izin perangkat atau menghubungi HR.
      </p>

      <h2>Kepada siapa data dibagikan</h2>
      <p>
        Tidak ada. Data yang dikirim aplikasi ini hanya menuju server MAHIR
        milik Mazta Group. Aplikasi tidak memuat SDK pihak ketiga yang
        mengumpulkan data, dan perusahaan tidak menjual atau menukarkan data
        pribadi karyawan.
      </p>
      <p>
        Di dalam perusahaan, data Anda hanya dapat dilihat oleh pihak yang
        memang berkepentingan: Anda sendiri, atasan langsung Anda untuk keperluan
        persetujuan, dan unit HR. Batasan ini ditegakkan oleh sistem hak akses,
        bukan oleh kebiasaan.
      </p>
      <p>
        Pengungkapan kepada pihak luar hanya dilakukan bila diwajibkan oleh
        hukum atau perintah pengadilan.
      </p>

      <h2>Penyimpanan dan pengamanan</h2>
      <ul>
        <li>
          Seluruh komunikasi antara aplikasi dan server berjalan terenkripsi
          (HTTPS/TLS).
        </li>
        <li>
          Token sesi disimpan di penyimpanan aman sistem operasi (Android
          Keystore / iOS Keychain), bukan di penyimpanan biasa.
        </li>
        <li>
          Pencadangan otomatis ke Google Drive dan penyalinan data
          antar-perangkat dimatikan, sehingga data kepegawaian yang sempat
          tersimpan di perangkat tidak ikut tersalin ke akun pribadi Anda dan
          tidak bertahan melewati masa pemakaian aplikasi.
        </li>
        <li>
          Data yang tersimpan di perangkat hanya berupa cache tampilan dan
          preferensi. Keluar dari akun akan menghapusnya.
        </li>
      </ul>

      <h2>Berapa lama data disimpan</h2>
      <p>
        Catatan kehadiran, cuti, dan aktivitas kerja adalah dokumen
        ketenagakerjaan. Perusahaan menyimpannya selama Anda bekerja dan untuk
        jangka waktu setelahnya sepanjang masih diwajibkan oleh peraturan
        ketenagakerjaan, perpajakan, dan audit yang berlaku.
      </p>
      <p>
        Data yang tidak lagi diwajibkan disimpan akan dihapus atau dianonimkan.
        Rincian jangka waktu untuk setiap jenis dokumen dapat Anda tanyakan ke
        HR.
      </p>

      <h2>Hak Anda</h2>
      <p>Menurut UU No. 27 Tahun 2022, Anda berhak untuk:</p>
      <ul>
        <li>mengetahui data pribadi Anda yang diproses dan untuk apa;</li>
        <li>meminta akses dan salinan data pribadi Anda;</li>
        <li>memperbaiki data yang keliru atau tidak lagi mutakhir;</li>
        <li>meminta penghapusan atau pemusnahan data pribadi Anda;</li>
        <li>menarik persetujuan yang pernah Anda berikan;</li>
        <li>mengajukan keberatan atas pemrosesan tertentu; dan</li>
        <li>menyampaikan pengaduan.</li>
      </ul>
      <p>
        Sebagian data dapat Anda perbaiki sendiri lewat HR. Untuk sisanya,
        kirimkan permintaan ke
        <a href="mailto:hrd@maztafarma.co.id">hrd@maztafarma.co.id</a>.
        Permintaan akan ditanggapi selambat-lambatnya dalam 3 x 24 jam hari
        kerja dan diselesaikan dalam 30 hari.
      </p>

      <h2>Menghapus akun dan data</h2>
      <p>
        Akun MAHIR dibuat oleh HR, sehingga tidak dapat dihapus sendiri dari
        dalam aplikasi — menghapusnya secara sepihak akan memutus catatan
        kehadiran yang menjadi dasar penggajian Anda.
      </p>
      <p>
        Anda dapat mengajukan permintaan penghapusan lewat menu “Permintaan
        Hapus Data” di halaman Akun Saya, atau lewat
        <RouterLink to="/hapus-data"
          >halaman permintaan penghapusan data</RouterLink
        >.
      </p>
      <p>
        Yang dihapus atas permintaan Anda: akun dan kredensial, swafoto
        kehadiran, titik lokasi absensi, catatan identitas dan integritas
        perangkat, serta lampiran cuti. Yang tetap disimpan: catatan kehadiran,
        cuti, dan penggajian dalam bentuk yang diwajibkan peraturan
        ketenagakerjaan dan perpajakan, selama jangka waktu yang ditentukan
        peraturan tersebut. Setelah jangka itu lewat, data tersebut ikut
        dihapus.
      </p>

      <h2>Anak-anak</h2>
      <p>
        Aplikasi ini ditujukan untuk karyawan Mazta Group dan tidak ditujukan
        bagi anak-anak. Aplikasi tidak mengumpulkan data pribadi anak secara
        sengaja.
      </p>

      <h2>Perubahan kebijakan</h2>
      <p>
        Bila kebijakan ini berubah pada hal yang menentukan — data apa yang
        dikumpulkan atau untuk apa — aplikasi akan meminta persetujuan Anda
        kembali sebelum melanjutkan. Perubahan redaksional tidak memicu
        permintaan ulang.
      </p>
      <p>
        Versi terbaru selalu tersedia di dalam aplikasi dan di
        <a href="https://maztafarma.co.id/mahir/kebijakan-privasi"
          >https://maztafarma.co.id/mahir/kebijakan-privasi</a
        >.
      </p>

      <h2>Kontak</h2>
      <p>
        Mazta Group — Human Resource<br />
        <a href="mailto:hrd@maztafarma.co.id">hrd@maztafarma.co.id</a>
      </p>

      <footer>MAHIR Mobile · Mazta Group · Berlaku sejak 30 Juli 2026</footer>
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
  }
}
.legal-page * {
  box-sizing: border-box;
}
.legal-page main {
  max-width: 44rem;
  margin: 0 auto;
}
.legal-page h1 {
  font-size: 1.9rem;
  line-height: 1.25;
  margin: 0 0 0.35rem;
}
.legal-page h2 {
  font-size: 1.2rem;
  margin: 2.5rem 0 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--rule);
}
.legal-page .effective {
  color: var(--muted);
  margin: 0 0 2rem;
  font-size: 0.95rem;
}
.legal-page ul {
  padding-left: 1.25rem;
}
.legal-page li {
  margin: 0.5rem 0;
}
.legal-page a {
  color: var(--accent);
}
.legal-page footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
