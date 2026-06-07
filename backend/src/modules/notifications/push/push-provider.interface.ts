export type PushDeviceRole = 'CUSTOMER' | 'COURIER' | 'STAFF';

export type PushMessagePayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type PushUserTarget = {
  userId: string;
  role: PushDeviceRole;
};

/** Transport contract — resolves user devices and delivers push payloads. */
export interface PushProvider {
  readonly name: string;
  sendToUser(target: PushUserTarget, message: PushMessagePayload): Promise<void>;
  sendToMany(targets: PushUserTarget[], message: PushMessagePayload): Promise<void>;
  sendToTokens(tokens: string[], message: PushMessagePayload): Promise<void>;
}

export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');
