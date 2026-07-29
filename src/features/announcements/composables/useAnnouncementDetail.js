import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_ANNOUNCEMENT } from "../graphql/announcement.queries";

// Layer logika detail pengumuman: ambil satu pengumuman berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif (mis. saat modal detail dibuka).
export function useAnnouncementDetail(id) {
  const getAnnouncementId = computed(() => {
    const n = Number(unref(id));
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_ANNOUNCEMENT,
    () => ({ getAnnouncementId: getAnnouncementId.value }),
    () => ({ enabled: getAnnouncementId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const announcement = computed(() => result.value?.getAnnouncement?.data ?? null);

  return { announcement, loading, error };
}
