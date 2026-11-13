import { ref } from "vue";
import { useApolloClient } from "@vue/apollo-composable";
import { GET_PAYSLIP } from "../graphql/payslip.queries";
import { useToastStore } from "@/stores/toast.store";

// Fallback identitas perusahaan bila employee.companies kosong. Normalnya kop
// slip diambil dari `payslip.employee.companies[0]` (Company: name/legalName/
// npwp/logo). Company tidak punya alamat di schema → `address` opsional.
const COMPANY_FALLBACK = {
  name: "Perusahaan",
  legalName: "",
  npwp: "",
  logo: "",
  address: "",
};

// ── Util format ───────────────────────────────────────────────────────────────
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function money(v, currency) {
  const prefix = !currency || currency === "IDR" ? "Rp" : currency;
  return `${prefix} ${new Intl.NumberFormat("id-ID").format(Math.trunc(num(v)))}`;
}
function signedMoney(v, currency) {
  const n = num(v);
  return `${n < 0 ? "− " : "+ "}${money(Math.abs(n), currency)}`;
}
// Escape nilai teks yang masuk ke HTML (nama karyawan, keterangan, dll).
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
function dmy(v) {
  const m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "-";
  return `${m[3]} ${MONTHS_ID[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}
function monthLabel(v) {
  const m = String(v || "").match(/^(\d{4})-(\d{2})/);
  if (!m) return "";
  return `${MONTHS_ID[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

// Angka → terbilang Bahasa Indonesia (bilangan bulat, sampai triliun).
function terbilang(v) {
  const n = Math.floor(Math.abs(num(v)));
  if (n === 0) return "nol";
  const sat = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  const words = (x) => {
    if (x < 12) return sat[x];
    if (x < 20) return `${words(x - 10)} belas`;
    if (x < 100) return `${words(Math.floor(x / 10))} puluh${x % 10 ? ` ${words(x % 10)}` : ""}`;
    if (x < 200) return `seratus${x - 100 ? ` ${words(x - 100)}` : ""}`;
    if (x < 1000) return `${words(Math.floor(x / 100))} ratus${x % 100 ? ` ${words(x % 100)}` : ""}`;
    if (x < 2000) return `seribu${x - 1000 ? ` ${words(x - 1000)}` : ""}`;
    if (x < 1e6) return `${words(Math.floor(x / 1000))} ribu${x % 1000 ? ` ${words(x % 1000)}` : ""}`;
    if (x < 1e9) return `${words(Math.floor(x / 1e6))} juta${x % 1e6 ? ` ${words(x % 1e6)}` : ""}`;
    if (x < 1e12) return `${words(Math.floor(x / 1e9))} miliar${x % 1e9 ? ` ${words(x % 1e9)}` : ""}`;
    return `${words(Math.floor(x / 1e12))} triliun${x % 1e12 ? ` ${words(x % 1e12)}` : ""}`;
  };
  return words(n).replace(/\s+/g, " ").trim();
}
function terbilangRupiah(v) {
  const t = terbilang(v);
  return `${t.charAt(0).toUpperCase()}${t.slice(1)} rupiah`;
}

// ── Derivasi data slip ────────────────────────────────────────────────────────
function unitNames(emp) {
  return (emp?.units ?? []).map((u) => u.name).filter(Boolean).join(", ") || "—";
}
function sortedItems(p) {
  return [...(p?.items ?? [])].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}
// Identitas perusahaan: utamakan employee.companies[0] (legalName → name),
// lalu override eksplisit, lalu fallback.
function companyOf(p, override) {
  const c = (p?.employee?.companies ?? [])[0] ?? {};
  return {
    name: override?.name || c.legalName || c.name || COMPANY_FALLBACK.name,
    npwp: override?.npwp ?? c.npwp ?? COMPANY_FALLBACK.npwp,
    logo: override?.logo ?? c.logo ?? COMPANY_FALLBACK.logo,
    address: override?.address ?? COMPANY_FALLBACK.address,
  };
}

function buildPayslipHtml(payslip, options = {}) {
  const p = payslip || {};
  const company = companyOf(p, options.company);
  const cur = p.currency || "IDR";

  const items = sortedItems(p);
  const earnings = items.filter((i) => i.kind === "EARNING");
  const adjustments = items.filter((i) => i.kind === "ADJUSTMENT");

  // Baris potongan: potongan kehadiran (totalDeduction level-payslip) + BPJS
  // karyawan + PPh21. Selaras rumus net pay backend.
  const deductionRows = [];
  if (num(p.totalDeduction) !== 0) {
    const days = p.deduction?.absentDays ?? p.deduction?.unpaidLeaveDays;
    deductionRows.push({
      label: "Potongan Kehadiran",
      tag: days != null ? `${days} hari` : "",
      amount: num(p.totalDeduction),
    });
  }
  if (num(p.bpjsEmployee) !== 0) {
    deductionRows.push({ label: "BPJS Ketenagakerjaan & Kesehatan", tag: "Karyawan", amount: num(p.bpjsEmployee) });
  }
  if (num(p.pph21) !== 0) {
    deductionRows.push({ label: "PPh 21", tag: "", amount: num(p.pph21) });
  }
  const totalDeduction = deductionRows.reduce((s, r) => s + r.amount, 0);
  const adjustmentTotal = adjustments.reduce((s, i) => s + num(i.amount), 0);

  const earningRowsHtml = earnings.length
    ? earnings
        .map(
          (c) => `<tr><td class="desc">${esc(c.note || c.code || "—")}${
            c.prorated ? ' <span class="tag warn">prorata</span>' : ""
          }${c.category ? ` <span class="tag">${esc(c.category)}</span>` : ""}</td><td class="num">${money(
            c.amount,
            cur,
          )}</td></tr>`,
        )
        .join("")
    : `<tr><td class="desc muted">—</td><td class="num">${money(0, cur)}</td></tr>`;

  const deductionRowsHtml = deductionRows.length
    ? deductionRows
        .map(
          (d) => `<tr><td class="desc">${esc(d.label)}${
            d.tag ? ` <span class="tag">${esc(d.tag)}</span>` : ""
          }</td><td class="num">${money(d.amount, cur)}</td></tr>`,
        )
        .join("")
    : `<tr><td class="desc muted">Tidak ada potongan</td><td class="num">${money(0, cur)}</td></tr>`;

  const adjustmentBlock = adjustments.length
    ? `<section class="adjust">
        <div class="hd">Penyesuaian</div>
        <table>
          <tbody>
            ${adjustments
              .map(
                (it) =>
                  `<tr><td class="desc">${esc(it.note || it.code || "—")}</td><td class="num ${
                    num(it.amount) < 0 ? "neg" : "pos"
                  }">${signedMoney(it.amount, cur)}</td></tr>`,
              )
              .join("")}
            <tr><td class="desc total">Total Penyesuaian</td><td class="num ${
              adjustmentTotal < 0 ? "neg" : "pos"
            }">${signedMoney(adjustmentTotal, cur)}</td></tr>
          </tbody>
        </table>
      </section>`
    : "";

  const isFinal = String(p.status || "").toUpperCase() === "FINAL";
  const statusChip = isFinal
    ? `<span class="chip ok">Final</span>`
    : `<span class="chip">${esc(p.status || "Draf")}</span>`;

  const companyAddr = company.address ? `<div class="addr">${esc(company.address)}</div>` : "";
  const companyNpwp = company.npwp ? `<div class="addr">NPWP ${esc(company.npwp)}</div>` : "";
  const logoUrl = String(company.logo || "");
  const logoHtml = /^https?:\/\//i.test(logoUrl)
    ? `<img class="logo-img" src="${esc(logoUrl)}" alt="" />`
    : `<div class="logo">${esc((company.name || "M").trim().charAt(0).toUpperCase())}</div>`;

  const slipNo = `SLP/${String(p.periodEnd || "").slice(0, 7)}/${String(p.id ?? "").padStart(4, "0")}`;
  const title = `Slip Gaji ${monthLabel(p.periodEnd)} — ${p.employee?.fullName ?? ""}`.trim();

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  :root{
    --navy:#243B8F;--navy-deep:#111D3D;--navy-soft:#E7EEFF;--ink:#1A2233;--slate:#3C4659;
    --muted:#697587;--line:#E2E8F0;--line-soft:#EEF2F7;--pos:#1B9C67;--neg:#D14343;--gold:#C9A33B;
    --f-display:"Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;
    --f-body:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{background:#E8ECF3;color:var(--ink);font-family:var(--f-body);-webkit-font-smoothing:antialiased;line-height:1.5;padding:24px;}
  .sheet{width:100%;max-width:820px;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 18px 50px -20px rgba(16,27,54,.45);}
  .masthead{position:relative;background:var(--navy-deep);color:#fff;padding:26px 36px 24px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px;}
  .masthead::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,var(--navy) 0%,var(--navy) 62%,var(--gold) 62%,var(--gold) 100%);}
  .co{display:flex;gap:14px;align-items:center;}
  .co .logo{width:46px;height:46px;border-radius:11px;flex:none;background:#fff;color:var(--navy);display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:20px;letter-spacing:-.03em;}
  .co .logo-img{width:46px;height:46px;border-radius:11px;flex:none;background:#fff;object-fit:contain;padding:4px;}
  .co .name{font-family:var(--f-display);font-weight:700;font-size:18px;letter-spacing:-.01em;line-height:1.2;}
  .co .addr{font-size:11.5px;color:#AEBBD8;margin-top:3px;max-width:34ch;}
  .docmeta{text-align:right;flex:none;}
  .docmeta .t{font-family:var(--f-display);font-weight:800;font-size:15px;letter-spacing:.16em;text-transform:uppercase;}
  .docmeta .sub{font-size:11.5px;color:#AEBBD8;margin-top:4px;font-variant-numeric:tabular-nums;}
  .docmeta .period{margin-top:10px;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;}
  .chip{display:inline-block;margin-top:8px;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.14);color:#D7E0F5;border:1px solid rgba(255,255,255,.25);}
  .chip.ok{background:rgba(27,156,103,.18);color:#7EE3B4;border-color:rgba(126,227,180,.35);}
  .body{padding:30px 36px;}
  .emp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 28px;border:1px solid var(--line);border-radius:10px;padding:16px 20px;margin-bottom:26px;}
  .field{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px dashed var(--line-soft);}
  .field:nth-last-child(-n+2){border-bottom:0;}
  .field .k{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);white-space:nowrap;padding-top:2px;}
  .field .v{font-size:13.5px;font-weight:600;color:var(--slate);text-align:right;}
  .seclabel{font-family:var(--f-display);font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--navy);display:flex;align-items:center;gap:10px;margin:0 0 10px;}
  .seclabel::after{content:"";flex:1;height:1px;background:var(--line);}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  table.lines{width:100%;border-collapse:collapse;}
  table.lines td{padding:8px 0;font-size:13px;vertical-align:baseline;}
  table.lines .desc{color:var(--slate);}
  table.lines .desc.muted{color:var(--muted);}
  .tag{display:inline-block;margin-left:6px;font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1.5px 6px;border-radius:5px;color:var(--muted);background:var(--line-soft);vertical-align:middle;}
  .tag.warn{color:#9a6a00;background:#FFF3DA;}
  table.lines .num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink);}
  table.lines tbody tr + tr td{border-top:1px solid var(--line-soft);}
  table.lines tfoot td{border-top:2px solid var(--line);padding-top:10px;font-family:var(--f-display);font-weight:700;font-size:13.5px;}
  table.lines tfoot .num{font-size:14.5px;}
  .pos{color:var(--pos);}.neg{color:var(--neg);}
  .adjust{margin-top:26px;border:1px solid var(--line);border-radius:10px;overflow:hidden;}
  .adjust .hd{background:var(--line-soft);padding:9px 16px;font-family:var(--f-display);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--navy);}
  .adjust table{width:100%;border-collapse:collapse;}
  .adjust td{padding:9px 16px;font-size:13px;}
  .adjust tr + tr td{border-top:1px solid var(--line-soft);}
  .adjust .desc{color:var(--slate);}
  .adjust .desc.total{font-weight:700;color:var(--ink);}
  .adjust .num{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;}
  .net{margin-top:26px;background:var(--navy-soft);border:1px solid #CBD9FA;border-left:4px solid var(--navy);border-radius:10px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;gap:20px;}
  .net .lab{font-family:var(--f-display);font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--navy);}
  .net .lab small{display:block;text-transform:none;letter-spacing:0;font-weight:500;font-size:11.5px;color:var(--slate);margin-top:3px;}
  .net .amt{font-family:var(--f-display);font-weight:800;font-size:28px;letter-spacing:-.02em;color:var(--navy-deep);font-variant-numeric:tabular-nums;white-space:nowrap;}
  .terbilang{margin-top:10px;font-size:12px;font-style:italic;color:var(--muted);}
  .terbilang b{font-style:normal;color:var(--slate);font-weight:600;}
  .foot{margin-top:26px;padding-top:18px;border-top:1px solid var(--line);}
  .note{font-size:11.5px;color:var(--muted);line-height:1.6;}
  .note b{color:var(--slate);}
  .stamp{font-size:10.5px;color:var(--muted);margin-top:18px;text-align:center;font-variant-numeric:tabular-nums;}
  @page{size:A4;margin:12mm;}
  @media print{
    body{background:#fff;padding:0;}
    .sheet{box-shadow:none;max-width:none;border-radius:0;}
    .masthead,.net,.adjust .hd,table.lines tfoot td{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
</style>
</head>
<body>
  <main class="sheet">
    <header class="masthead">
      <div class="co">
        ${logoHtml}
        <div>
          <div class="name">${esc(company.name)}</div>
          ${companyAddr}
          ${companyNpwp}
        </div>
      </div>
      <div class="docmeta">
        <div class="t">Slip Gaji</div>
        <div class="sub">No. ${esc(slipNo)}</div>
        <div class="period">Periode ${esc(monthLabel(p.periodEnd))} · ${esc(dmy(p.periodStart))} – ${esc(dmy(p.periodEnd))}</div>
        ${statusChip}
      </div>
    </header>
    <div class="body">
      <section class="emp">
        <div class="field"><span class="k">Nama</span><span class="v">${esc(p.employee?.fullName ?? "-")}</span></div>
        <div class="field"><span class="k">Jabatan / Level</span><span class="v">${esc(p.employee?.level?.name ?? "—")}</span></div>
        <div class="field"><span class="k">Unit / Divisi</span><span class="v">${esc(unitNames(p.employee))}</span></div>
        <div class="field"><span class="k">Mata Uang</span><span class="v">${esc(cur)}</span></div>
        <div class="field"><span class="k">Diterbitkan</span><span class="v">${esc(dmy(p.emittedAt))}</span></div>
        <div class="field"><span class="k">Difinalisasi</span><span class="v">${esc(dmy(p.finalizedAt))}</span></div>
      </section>

      <div class="cols">
        <section>
          <h2 class="seclabel">Pendapatan</h2>
          <table class="lines">
            <tbody>${earningRowsHtml}</tbody>
            <tfoot><tr><td>Total Pendapatan (Bruto)</td><td class="num pos">${money(p.gross, cur)}</td></tr></tfoot>
          </table>
        </section>
        <section>
          <h2 class="seclabel">Potongan</h2>
          <table class="lines">
            <tbody>${deductionRowsHtml}</tbody>
            <tfoot><tr><td>Total Potongan</td><td class="num neg">${money(totalDeduction, cur)}</td></tr></tfoot>
          </table>
        </section>
      </div>

      ${adjustmentBlock}

      <section class="net">
        <div class="lab">Gaji Bersih (Take-Home Pay)<small>Bruto − Potongan${
          adjustments.length ? " + Penyesuaian" : ""
        }</small></div>
        <div class="amt">${money(p.netPay, cur)}</div>
      </section>
      <p class="terbilang">Terbilang: <b>${esc(terbilangRupiah(p.netPay))}.</b></p>

      <footer class="foot">
        <p class="note"><b>Catatan.</b> Kontribusi BPJS yang dibayar perusahaan sebesar <b>${money(
          p.bpjsEmployer,
          cur,
        )}</b> tidak memotong gaji dan tidak termasuk dalam perhitungan di atas. Slip ini dihasilkan otomatis oleh sistem Mahir Payroll dan sah tanpa tanda tangan basah.</p>
        <p class="stamp">Dicetak ${esc(dmy(new Date().toISOString()))} · Dokumen rahasia — hanya untuk karyawan bersangkutan.</p>
      </footer>
    </div>
  </main>
</body>
</html>`;
}

