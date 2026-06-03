export type PushMessagePayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

/** Transport-only contract — FCM/APNs must not own FoodApp notification logic. */
export interface PushProvider {
  readonly name: string;
  send(pushToken: string, message: PushMessagePayload): Promise<void>;
}

export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');
