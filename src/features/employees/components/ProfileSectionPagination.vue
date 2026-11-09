<script setup>
// Footer paginasi read-only yang dipakai bersama oleh kartu-kartu section di
// "Profil Saya". Tidak memuat data sendiri — menerima objek paginasi & jumlah
// baris yang sedang tampil, lalu memancarkan event next/prev ke induk yang
// memegang state halaman (param dikirim ke query GET_MY_PROFILE).
defineProps({
  // { count, currentPage, totalPages, hasNext, hasPrev }
  pagination: { type: Object, required: true },
  // Banyaknya baris yang tampil di halaman ini.
  shown: { type: Number, default: 0 },
  // Kata benda untuk teks "Menampilkan N dari M <unit>".
  unitLabel: { type: String, default: "data" },
});

defineEmits(["next", "prev"]);
</script>

<template>
  <div
    v-if="pagination.count"
    class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
  >
    <span class="text-[13px] text-mahir-muted"
      >Menampilkan {{ shown }} dari {{ pagination.count }} {{ unitLabel }}</span
    >
    <nav class="flex items-center gap-1">
      <button
        class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
        :disabled="!pagination.hasPrev"
        @click="$emit('prev')"
      >
        ‹
      </button>
      <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
        {{ pagination.currentPage }}
      </span>
      <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
      <button
        class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
        :disabled="!pagination.hasNext"
        @click="$emit('next')"
      >
        ›
      </button>
    </nav>
  </div>
</template>
