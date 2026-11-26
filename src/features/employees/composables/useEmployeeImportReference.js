import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_BRANCH } from "@/features/branches/graphql/branch.queries";
import { LIST_LEVEL } from "@/features/levels/graphql/level.queries";
import { LIST_EMPLOYMENT_TYPE } from "@/features/employmentTypes/graphql/employmentType.queries";
import { LIST_WORK_PATTERN } from "@/features/workPatterns/graphql/workPattern.queries";
import { LIST_COMPANY } from "@/features/companies/graphql/company.queries";
import { LIST_UNIT } from "@/features/units/graphql/unit.queries";
import { LIST_EMPLOYEE } from "../graphql/employee.queries";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";

// Data referensi untuk modal impor karyawan: pemetaan id → nama tiap dimensi
// (cabang/level/tipe kepegawaian/pola kerja/perusahaan/unit + atasan) agar
// pengisi CSV tahu id yang valid, plus enum agama & status pernikahan.
//
// Tiap dimensi id memakai pola seperti list biasa: hanya 10 teratas lalu dicari
// via server (`search`). Query tiap dimensi baru jalan saat dimensi itu dibuka
// (`openKey`) & modal terbuka (`enabled`), jadi hemat request. `search` reaktif
// memicu refetch. Enum kecil → diambil semua & disaring di klien.
export function useEmployeeImportReference(enabled, openKey, search) {
  // Resolusi nilai yang bisa berupa ref ATAU getter function.
  const read = (v) => (typeof v === "function" ? v() : unref(v));

  // Variabel bersama: 10 teratas + kata kunci pencarian (berlaku untuk dimensi
  // yang sedang terbuka; dimensi lain non-aktif sehingga tak ikut terpengaruh).
  const vars = () => ({
    params: { page: 1, pageSize: 10, search: read(search)?.trim() || undefined },
  });
  // Query hanya aktif untuk dimensi yang sedang dibuka (hemat jaringan).
  const gate = (key) => () => ({ enabled: !!read(enabled) && read(openKey) === key });

  const branchQ = useQuery(LIST_BRANCH, vars, gate("branch"));
  const levelQ = useQuery(LIST_LEVEL, vars, gate("level"));
  const employmentQ = useQuery(LIST_EMPLOYMENT_TYPE, vars, gate("employment"));
  const workPatternQ = useQuery(LIST_WORK_PATTERN, vars, gate("workPattern"));
  const companyQ = useQuery(LIST_COMPANY, vars, gate("company"));
  const unitQ = useQuery(LIST_UNIT, vars, gate("unit"));
  const employeeQ = useQuery(LIST_EMPLOYEE, vars, gate("employee"));

  // Pilih hanya id & nama; enum citizenship sengaja tak diikut — itu free text.
  const pick = (res, key) =>
    (res.value?.[key]?.data?.results ?? []).map((r) => ({ id: r.id, name: r.name }));

  const branches = computed(() => pick(branchQ.result, "listBranch"));
  const levels = computed(() => pick(levelQ.result, "listLevel"));
  const employmentTypes = computed(() => pick(employmentQ.result, "listEmploymentType"));
  const workPatterns = computed(() => pick(workPatternQ.result, "listWorkPattern"));
  const companies = computed(() => pick(companyQ.result, "listCompany"));
  const units = computed(() => pick(unitQ.result, "listUnit"));
  // Karyawan: nama = fullName (+ unit bila ada) agar jelas saat jadi atasan.
  const employees = computed(() =>
    (employeeQ.result.value?.listEmployee?.data?.results ?? []).map((e) => {
      const unitNames = (e.units ?? []).map((u) => u.name).filter(Boolean).join(", ");
      return {
        id: e.id,
        name: unitNames ? `${e.fullName} · ${unitNames}` : e.fullName,
      };
    }),
  );

  // Enum: `value` (dikirim ke backend, mis. "ISLAM") + `label` (tampilan "Islam").
  const { options: religions } = useEnumChoices("RELIGION");
  const { options: maritalStatuses } = useEnumChoices("MARITAL_STATUS");

  // Loading = query dimensi yang sedang aktif (yang lain non-aktif → false).
  const loading = computed(
    () =>
      branchQ.loading.value ||
      levelQ.loading.value ||
      employmentQ.loading.value ||
      workPatternQ.loading.value ||
      companyQ.loading.value ||
      unitQ.loading.value ||
      employeeQ.loading.value,
  );

  return {
    branches,
    levels,
    employmentTypes,
    workPatterns,
    companies,
    units,
    employees,
    religions,
    maritalStatuses,
    loading,
  };
}
