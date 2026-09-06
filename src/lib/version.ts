/**
 * Ground rule 14 (constitution): assign a version on every visible slice.
 * Bump APP_VERSION and package.json together; refresh LATEST_DEV (zh + en).
 * PATCH = fix/UX, MINOR = new weekend capability, MAJOR = breaking persist or product change.
 */
export const APP_VERSION = "1.0.1";

export const VERSION_LABEL = `v${APP_VERSION}`;

export const LATEST_DEV = {
  date: "2026-09-06",
  zh: "描圖寬鬆咗，畫歪少少都過到。修咗 Firefox 只見標題、唔見 PIN。每頁顯示版本號，reload 之後對得到而家呢版。",
  en: "Trace is forgiving — a wobbly circle still counts. Firefox no longer sticks on the title splash. Version shows on every screen so a reload matches this build.",
} as const;
