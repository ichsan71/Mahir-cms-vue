import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { REPORTS } from "../graphql/report.queries";

// Layer logika laporan: ambil data agregat lalu hitung ringkasan per tab
// (port dari modules/reports.js).
export function useReports() {
  const { result, loading } = useQuery(REPORTS);

  const monthlyAttendance = computed(() => result.value?.monthlyAttendance ?? []);
  const monthlyPayroll = computed(() => result.value?.monthlyPayroll ?? []);
  const deptHeadcount = computed(() => result.value?.deptHeadcount ?? []);
  const employeeStats = computed(() => result.value?.employeeStats ?? null);
  const leaves = computed(() => result.value?.leaves ?? []);

  const months = computed(() => monthlyAttendance.value.map((d) => d.month));

  // ── Tab Kehadiran ──
  const attendance = computed(() => {
    const ot = monthlyAttendance.value.reduce((a, b) => a + b.ontime, 0);
    const lt = monthlyAttendance.value.reduce((a, b) => a + b.late, 0);
    const ab = monthlyAttendance.value.reduce((a, b) => a + b.absent, 0);
    const total = ot + lt + ab;
    const rate = total ? Math.round((ot / total) * 100) : 0;
    const deptRows = deptHeadcount.value.map((d) => {
      const o = Math.round(d.active * 20 * 0.89);
      const l = Math.round(d.active * 20 * 0.08);
      const a = Math.round(d.active * 20 * 0.03);
      const r = Math.round((o / (o + l + a)) * 100);
      return { dept: d.dept, active: d.active, ot: o, late: l, absent: a, rate: r };
    });
    return { ontime: ot, late: lt, absent: ab, rate, deptRows };
  });

  // ── Tab Penggajian ──
  const payroll = computed(() => {
    const last = monthlyPayroll.value[monthlyPayroll.value.length - 1] || { total: 0, basic: 0, allowance: 0, deduction: 0 };
    const deptRows = deptHeadcount.value.map((d) => {
      const total = d.active * 10000000;
      return { dept: d.dept, count: d.active, total, avg: d.active ? Math.round(total / d.active) : 0 };
    });
    return { ...last, deptRows };
  });

  // ── Tab Cuti ──
  const leaveReport = computed(() => {
    const total = leaves.value.length;
    const approved = leaves.value.filter((l) => l.status === "approved").length;
    const pending = leaves.value.filter((l) => l.status === "pending").length;
    const totalDays = leaves.value.reduce((a, b) => a + b.days, 0);
    const typeMap = {};
    leaves.value.forEach((l) => (typeMap[l.type] = (typeMap[l.type] || 0) + l.days));
    const types = Object.entries(typeMap).map(([type, days]) => ({
      type,
      days,
      pct: totalDays ? Math.round((days / totalDays) * 100) : 0,
    }));
    return { total, approved, pending, totalDays, types };
  });

  return {
    loading,
    months,
    monthlyAttendance,
    monthlyPayroll,
    deptHeadcount,
    employeeStats,
    attendance,
    payroll,
    leaveReport,
  };
}
