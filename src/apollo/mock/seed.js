// ──────────────────────────────────────────────────────────────
// Seed data — diport dari resources/js/services/dummy-data.js
// Dipakai oleh skema GraphQL mock (apollo/mock/schema.js).
// Array bersifat mutable agar mutation (create/update/delete) bekerja in-memory.
// ──────────────────────────────────────────────────────────────

export const employees = [
  { id: "EMP-001", name: "Rizky Aditya", dept: "Engineering", position: "Senior Developer", join: "12 Jan 2021", status: "active", email: "rizky@maztagroup.com", phone: "081234567890" },
  { id: "EMP-002", name: "Sari Dewi", dept: "HR", position: "HR Specialist", join: "03 Mar 2020", status: "active", email: "sari@maztagroup.com", phone: "081234567891" },
  { id: "EMP-003", name: "Budi Santoso", dept: "Finance", position: "Finance Analyst", join: "17 Jul 2019", status: "active", email: "budi@maztagroup.com", phone: "081234567892" },
  { id: "EMP-004", name: "Dinda Larasati", dept: "Marketing", position: "Brand Manager", join: "05 Sep 2022", status: "active", email: "dinda@maztagroup.com", phone: "081234567893" },
  { id: "EMP-005", name: "Fajar Nugroho", dept: "Engineering", position: "Backend Dev", join: "22 Feb 2023", status: "inactive", email: "fajar@maztagroup.com", phone: "081234567894" },
  { id: "EMP-006", name: "Hana Putri", dept: "Operations", position: "Ops Coordinator", join: "11 Nov 2021", status: "active", email: "hana@maztagroup.com", phone: "081234567895" },
  { id: "EMP-007", name: "Ivan Prasetyo", dept: "IT", position: "SysAdmin", join: "08 Apr 2020", status: "active", email: "ivan@maztagroup.com", phone: "081234567896" },
  { id: "EMP-008", name: "Jeny Kusuma", dept: "Legal", position: "Legal Counsel", join: "29 Jun 2022", status: "active", email: "jeny@maztagroup.com", phone: "081234567897" },
];

export const payroll = [
  { id: "PAY-2404-001", emp: "Rizky Aditya", dept: "Engineering", period: "April 2026", basic: 12000000, allowance: 2500000, deduction: 450000, net: 14050000, status: "paid", date: "01 May 2026" },
  { id: "PAY-2404-002", emp: "Sari Dewi", dept: "HR", period: "April 2026", basic: 9000000, allowance: 1800000, deduction: 350000, net: 10450000, status: "paid", date: "01 May 2026" },
  { id: "PAY-2404-003", emp: "Budi Santoso", dept: "Finance", period: "April 2026", basic: 10000000, allowance: 2000000, deduction: 400000, net: 11600000, status: "pending", date: "—" },
  { id: "PAY-2404-004", emp: "Dinda Larasati", dept: "Marketing", period: "April 2026", basic: 11000000, allowance: 2200000, deduction: 420000, net: 12780000, status: "paid", date: "01 May 2026" },
  { id: "PAY-2404-005", emp: "Fajar Nugroho", dept: "Engineering", period: "April 2026", basic: 8500000, allowance: 1500000, deduction: 300000, net: 9700000, status: "unpaid", date: "—" },
  { id: "PAY-2404-006", emp: "Hana Putri", dept: "Operations", period: "April 2026", basic: 8000000, allowance: 1600000, deduction: 320000, net: 9280000, status: "pending", date: "—" },
];

export const attendance = [
  { id: "ATT-001", date: "24 Apr 2026", emp: "Rizky Aditya", dept: "Engineering", checkIn: "08:02", checkOut: "17:05", hours: "9h 3m", status: "ontime" },
  { id: "ATT-002", date: "24 Apr 2026", emp: "Sari Dewi", dept: "HR", checkIn: "08:45", checkOut: "17:00", hours: "8h 15m", status: "late" },
  { id: "ATT-003", date: "24 Apr 2026", emp: "Budi Santoso", dept: "Finance", checkIn: "07:55", checkOut: "17:10", hours: "9h 15m", status: "ontime" },
  { id: "ATT-004", date: "24 Apr 2026", emp: "Dinda Larasati", dept: "Marketing", checkIn: "—", checkOut: "—", hours: "—", status: "absent" },
  { id: "ATT-005", date: "24 Apr 2026", emp: "Fajar Nugroho", dept: "Engineering", checkIn: "09:10", checkOut: "17:00", hours: "7h 50m", status: "late" },
  { id: "ATT-006", date: "24 Apr 2026", emp: "Hana Putri", dept: "Operations", checkIn: "—", checkOut: "—", hours: "—", status: "leave" },
  { id: "ATT-007", date: "24 Apr 2026", emp: "Ivan Prasetyo", dept: "IT", checkIn: "08:00", checkOut: "17:00", hours: "9h 0m", status: "ontime" },
  { id: "ATT-008", date: "24 Apr 2026", emp: "Jeny Kusuma", dept: "Legal", checkIn: "08:30", checkOut: "17:30", hours: "9h 0m", status: "ontime" },
];

