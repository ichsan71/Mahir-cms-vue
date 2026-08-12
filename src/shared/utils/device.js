// Informasi perangkat untuk log absen (best-effort, khusus lingkungan web).
// `deviceId` dibuat sekali lalu disimpan di localStorage agar stabil per-browser;
// `deviceName` diturunkan dari userAgent (OS + browser).

const DEVICE_ID_KEY = "mahir_device_id";

// Id perangkat yang persisten per-browser (bukan identitas hardware sebenarnya,
// hanya penanda stabil agar backend bisa mengelompokkan tap dari perangkat sama).
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
      `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Nama perangkat ringkas: "Windows · Chrome". Fallback ke platform/"Web".
export function getDeviceName() {
  const ua = navigator.userAgent || "";

  let os = "";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  const label = [os, browser].filter(Boolean).join(" · ");
  return label || navigator.platform || "Web";
}

export function getDeviceInfo() {
  return { id: getDeviceId(), name: getDeviceName() };
}
