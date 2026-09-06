const ID = /^[A-Za-z0-9_-]{11}$/;

function hostOf(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function parseYoutubeId(input: unknown): string | null {
  try {
    if (typeof input !== "string") return null;
    const raw = input.trim();
    if (!raw) return null;
    if (ID.test(raw)) return raw;

    const withProto = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)
      ? raw
      : `https://${raw}`;
    const url = new URL(withProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const host = hostOf(url.hostname);
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]?.slice(0, 11);
      return id && ID.test(id) ? id : null;
    }

    const youtubeHosts = new Set([
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
    ]);
    if (!youtubeHosts.has(host)) return null;

    const v = url.searchParams.get("v");
    if (v && ID.test(v)) return v;

    const parts = url.pathname.split("/").filter(Boolean);
    if (
      parts[0] &&
      ["embed", "shorts", "live", "v", "watch"].includes(parts[0]) &&
      parts[1] &&
      ID.test(parts[1])
    ) {
      return parts[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}
