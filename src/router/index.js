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
      { path: "karyawan/:id", name: "karyawan-detail", component: () => import("@/features/employees/views/EmployeeDetailView.vue"), meta: { title: "Detail Karyawan" } },
      { path: "perusahaan", name: "perusahaan", component: () => import("@/features/companies/views/CompaniesView.vue"), meta: { title: "Manajemen Perusahaan" } },
      { path: "perusahaan/:id", name: "perusahaan-detail", component: () => import("@/features/companies/views/CompanyDetailView.vue"), meta: { title: "Detail Perusahaan" } },
      { path: "unit", name: "unit", component: () => import("@/features/units/views/UnitsView.vue"), meta: { title: "Manajemen Unit" } },
      { path: "unit/:id", name: "unit-detail", component: () => import("@/features/units/views/UnitDetailView.vue"), meta: { title: "Detail Unit" } },
      { path: "level", name: "level", component: () => import("@/features/levels/views/LevelsView.vue"), meta: { title: "Manajemen Level" } },
      { path: "level/:id", name: "level-detail", component: () => import("@/features/levels/views/LevelDetailView.vue"), meta: { title: "Detail Level" } },
      { path: "tipe-kepegawaian", name: "tipe-kepegawaian", component: () => import("@/features/employmentTypes/views/EmploymentTypesView.vue"), meta: { title: "Manajemen Tipe Kepegawaian" } },
      { path: "tipe-kepegawaian/:id", name: "tipe-kepegawaian-detail", component: () => import("@/features/employmentTypes/views/EmploymentTypeDetailView.vue"), meta: { title: "Detail Tipe Kepegawaian" } },
      { path: "shift", name: "shift", component: () => import("@/features/shifts/views/ShiftsView.vue"), meta: { title: "Manajemen Shift" } },
      { path: "shift/:id", name: "shift-detail", component: () => import("@/features/shifts/views/ShiftDetailView.vue"), meta: { title: "Detail Shift" } },
      { path: "cabang", name: "cabang", component: () => import("@/features/branches/views/BranchesView.vue"), meta: { title: "Manajemen Cabang" } },
      { path: "cabang/:id", name: "cabang-detail", component: () => import("@/features/branches/views/BranchDetailView.vue"), meta: { title: "Detail Cabang" } },
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
