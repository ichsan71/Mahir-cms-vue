<script setup>
import StatsCard from "@/shared/components/StatsCard.vue";
import {
  UsersIcon,
  CheckBadgeIcon,
  UserMinusIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  stats: { type: Object, default: null },
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatsCard
      :value="stats?.total ?? '—'"
      label="Total Karyawan"
      :icon="UsersIcon"
      color="#243B8F"
      bg-color="#E7EEFF"
    />
    <StatsCard
      :value="stats?.active ?? '—'"
      label="Karyawan Aktif"
      :icon="CheckBadgeIcon"
      color="#1B9C67"
      bg-color="#E2F8EC"
    />
    <StatsCard
      :value="stats?.inactive ?? '—'"
      label="Non-Aktif"
      :icon="UserMinusIcon"
      color="#D14343"
      bg-color="#FCE7E7"
    />
    <StatsCard
      :value="stats?.departments ?? '—'"
      label="Departemen"
      :icon="ShareIcon"
      color="#2884E8"
      bg-color="#E4F1FF"
    />
  </div>
</template>
