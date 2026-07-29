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
      { path: "karyawan", name: "karyawan", component: () => import("@/features/employees/views/EmployeesView.vue"), meta: { title: "Manajemen Karyawan", permission: "listEmployee" } },
      { path: "karyawan/:id", name: "karyawan-detail", component: () => import("@/features/employees/views/EmployeeDetailView.vue"), meta: { title: "Detail Karyawan", permission: "getEmployee" } },
      { path: "perusahaan", name: "perusahaan", component: () => import("@/features/companies/views/CompaniesView.vue"), meta: { title: "Manajemen Perusahaan", permission: "listCompany" } },
      { path: "perusahaan/:id", name: "perusahaan-detail", component: () => import("@/features/companies/views/CompanyDetailView.vue"), meta: { title: "Detail Perusahaan", permission: "getCompany" } },
      { path: "unit", name: "unit", component: () => import("@/features/units/views/UnitsView.vue"), meta: { title: "Manajemen Unit", permission: "listUnit" } },
      { path: "unit/:id", name: "unit-detail", component: () => import("@/features/units/views/UnitDetailView.vue"), meta: { title: "Detail Unit", permission: "getUnit" } },
      { path: "level", name: "level", component: () => import("@/features/levels/views/LevelsView.vue"), meta: { title: "Manajemen Level", permission: "listLevel" } },
      { path: "level/:id", name: "level-detail", component: () => import("@/features/levels/views/LevelDetailView.vue"), meta: { title: "Detail Level", permission: "getLevel" } },
      { path: "tipe-kepegawaian", name: "tipe-kepegawaian", component: () => import("@/features/employmentTypes/views/EmploymentTypesView.vue"), meta: { title: "Manajemen Tipe Kepegawaian", permission: "listEmploymentType" } },
      { path: "tipe-kepegawaian/:id", name: "tipe-kepegawaian-detail", component: () => import("@/features/employmentTypes/views/EmploymentTypeDetailView.vue"), meta: { title: "Detail Tipe Kepegawaian", permission: "getEmploymentType" } },
      { path: "shift", name: "shift", component: () => import("@/features/shifts/views/ShiftManagementView.vue"), meta: { title: "Manajemen Shift", permission: ["listShift", "listWorkPattern"] } },
      { path: "shift/:id", name: "shift-detail", component: () => import("@/features/shifts/views/ShiftDetailView.vue"), meta: { title: "Detail Shift", permission: "getShift" } },
      { path: "pola-kerja/:id", name: "pola-kerja-detail", component: () => import("@/features/workPatterns/views/WorkPatternDetailView.vue"), meta: { title: "Detail Pola Kerja", permission: "getWorkPattern" } },
      { path: "pengaturan-cuti", name: "pengaturan-cuti", component: () => import("@/features/leaveRules/views/LeaveManagementView.vue"), meta: { title: "Pengaturan Cuti", permission: ["listLeaveRule", "listLeaveType", "listLeaveMandatoryApprover"] } },
      { path: "aturan-cuti/:id", name: "aturan-cuti-detail", component: () => import("@/features/leaveRules/views/LeaveRuleDetailView.vue"), meta: { title: "Detail Aturan Cuti", permission: "getLeaveRule" } },
      { path: "tipe-cuti/:id", name: "tipe-cuti-detail", component: () => import("@/features/leaveTypes/views/LeaveTypeDetailView.vue"), meta: { title: "Detail Tipe Cuti", permission: "getLeaveType" } },
      { path: "cabang", name: "cabang", component: () => import("@/features/branches/views/BranchesView.vue"), meta: { title: "Manajemen Cabang", permission: "listBranch" } },
      { path: "cabang/:id", name: "cabang-detail", component: () => import("@/features/branches/views/BranchDetailView.vue"), meta: { title: "Detail Cabang", permission: "getBranch" } },
      { path: "penggajian", name: "penggajian", component: () => import("@/features/payroll/views/PayrollView.vue"), meta: { title: "Manajemen Penggajian", soon: true, permission: "payrolls" } },
      { path: "kehadiran", name: "kehadiran", component: () => import("@/features/attendance/views/AttendanceView.vue"), meta: { title: "Monitoring Kehadiran", permission: "listAttendance" } },
      { path: "cuti", name: "cuti", component: () => import("@/features/leaveApprovals/views/LeaveTransactionView.vue"), meta: { title: "Cuti & Izin", permission: ["listLeave", "listLeaveApproval", "listLeaveBalance", "listLeaveBalanceTransaction"] } },
      { path: "pengumuman", name: "pengumuman", component: () => import("@/features/announcements/views/AnnouncementsView.vue"), meta: { title: "Pengumuman", permission: "listAnnouncement" } },
      { path: "pengumuman/buat", name: "pengumuman-buat", component: () => import("@/features/announcements/views/AnnouncementCreateView.vue"), meta: { title: "Buat Pengumuman", permission: "createAnnouncement" } },
      { path: "pengumuman/:id/edit", name: "pengumuman-edit", component: () => import("@/features/announcements/views/AnnouncementCreateView.vue"), meta: { title: "Ubah Pengumuman", permission: "editAnnouncement" } },
      { path: "rekrutmen", name: "rekrutmen", component: () => import("@/features/recruitment/views/RecruitmentView.vue"), meta: { title: "Rekrutmen", soon: true, permission: ["applicants", "jobs"] } },
      { path: "laporan", name: "laporan", component: () => import("@/features/reports/views/ReportsView.vue"), meta: { title: "Laporan", soon: true, permission: "reports" } },
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

  // Modul "Soon" (belum selesai) tidak bisa dibuka siapa pun, termasuk superuser.
  if (to.meta.soon) {
    return { path: "/dashboard" };
  }

  // Gate permission per-operasi (UX saja — API tetap menegakkan). Superuser
  // otomatis lolos lewat auth.can(). Berlaku untuk super admin & non-super:
  // menu yang izinnya tak dimiliki akan diarahkan ke halaman 403.
  if (to.meta.permission && !auth.can(to.meta.permission)) {
    return { name: "forbidden" };
  }
});