// Composable: cetak slip ke jendela baru (print → Save as PDF). `print(payslip)`
// butuh objek slip lengkap (items + scalar + employee); `printById(id)` fetch
// GET_PAYSLIP dulu (dipakai dari daftar admin yang datanya ringkas).
export function usePayslipPrint() {
  const toast = useToastStore();
  const { client } = useApolloClient();
  const printing = ref(false);

  function openPrintWindow(html) {
    const w = window.open("", "_blank", "width=920,height=1000");
    if (!w) {
      toast.error("Jendela cetak diblokir browser. Izinkan pop-up untuk mencetak slip.");
      return false;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    const doPrint = () => {
      w.focus();
      w.print();
    };
    if (w.document.readyState === "complete") setTimeout(doPrint, 350);
    else w.addEventListener("load", () => setTimeout(doPrint, 200));
    return true;
  }

  function print(payslip, options) {
    if (!payslip) return false;
    return openPrintWindow(buildPayslipHtml(payslip, options));
  }

  async function printById(id, options) {
    if (printing.value) return false;
    printing.value = true;
    try {
      const res = await client.query({
        query: GET_PAYSLIP,
        variables: { id: Number(id) },
        fetchPolicy: "network-only",
      });
      const data = res?.data?.getPayslip?.data;
      if (!data) {
        toast.error("Data slip tidak ditemukan.");
        return false;
      }
      return print(data, options);
    } catch (e) {
      toast.error(e?.message?.replace(/^GraphQL error:\s*/i, "") || "Gagal memuat slip.");
      return false;
    } finally {
      printing.value = false;
    }
  }

  return { print, printById, printing };
}

export { buildPayslipHtml };
