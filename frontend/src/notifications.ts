import type { HomeAssistant, PersistentNotification, RepairsIssue, RepairsIssuesResponse } from "./types";

const PERSISTENT_NOTIFICATIONS_COMMAND = "persistent_notification/get";
const REPAIRS_ISSUES_COMMAND = "repairs/list_issues";

export interface BelovodyaNotificationItem {
  actionPath: string | null;
  body: string;
  category: "issue" | "notification";
  id: string;
  severity: string | null;
  title: string;
}

export interface BelovodyaNotificationsSnapshot {
  fetchedAt: number;
  issues: readonly BelovodyaNotificationItem[];
  notifications: readonly BelovodyaNotificationItem[];
}

const normalizeText = (value: unknown, fallback = ""): string => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const normalizeSeverity = (value: unknown): string | null => {
  const normalized = String(value ?? "").trim();
  return normalized || null;
};

const issueTitle = (issue: RepairsIssue): string => {
  const placeholderTitle = issue.translation_placeholders?.title;
  if (typeof placeholderTitle === "string" && placeholderTitle.trim()) {
    return placeholderTitle.trim();
  }

  const translationKey = normalizeText(issue.translation_key, "");
  if (translationKey) {
    return translationKey
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return `${normalizeText(issue.domain, "system")}:${normalizeText(issue.issue_id, "issue")}`;
};

const issueBody = (issue: RepairsIssue): string => {
  const details = [
    issue.breaks_in_ha_version ? `Требует внимания до версии HA ${issue.breaks_in_ha_version}.` : "",
    issue.learn_more_url ? `Подробнее: ${issue.learn_more_url}` : "",
  ].filter(Boolean);

  if (details.length > 0) {
    return details.join("\n");
  }

  return "Home Assistant сообщил о проблеме, которую стоит проверить в разделе Repairs.";
};

const toIssueItem = (issue: RepairsIssue, index: number): BelovodyaNotificationItem => ({
  actionPath: "/config/repairs",
  body: issueBody(issue),
  category: "issue",
  id: `${normalizeText(issue.domain, "issue")}:${normalizeText(issue.issue_id, String(index + 1))}`,
  severity: normalizeSeverity(issue.severity),
  title: issueTitle(issue),
});

const toPersistentNotification = (
  notification: PersistentNotification,
  index: number,
): BelovodyaNotificationItem => ({
  actionPath: null,
  body: normalizeText(notification.message, "Пустое уведомление."),
  category: "notification",
  id: normalizeText(notification.notification_id, `notification-${index + 1}`),
  severity: normalizeSeverity(notification.status),
  title: normalizeText(notification.title, `Уведомление ${index + 1}`),
});

export const emptyNotificationsSnapshot = (): BelovodyaNotificationsSnapshot => ({
  fetchedAt: 0,
  issues: Object.freeze([]),
  notifications: Object.freeze([]),
});

export const fetchBelovodyaNotifications = async (
  hass: HomeAssistant,
): Promise<BelovodyaNotificationsSnapshot> => {
  const [persistentNotifications, repairsResponse] = await Promise.all([
    hass.callWS<readonly PersistentNotification[]>({ type: PERSISTENT_NOTIFICATIONS_COMMAND }),
    hass.callWS<RepairsIssuesResponse>({ type: REPAIRS_ISSUES_COMMAND }),
  ]);

  return {
    fetchedAt: Date.now(),
    issues: (repairsResponse.issues ?? []).map(toIssueItem),
    notifications: (persistentNotifications ?? []).map(toPersistentNotification),
  };
};
