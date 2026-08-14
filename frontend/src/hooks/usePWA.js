// src/hooks/usePWA.js
// Registers the service worker and manages the beforeinstallprompt event.
// The prompt is deferred until the user has meaningfully interacted with the app.

import { useState, useEffect, useRef } from 'react';

export function usePWA() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // ── Detect if already running as installed PWA ──────────────
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return; // don't set up install logic for already-installed app
    }

    // ── Detect iOS Safari (no beforeinstallprompt support) ──────
    const ua = navigator.userAgent;
    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    // ── Register service worker ──────────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Registered, scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }

    // ── Capture beforeinstallprompt (Chrome/Edge/Android) ───────
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // stop browser's native prompt
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // ── Detect successful app install ────────────────────────────
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // ── Show banner after 45s of engagement (non-intrusive) ─────
    // Only show if prompt is available (captured by then) or iOS
    timerRef.current = setTimeout(() => {
      setShowInstallBanner(true);
    }, 45000); // 45 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timerRef.current);
    };
  }, []);

  // Trigger native install dialog
  const triggerInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowInstallBanner(false);
    }
    setInstallPromptEvent(null);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    // Don't show again this session
    clearTimeout(timerRef.current);
  };

  const canInstall = !isInstalled && (!!installPromptEvent || isIOS);

  return {
    canInstall,
    showInstallBanner: showInstallBanner && canInstall,
    isInstalled,
    isIOS,
    triggerInstall,
    dismissBanner,
  };
}
