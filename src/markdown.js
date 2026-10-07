export const plainText = (md) =>
  String(md ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/(\*\*|__|~~|`)(.+?)\1/g, "$2")
    .replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const SAFE_LINK = /^(https?:\/\/|\/(?!\/))/i;

export function firstLink(md) {
  const m = /\[[^\]]*\]\(([^)\s]+)[^)]*\)/.exec(String(md ?? "").replace(/!\[[^\]]*\]\([^)]*\)/g, ""));
  return m && SAFE_LINK.test(m[1]) ? m[1] : null;
}

export function firstPicture(md) {
  const m = /!\[[^\]]*\]\(\s*([^)\s]*)[^)]*\)/.exec(String(md ?? ""));
  return m && SAFE_LINK.test(m[1]) ? m[1] : null;
}

export const linkAction = (url) => ({
  tap_action: url.startsWith("/") ? { action: "navigate", navigation_path: url } : { action: "url", url_path: url },
});
