import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/shared/components/AppLayout.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/features/auth/views/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", name: "dashboard", component: () => import("@/features/dashboard/views/DashboardView.vue"), meta: { title: "Dashboard" } },
      { path: "karyawan", name: "karyawan", component: () => import("@/features/employees/views/EmployeesView.vue"), meta: { title: "Manajemen Karyawan" } },
      { path: "penggajian", name: "penggajian", component: () => import("@/features/payroll/views/PayrollView.vue"), meta: { title: "Manajemen Penggajian" } },
      { path: "kehadiran", name: "kehadiran", component: () => import("@/features/attendance/views/AttendanceView.vue"), meta: { title: "Monitoring Kehadiran" } },
      { path: "cuti", name: "cuti", component: () => import("@/features/leaves/views/LeavesView.vue"), meta: { title: "Cuti & Izin" } },
      { path: "rekrutmen", name: "rekrutmen", component: () => import("@/features/recruitment/views/RecruitmentView.vue"), meta: { title: "Rekrutmen" } },
      { path: "laporan", name: "laporan", component: () => import("@/features/reports/views/ReportsView.vue"), meta: { title: "Laporan" } },
      { path: "pengaturan", name: "pengaturan", component: () => import("@/features/settings/views/SettingsView.vue"), meta: { title: "Pengaturan" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard autentikasi: rute non-public butuh sesi login.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: "login", query: to.path !== "/" ? { redirect: to.fullPath } : {} };
  }
  if (to.name === "login" && auth.isAuthenticated) {
    return { path: "/dashboard" };
  }
});
