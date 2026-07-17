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
      { path: "karyawan", name: "karyawan", component: () => import("@/features/employees/views/EmployeesView.vue"), meta: { title: "Manajemen Karyawan", superOnly: true, permission: ["listEmployee", "getEmployee"] } },
      { path: "karyawan/:id", name: "karyawan-detail", component: () => import("@/features/employees/views/EmployeeDetailView.vue"), meta: { title: "Detail Karyawan", superOnly: true, permission: "getEmployee" } },
      { path: "perusahaan", name: "perusahaan", component: () => import("@/features/companies/views/CompaniesView.vue"), meta: { title: "Manajemen Perusahaan", superOnly: true, permission: ["listCompany", "getCompany"] } },
      { path: "perusahaan/:id", name: "perusahaan-detail", component: () => import("@/features/companies/views/CompanyDetailView.vue"), meta: { title: "Detail Perusahaan", superOnly: true, permission: "getCompany" } },
      { path: "unit", name: "unit", component: () => import("@/features/units/views/UnitsView.vue"), meta: { title: "Manajemen Unit", superOnly: true, permission: ["listUnit", "getUnit"] } },
      { path: "unit/:id", name: "unit-detail", component: () => import("@/features/units/views/UnitDetailView.vue"), meta: { title: "Detail Unit", superOnly: true, permission: "getUnit" } },
      { path: "level", name: "level", component: () => import("@/features/levels/views/LevelsView.vue"), meta: { title: "Manajemen Level", superOnly: true, permission: ["listLevel", "getLevel"] } },
      { path: "level/:id", name: "level-detail", component: () => import("@/features/levels/views/LevelDetailView.vue"), meta: { title: "Detail Level", superOnly: true, permission: "getLevel" } },
      { path: "tipe-kepegawaian", name: "tipe-kepegawaian", component: () => import("@/features/employmentTypes/views/EmploymentTypesView.vue"), meta: { title: "Manajemen Tipe Kepegawaian", superOnly: true, permission: ["listEmploymentType", "getEmploymentType"] } },
      { path: "tipe-kepegawaian/:id", name: "tipe-kepegawaian-detail", component: () => import("@/features/employmentTypes/views/EmploymentTypeDetailView.vue"), meta: { title: "Detail Tipe Kepegawaian", superOnly: true, permission: "getEmploymentType" } },
      { path: "shift", name: "shift", component: () => import("@/features/shifts/views/ShiftsView.vue"), meta: { title: "Manajemen Shift", superOnly: true, permission: ["listShift", "getShift"] } },
      { path: "shift/:id", name: "shift-detail", component: () => import("@/features/shifts/views/ShiftDetailView.vue"), meta: { title: "Detail Shift", superOnly: true, permission: "getShift" } },
      { path: "cabang", name: "cabang", component: () => import("@/features/branches/views/BranchesView.vue"), meta: { title: "Manajemen Cabang", superOnly: true, permission: ["listBranch", "getBranch"] } },
      { path: "cabang/:id", name: "cabang-detail", component: () => import("@/features/branches/views/BranchDetailView.vue"), meta: { title: "Detail Cabang", superOnly: true, permission: "getBranch" } },
      { path: "penggajian", name: "penggajian", component: () => import("@/features/payroll/views/PayrollView.vue"), meta: { title: "Manajemen Penggajian", permission: "payrolls" } },
      { path: "kehadiran", name: "kehadiran", component: () => import("@/features/attendance/views/AttendanceView.vue"), meta: { title: "Monitoring Kehadiran", permission: "attendanceRecords" } },
      { path: "cuti", name: "cuti", component: () => import("@/features/leaves/views/LeavesView.vue"), meta: { title: "Cuti & Izin", permission: "leaves" } },
      { path: "rekrutmen", name: "rekrutmen", component: () => import("@/features/recruitment/views/RecruitmentView.vue"), meta: { title: "Rekrutmen", permission: ["applicants", "jobs"] } },
      { path: "laporan", name: "laporan", component: () => import("@/features/reports/views/ReportsView.vue"), meta: { title: "Laporan", permission: "reports" } },
      { path: "pengaturan", name: "pengaturan", component: () => import("@/features/settings/views/SettingsView.vue"), meta: { title: "Pengaturan" } },
      { path: "saya", name: "profil-saya", component: () => import("@/features/employees/views/MyProfileView.vue"), meta: { title: "Profil Saya" } },
      { path: "403", name: "forbidden", component: () => import("@/shared/components/ForbiddenView.vue"), meta: { title: "Akses Ditolak" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard autentikasi & permission.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: "login", query: to.path !== "/" ? { redirect: to.fullPath } : {} };
  }

  if (to.name === "login" && auth.isAuthenticated) {
    return { path: "/dashboard" };
  }

  // Menu Data Induk (master data) khusus super admin — non-super diblokir walau
  // punya permission-nya, baik lewat menu maupun akses URL langsung.
  if (to.meta.superOnly && !auth.user?.isSuperuser) {
    return { name: "forbidden" };
  }

  // Gate permission per-operasi (UX saja — API tetap menegakkan). Superuser
  // otomatis lolos lewat auth.can(). Berlaku untuk super admin & non-super:
  // menu yang izinnya tak dimiliki akan diarahkan ke halaman 403.
  if (to.meta.permission && !auth.can(to.meta.permission)) {
    return { name: "forbidden" };
  }
});
