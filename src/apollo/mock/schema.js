// ──────────────────────────────────────────────────────────────
// Skema GraphQL mock in-memory.
// makeExecutableSchema + resolver di atas data seed, dipakai oleh
// SchemaLink (apollo/client.js) selama backend GraphQL belum tersedia.
// ──────────────────────────────────────────────────────────────
import { makeExecutableSchema } from "@graphql-tools/schema";
import * as seed from "./seed";

const typeDefs = /* GraphQL */ `
  type Employee {
    id: ID!
    name: String!
    email: String
    phone: String
    dept: String!
    position: String!
    join: String
    status: String!
  }

  type EmployeeStats {
    total: Int!
    active: Int!
    inactive: Int!
    departments: Int!
  }

  type DashboardStats {
    totalEmployees: Int!
    presentToday: Int!
    pendingLeaves: Int!
    pendingPayroll: Int!
    employeesDelta: String
    totalHeadcount: Int!
  }

  type AttendanceDay {
    day: String!
    present: Int!
    late: Int!
    absent: Int!
  }

  type DeptCount {
    dept: String!
    count: Int!
  }

  type Activity {
    id: ID!
    text: String!
    time: String!
    color: String!
  }

  type Leave {
    id: ID!
    emp: String!
    type: String!
    from: String!
    to: String!
    dateRange: String!
    days: Int!
    reason: String
    status: String!
    applied: String!
  }

  type LeaveStats {
    total: Int!
    pending: Int!
    approved: Int!
    rejected: Int!
  }

  type Payroll {
    id: ID!
    emp: String!
    dept: String!
    period: String!
    basic: Float!
    allowance: Float!
    deduction: Float!
    net: Float!
    status: String!
    date: String!
  }

  type PayrollStats {
    totalNet: Float!
    paidNet: Float!
    countPaid: Int!
    countPending: Int!
  }

  type AttendanceRecord {
    id: ID!
    date: String!
    emp: String!
    dept: String!
    checkIn: String!
    checkOut: String!
    hours: String!
    status: String!
  }

  type AttendanceStats {
    ontime: Int!
    late: Int!
    absent: Int!
    leave: Int!
  }

  type Job {
    id: ID!
    title: String!
    dept: String!
    quota: Int!
    applied: Int!
    deadline: String!
    status: String!
  }

  type Applicant {
    id: ID!
    name: String!
    job: String!
    email: String!
    stage: String!
    applied: String!
    status: String!
  }

  type RecruitmentStats {
    openJobs: Int!
    totalApplicants: Int!
    inProcess: Int!
    hired: Int!
  }

  type StageCount {
    stage: String!
    count: Int!
  }

  # ── Reports ──
  type MonthlyAttendance {
    month: String!
    ontime: Int!
    late: Int!
    absent: Int!
  }
  type MonthlyPayroll {
    month: String!
    total: Float!
    basic: Float!
    allowance: Float!
    deduction: Float!
  }
  type DeptHeadcount {
    dept: String!
    total: Int!
    active: Int!
    inactive: Int!
  }

  type User {
    id: ID!
    email: String!
    isStaff: Boolean!
    isActive: Boolean!
    isSuperuser: Boolean!
    username: String!
  }
  type AuthLevel {
    id: ID!
    name: String!
  }
  type AuthUnit {
    id: ID!
    name: String!
  }
  type AuthEmployee {
    id: ID!
    firstName: String
    fullName: String
    lastName: String
    level: AuthLevel
    units: [AuthUnit!]
  }
  type LoginData {
    employee: AuthEmployee
    token: String!
    user: User!
  }
  type LoginPayload {
    data: LoginData!
  }

  input EmployeeInput {
    name: String!
    email: String!
    phone: String
    dept: String!
    position: String!
    join: String
    status: String
  }

  input LeaveInput {
    emp: String!
    type: String!
    from: String!
    to: String!
    days: Int!
    reason: String
  }

  input JobInput {
    title: String!
    dept: String!
    quota: Int!
    deadline: String!
  }

  type Query {
    employees(search: String, dept: String, status: String): [Employee!]!
    employeeStats: EmployeeStats!
    dashboardStats: DashboardStats!
    attendanceWeekly: [AttendanceDay!]!
    departmentDistribution: [DeptCount!]!
    recentActivities: [Activity!]!
    pendingLeaves: [Leave!]!

    leaves(search: String, status: String): [Leave!]!
    leaveStats: LeaveStats!

    payrolls(search: String, status: String): [Payroll!]!
    payrollStats: PayrollStats!

    attendanceRecords(search: String, status: String): [AttendanceRecord!]!
    attendanceStats: AttendanceStats!

    jobs(search: String, status: String): [Job!]!
    applicants(search: String, stage: String, job: String): [Applicant!]!
    recruitmentStats: RecruitmentStats!
    stageCounts: [StageCount!]!

    monthlyAttendance: [MonthlyAttendance!]!
    monthlyPayroll: [MonthlyPayroll!]!
    deptHeadcount: [DeptHeadcount!]!

    me: User
  }

  type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!

    approveLeave(id: ID!): Leave!
    rejectLeave(id: ID!): Leave!
    createLeave(input: LeaveInput!): Leave!

    processPayroll(id: ID!): Payroll!
    processAllPayroll: [Payroll!]!

    createJob(input: JobInput!): Job!
    moveApplicantStage(id: ID!, stage: String!): Applicant!

    login(username: String!, password: String!): LoginPayload!
  }
`;

