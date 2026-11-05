import DOMPurify from "dompurify";

// Sanitasi HTML rich-text (mis. konten pengumuman dari editor Quill) sebelum
// dirender via v-html. Membuang <script>, atribut event (on*), dan skema URL
// berbahaya (javascript:) sehingga aman dari XSS, namun tetap mengizinkan
// format teks yang wajar (bold, list, heading, tautan, gambar, tabel).
//
// Pakai allowlist agar hanya tag/atribut yang diharapkan yang lolos.
const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "span", "div",
    "b", "strong", "i", "em", "u", "s", "strike", "sub", "sup",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class", "colspan", "rowspan"],
  // Hanya izinkan skema tautan/gambar yang aman (buang javascript:, data: skrip, dll).
  ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
};

// Pastikan setiap tautan yang terbuka di tab baru tidak bisa mengakses
// window.opener (reverse tabnabbing) — selaras dengan SEC-06.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  return DOMPurify.sanitize(String(dirty), CONFIG);
}
