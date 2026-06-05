import { computed, reactive } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  JOBS,
  APPLICANTS,
  RECRUITMENT_STATS,
  CREATE_JOB,
  MOVE_APPLICANT_STAGE,
} from "../graphql/recruitment.queries";

export function useRecruitment() {
  const jobFilters = reactive({ search: "", status: "" });
  const applFilters = reactive({ search: "", stage: "", job: "" });

  const { result: jobsRes, loading: jobsLoading, refetch: refetchJobs } = useQuery(
    JOBS,
    () => ({ search: jobFilters.search || null, status: jobFilters.status || null }),
    { fetchPolicy: "cache-and-network" },
  );

  const { result: applRes, loading: applLoading, refetch: refetchAppl } = useQuery(
    APPLICANTS,
    () => ({
      search: applFilters.search || null,
      stage: applFilters.stage || null,
      job: applFilters.job || null,
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const { result: statsRes, refetch: refetchStats } = useQuery(RECRUITMENT_STATS);

  const jobs = computed(() => jobsRes.value?.jobs ?? []);
  const applicants = computed(() => applRes.value?.applicants ?? []);
  const stats = computed(() => statsRes.value?.recruitmentStats ?? null);
  const stageCounts = computed(() => {
    const map = {};
    (statsRes.value?.stageCounts ?? []).forEach((s) => (map[s.stage] = s.count));
    return map;
  });

  const { mutate: createJobMut } = useMutation(CREATE_JOB);
  const { mutate: moveMut } = useMutation(MOVE_APPLICANT_STAGE);

  async function createJob(input) {
    await createJobMut({ input });
    await Promise.all([refetchJobs(), refetchStats()]);
  }

  async function moveStage(id, stage) {
    await moveMut({ id, stage });
    await Promise.all([refetchAppl(), refetchStats()]);
  }

  return {
    jobFilters,
    applFilters,
    jobs,
    applicants,
    stats,
    stageCounts,
    jobsLoading,
    applLoading,
    createJob,
    moveStage,
  };
}