// ── Helpers ──
function nextId(list, prefix, pad = 3) {
  const max = list.reduce((m, item) => {
    const n = parseInt(String(item.id).replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(pad, "0")}`;
}

function textMatch(haystack, q) {
  return haystack.some((s) => String(s).toLowerCase().includes(q));
}

// Bentuk User publik (tanpa password) sesuai kontrak GraphQL auth.
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    isStaff: !!u.isStaff,
    isActive: !!u.isActive,
    isSuperuser: !!u.isSuperuser,
    username: u.username,
  };
}

const resolvers = {
  Leave: {
    dateRange: (l) => l.dateRange || `${l.from} → ${l.to}`,
  },

  Query: {
    employees: (_, { search, dept, status }) => {
      let list = [...seed.employees];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((e) => textMatch([e.name, e.id, e.dept], q));
      }
      if (dept) list = list.filter((e) => e.dept === dept);
      if (status) list = list.filter((e) => e.status === status);
      return list;
    },
    employeeStats: () => {
      const active = seed.employees.filter((e) => e.status === "active").length;
      const departments = new Set(seed.employees.map((e) => e.dept)).size;
      return { total: seed.employees.length, active, inactive: seed.employees.length - active, departments };
    },
    dashboardStats: () => ({
      totalEmployees: seed.employees.length,
      presentToday: seed.attendance.filter((a) => a.status === "ontime" || a.status === "late").length,
      pendingLeaves: seed.leaves.filter((l) => l.status === "pending").length,
      pendingPayroll: seed.payroll.filter((p) => p.status === "pending").length,
      employeesDelta: "+ 2 bulan ini",
      totalHeadcount: 55,
    }),
    attendanceWeekly: () => seed.attendanceWeekly,
    departmentDistribution: () => {
      const counts = seed.employees.reduce((acc, e) => {
        acc[e.dept] = (acc[e.dept] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts).map(([dept, count]) => ({ dept, count }));
    },
    recentActivities: () => seed.activities,
    pendingLeaves: () => seed.leaves.filter((l) => l.status === "pending"),

    leaves: (_, { search, status }) => {
      let list = [...seed.leaves];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((l) => textMatch([l.emp, l.type], q));
      }
      if (status) list = list.filter((l) => l.status === status);
      return list;
    },
    leaveStats: () => ({
      total: seed.leaves.length,
      pending: seed.leaves.filter((l) => l.status === "pending").length,
      approved: seed.leaves.filter((l) => l.status === "approved").length,
      rejected: seed.leaves.filter((l) => l.status === "rejected").length,
    }),

    payrolls: (_, { search, status }) => {
      let list = [...seed.payroll];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => textMatch([p.emp, p.id], q));
      }
      if (status) list = list.filter((p) => p.status === status);
      return list;
    },
    payrollStats: () => ({
      totalNet: seed.payroll.reduce((s, p) => s + p.net, 0),
      paidNet: seed.payroll.filter((p) => p.status === "paid").reduce((s, p) => s + p.net, 0),
      countPaid: seed.payroll.filter((p) => p.status === "paid").length,
      countPending: seed.payroll.filter((p) => p.status !== "paid").length,
    }),

    attendanceRecords: (_, { search, status }) => {
      let list = [...seed.attendance];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((a) => textMatch([a.emp, a.dept], q));
      }
      if (status) list = list.filter((a) => a.status === status);
      return list;
    },
    attendanceStats: () => ({
      ontime: seed.attendance.filter((a) => a.status === "ontime").length,
      late: seed.attendance.filter((a) => a.status === "late").length,
      absent: seed.attendance.filter((a) => a.status === "absent").length,
      leave: seed.attendance.filter((a) => a.status === "leave").length,
    }),

    jobs: (_, { search, status }) => {
      let list = [...seed.jobs];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((j) => textMatch([j.title, j.dept], q));
      }
      if (status) list = list.filter((j) => j.status === status);
      return list;
    },
    applicants: (_, { search, stage, job }) => {
      let list = [...seed.applicants];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((a) => textMatch([a.name, a.job], q));
      }
      if (stage) list = list.filter((a) => a.stage === stage);
      if (job) list = list.filter((a) => a.job === job);
      return list;
    },
    recruitmentStats: () => ({
      openJobs: seed.jobs.filter((j) => j.status === "open").length,
      totalApplicants: seed.applicants.length,
      inProcess: seed.applicants.filter((a) => ["screening", "interview", "offer"].includes(a.stage)).length,
      hired: seed.applicants.filter((a) => a.stage === "hired").length,
    }),
    stageCounts: () =>
      ["screening", "interview", "offer", "hired", "rejected"].map((stage) => ({
        stage,
        count: seed.applicants.filter((a) => a.stage === stage).length,
      })),

    monthlyAttendance: () => seed.monthlyAttendance,
    monthlyPayroll: () => seed.monthlyPayroll,
    deptHeadcount: () => seed.deptHeadcount,

    me: () => publicUser(seed.users[0]),
  },

  Mutation: {
    createEmployee: (_, { input }) => {
      const emp = { id: nextId(seed.employees, "EMP"), join: "—", status: "active", ...input };
      seed.employees.push(emp);
      return emp;
    },
    updateEmployee: (_, { id, input }) => {
      const emp = seed.employees.find((e) => e.id === id);
      if (!emp) throw new Error(`Karyawan ${id} tidak ditemukan`);
      Object.assign(emp, input);
      return emp;
    },
    deleteEmployee: (_, { id }) => {
      const idx = seed.employees.findIndex((e) => e.id === id);
      if (idx === -1) return false;
      seed.employees.splice(idx, 1);
      return true;
    },

    approveLeave: (_, { id }) => setLeaveStatus(id, "approved"),
    rejectLeave: (_, { id }) => setLeaveStatus(id, "rejected"),
    createLeave: (_, { input }) => {
      const leave = {
        id: nextId(seed.leaves, "LV"),
        status: "pending",
        applied: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        ...input,
      };
      seed.leaves.push(leave);
      return leave;
    },

    processPayroll: (_, { id }) => {
      const p = seed.payroll.find((x) => x.id === id);
      if (!p) throw new Error(`Slip ${id} tidak ditemukan`);
      p.status = "paid";
      p.date = "01 May 2026";
      return p;
    },
    processAllPayroll: () => {
      seed.payroll.forEach((p) => {
        if (p.status !== "paid") {
          p.status = "paid";
          p.date = "01 May 2026";
        }
      });
      return seed.payroll;
    },

    createJob: (_, { input }) => {
      const job = { id: nextId(seed.jobs, "JOB"), applied: 0, status: "open", ...input };
      seed.jobs.push(job);
      return job;
    },
    moveApplicantStage: (_, { id, stage }) => {
      const ap = seed.applicants.find((a) => a.id === id);
      if (!ap) throw new Error(`Pelamar ${id} tidak ditemukan`);
      ap.stage = stage;
      ap.status = stage === "hired" ? "hired" : stage === "rejected" ? "rejected" : "active";
      return ap;
    },

    login: (_, { username, password }) => {
      // Hanya akun seed yang cocok username + password yang boleh login.
      const account = seed.users.find((u) => u.username === username && u.password === password);
      if (!account) throw new Error("Please check your username or password.");
      return {
        data: {
          employee: account.employee || null,
          token: `mock-token-${Date.now()}`,
          user: publicUser(account),
        },
      };
    },
  },
};

function setLeaveStatus(id, status) {
  const leave = seed.leaves.find((l) => l.id === id);
  if (!leave) throw new Error(`Pengajuan ${id} tidak ditemukan`);
  leave.status = status;
  return leave;
}

export const schema = makeExecutableSchema({ typeDefs, resolvers });