export const leaves = [
  { id: "LV-2604-001", emp: "Hana Putri", type: "Cuti Tahunan", from: "22 Apr 2026", to: "25 Apr 2026", days: 4, reason: "Keperluan keluarga", status: "approved", applied: "18 Apr 2026" },
  { id: "LV-2604-002", emp: "Sari Dewi", type: "Izin Sakit", from: "24 Apr 2026", to: "24 Apr 2026", days: 1, reason: "Demam", status: "approved", applied: "24 Apr 2026" },
  { id: "LV-2604-003", emp: "Fajar Nugroho", type: "Izin Pribadi", from: "25 Apr 2026", to: "25 Apr 2026", days: 1, reason: "Urusan administrasi", status: "pending", applied: "23 Apr 2026" },
  { id: "LV-2604-004", emp: "Budi Santoso", type: "Cuti Tahunan", from: "28 Apr 2026", to: "02 May 2026", days: 5, reason: "Liburan", status: "pending", applied: "20 Apr 2026" },
  { id: "LV-2604-005", emp: "Ivan Prasetyo", type: "Izin Mendesak", from: "23 Apr 2026", to: "23 Apr 2026", days: 1, reason: "Keluarga sakit", status: "rejected", applied: "23 Apr 2026" },
  { id: "LV-2604-006", emp: "Dinda Larasati", type: "Cuti Bersama", from: "01 May 2026", to: "02 May 2026", days: 2, reason: "Hari Buruh", status: "approved", applied: "15 Apr 2026" },
];

export const jobs = [
  { id: "JOB-001", title: "Frontend Developer", dept: "Engineering", quota: 2, applied: 12, deadline: "30 Apr 2026", status: "open" },
  { id: "JOB-002", title: "HR Business Partner", dept: "HR", quota: 1, applied: 7, deadline: "05 May 2026", status: "open" },
  { id: "JOB-003", title: "Finance Analyst", dept: "Finance", quota: 1, applied: 9, deadline: "28 Apr 2026", status: "open" },
  { id: "JOB-004", title: "UI/UX Designer", dept: "Product", quota: 1, applied: 18, deadline: "15 Apr 2026", status: "closed" },
  { id: "JOB-005", title: "Backend Engineer", dept: "Engineering", quota: 3, applied: 22, deadline: "10 May 2026", status: "open" },
  { id: "JOB-006", title: "Digital Marketing Specialist", dept: "Marketing", quota: 1, applied: 14, deadline: "20 Apr 2026", status: "closed" },
];

export const applicants = [
  { id: "APL-001", name: "Andi Setiawan", job: "Frontend Developer", email: "andi.s@email.com", stage: "interview", applied: "10 Apr 2026", status: "active" },
  { id: "APL-002", name: "Putri Rahayu", job: "Frontend Developer", email: "putri.r@email.com", stage: "screening", applied: "12 Apr 2026", status: "active" },
  { id: "APL-003", name: "Reza Mahendra", job: "Backend Engineer", email: "reza.m@email.com", stage: "offer", applied: "08 Apr 2026", status: "active" },
  { id: "APL-004", name: "Novita Sari", job: "HR Business Partner", email: "novita.s@email.com", stage: "interview", applied: "14 Apr 2026", status: "active" },
  { id: "APL-005", name: "Dian Pratama", job: "Finance Analyst", email: "dian.p@email.com", stage: "screening", applied: "16 Apr 2026", status: "active" },
  { id: "APL-006", name: "Yoga Permana", job: "Backend Engineer", email: "yoga.p@email.com", stage: "hired", applied: "02 Apr 2026", status: "hired" },
  { id: "APL-007", name: "Laila Nurhayati", job: "UI/UX Designer", email: "laila.n@email.com", stage: "rejected", applied: "05 Apr 2026", status: "rejected" },
  { id: "APL-008", name: "Guntur Wibowo", job: "Backend Engineer", email: "guntur.w@email.com", stage: "interview", applied: "11 Apr 2026", status: "active" },
  { id: "APL-009", name: "Mega Lestari", job: "Digital Marketing Specialist", email: "mega.l@email.com", stage: "hired", applied: "28 Mar 2026", status: "hired" },
  { id: "APL-010", name: "Arif Hidayat", job: "Finance Analyst", email: "arif.h@email.com", stage: "offer", applied: "09 Apr 2026", status: "active" },
];

