<script setup>
// Port dari resources/views/layouts/admin.blade.php
// Shell: sidebar + navbar + slot konten. Judul navbar diambil dari route.meta.title.
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import AppNavbar from "./AppNavbar.vue";

const route = useRoute();
const title = computed(() => route.meta.title || "Dashboard");
</script>

<template>
  <div class="min-h-screen bg-mahir-bg">
    <AppSidebar />

    <!-- Main area digeser ke kanan selebar sidebar pada layar lg+ -->
    <div class="lg:pl-[260px]">
      <AppNavbar :title="title" />
      <main class="p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
