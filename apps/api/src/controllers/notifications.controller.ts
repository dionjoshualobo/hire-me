import { notifications } from '@repo/db'
import type { Database, NewNotification, Notification } from '@repo/db'

/** A notification type as allowed by the `notification_type` enum. */
export type NotificationType = NewNotification['type']

export interface CreateNotificationInput {
  /** The user who should receive the notification. */
  userId: string
  type: NotificationType
  /** Free-form context rendered by the client. Defaults to an empty object. */
  payload?: Record<string, unknown>
}

/**
 * Inserts a notification for a user and returns the created row.
 *
 * Thin on purpose: notification delivery is in-app only today (clients read the
 * `notifications` table), so producing a row *is* the delivery mechanism. If
 * email or push is added later it belongs here, not at the call sites.
 */
export async function createNotification(
  db: Database,
  input: CreateNotificationInput,
): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      payload: input.payload ?? {},
    })
    .returning()

  if (!notification) {
    throw new Error('Failed to create notification')
  }

  return notification
}
