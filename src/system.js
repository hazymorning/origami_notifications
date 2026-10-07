import { fill, parseTime } from "./format.js";
import { firstLink, firstPicture, linkAction, plainText } from "./markdown.js";
import { prettySlug } from "./strings.js";

export function notificationEntries(notifications, ctx) {
  return [...notifications.values()].map((n) => {
    const link = firstLink(n.message);
    return {
      key: "s:" + n.notification_id,
      kind: "system",
      title: plainText(n.title) || ctx.t.notification,
      message: plainText(n.message),
      image: firstPicture(n.message),
      ts: parseTime(n.created_at, ctx.now),
      past: true,
      seq: n.seq,
      tap: link ? linkAction(link) : undefined,
      dismiss: { service: ["persistent_notification", "dismiss", { notification_id: n.notification_id }] },
    };
  });
}

const REPAIR_SEV = { critical: "crit", error: "crit", warning: "warn" };

export function repairEntries(issues, ctx) {
  const localize = (key, vars) => ctx.hass.localize?.(key, vars) || "";
  return issues.map((issue) => {
    const slug = issue.translation_key || issue.issue_id;
    return {
      key: `i:${issue.domain}/${issue.issue_id}`,
      kind: "repair",
      sev: REPAIR_SEV[issue.severity] || "warn",
      title: localize(`component.${issue.domain}.issues.${slug}.title`, issue.translation_placeholders || {}) || prettySlug(slug),
      message: issue.breaks_in_ha_version
        ? fill(ctx.t.breaks_in, { v: issue.breaks_in_ha_version })
        : localize(`component.${issue.issue_domain || issue.domain}.title`),
      ts: parseTime(issue.created, ctx.now),
      past: true,
      tap: linkAction("/config/repairs"),
      dismiss: { ws: { type: "repairs/ignore_issue", domain: issue.domain, issue_id: issue.issue_id, ignore: true } },
    };
  });
}
