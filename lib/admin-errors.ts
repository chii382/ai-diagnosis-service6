import * as Sentry from "@sentry/nextjs";

export async function reportAdminError(error: unknown, context: string) {
  Sentry.captureException(error, { tags: { area: "admin", context } });
  const webhook = process.env.ADMIN_ERROR_WEBHOOK_URL;
  if (!webhook) return;
  const message = error instanceof Error ? error.message : String(error);
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `【AI自分探し 管理画面】${context}: ${message}`, text: `【AI自分探し 管理画面】${context}: ${message}` }),
    });
  } catch (notificationError) {
    Sentry.captureException(notificationError, { tags: { area: "admin-notification" } });
  }
}
