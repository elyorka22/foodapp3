/** Thrown when FCM rejects a device token (unregistered / invalid). */
export class InvalidPushTokenError extends Error {
  constructor(
    message: string,
    readonly pushToken: string,
  ) {
    super(message);
    this.name = 'InvalidPushTokenError';
  }
}