// ── Reports: tren bulanan & headcount ────────────────────────
export const monthlyAttendance = [
  { month: "Nov", ontime: 210, late: 18, absent: 5 },
  { month: "Des", ontime: 195, late: 22, absent: 8 },
  { month: "Jan", ontime: 220, late: 15, absent: 4 },
  { month: "Feb", ontime: 208, late: 20, absent: 6 },
  { month: "Mar", ontime: 230, late: 12, absent: 3 },
  { month: "Apr", ontime: 218, late: 16, absent: 7 },
];

export const monthlyPayroll = [
  { month: "Nov", total: 185000000, basic: 152000000, allowance: 38000000, deduction: 5000000 },
  { month: "Des", total: 210000000, basic: 175000000, allowance: 42000000, deduction: 7000000 },
  { month: "Jan", total: 192000000, basic: 158000000, allowance: 39000000, deduction: 5000000 },
  { month: "Feb", total: 188000000, basic: 155000000, allowance: 38000000, deduction: 5000000 },
  { month: "Mar", total: 196000000, basic: 161000000, allowance: 40000000, deduction: 5000000 },
  { month: "Apr", total: 201000000, basic: 165000000, allowance: 41000000, deduction: 5000000 },
];

export const deptHeadcount = [
  { dept: "Engineering", total: 14, active: 13, inactive: 1 },
  { dept: "HR", total: 6, active: 6, inactive: 0 },
  { dept: "Finance", total: 8, active: 7, inactive: 1 },
  { dept: "Marketing", total: 7, active: 7, inactive: 0 },
  { dept: "Operations", total: 9, active: 8, inactive: 1 },
  { dept: "IT", total: 5, active: 5, inactive: 0 },
  { dept: "Legal", total: 4, active: 4, inactive: 0 },
  { dept: "Product", total: 5, active: 5, inactive: 0 },
];

// Bar chart kehadiran mingguan (angka diport dari modules/dashboard.js)
export const attendanceWeekly = [
  { day: "Senin", present: 48, late: 5, absent: 2 },
  { day: "Selasa", present: 50, late: 3, absent: 2 },
  { day: "Rabu", present: 47, late: 6, absent: 2 },
  { day: "Kamis", present: 49, late: 4, absent: 2 },
  { day: "Jum'at", present: 45, late: 7, absent: 3 },
];

// Aktivitas terbaru (diport dari modules/dashboard.js)
export const activities = [
  { id: "A1", text: "Hana Putri mengajukan Cuti Tahunan 4 hari", time: "2 jam lalu", color: "#2884E8" },
  { id: "A2", text: "Payroll April — 4 dari 6 sudah diproses", time: "3 jam lalu", color: "#1B9C67" },
  { id: "A3", text: "Fajar Nugroho terlambat 70 menit", time: "5 jam lalu", color: "#D98E18" },
  { id: "A4", text: "Ivan Prasetyo login admin pukul 08:00", time: "6 jam lalu", color: "#243B8F" },
  { id: "A5", text: "Dinda Larasati tidak hadir tanpa keterangan", time: "7 jam lalu", color: "#D14343" },
];

// Akun demo untuk login mock (kontrak auth: username/password + flag staf).
export const users = [
  {
    id: "USR-001",
    username: "admin",
    email: "admin@maztagroup.com",
    password: "password",
    isStaff: true,
    isActive: true,
    isSuperuser: true,
    employee: {
      id: "EMP-001",
      firstName: "Admin",
      fullName: "Admin MAHIR",
      lastName: "MAHIR",
      level: { id: "1", name: "Super Admin" },
      units: [{ id: "1", name: "IT" }],
    },
  },
];
