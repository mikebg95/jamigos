import { registerPlugin } from '@capacitor/core';

export interface JamigosInAppAuthPlugin {
  openAuth(options: { url: string }): Promise<void>;
}

export const JamigosInAppAuth = registerPlugin<JamigosInAppAuthPlugin>('JamigosInAppAuth');

/**
 * Opens an in-app authentication modal (iOS only)
 * @param url The authentication URL to load in the modal
 * @returns A promise that resolves when the modal is closed
 */
export async function openAuth(url: string): Promise<void> {
  return JamigosInAppAuth.openAuth({ url });
}
