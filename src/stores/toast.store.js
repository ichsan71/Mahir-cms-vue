import { defineStore } from "pinia";
import { ref } from "vue";

// Notifikasi toast global — dipakai lintas fitur (mis. auth) via useToast().
// Setiap toast otomatis hilang setelah `duration` ms.
export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);
  let seq = 0;

  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function push({ type = "info", message, duration = 4000 }) {
    const id = ++seq;
    toasts.value.push({ id, type, message });
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }

  const success = (message, duration) => push({ type: "success", message, duration });
  const error = (message, duration) => push({ type: "error", message, duration });
  const info = (message, duration) => push({ type: "info", message, duration });
  const warning = (message, duration) => push({ type: "warning", message, duration });

  return { toasts, push, remove, success, error, info, warning };
});
