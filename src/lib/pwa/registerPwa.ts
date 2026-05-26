import { registerSW } from 'virtual:pwa-register';

export function registerPwaServiceWorker(): void {
  if (!import.meta.env.PROD && !import.meta.env.VITE_PWA_DEV) return;

  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        void registration.update();
      }
    },
    onOfflineReady() {
      // App shell cached — no UI toast needed for MVP.
    },
  });
}
