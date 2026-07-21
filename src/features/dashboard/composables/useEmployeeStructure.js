import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_ROOT_EMPLOYEE } from "../graphql/dashboard.queries";

// `childrenTree` bisa datang sebagai array objek, satu objek, atau string JSON
// (tergantung serialisasi scalar backend). Normalkan selalu ke array.
function asArray(tree) {
  if (!tree) return [];
  let v = tree;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v : [v];
}

// Ubah satu node ke bentuk seragam { id, name, code, units, children }.
// Root memakai camelCase (fullName) & punya units; anak di childrenTree memakai
// snake_case (full_name/childrens) dan tak selalu punya units.
function normalizeNode(node) {
  if (!node) return null;
  const rawChildren = node.childrenTree ?? node.childrens ?? [];
  return {
    id: node.id,
    name: node.fullName ?? node.full_name ?? "—",
    code: node.code ?? null,
    units: node.units ?? [],
    children: asArray(rawChildren).map(normalizeNode).filter(Boolean),
  };
}

// Layer data struktur organisasi (getRootEmployee) untuk dashboard.
export function useEmployeeStructure() {
  const { result, loading, error, refetch } = useQuery(GET_ROOT_EMPLOYEE);

  const roots = computed(() =>
    (result.value?.getRootEmployee?.data ?? []).map(normalizeNode).filter(Boolean)
  );

  return { roots, loading, error, refetch };
}
