// src/App.jsx
import { RadioProvider } from './context/RadioContext';
import { NostalgiaProvider } from './context/NostalgiaContext';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import InstallBanner from './components/ui/InstallBanner';
import { usePWA } from './hooks/usePWA';

function PWALayer() {
  const { showInstallBanner, isIOS, triggerInstall, dismissBanner } = usePWA();
  return (
    <InstallBanner
      show={showInstallBanner}
      isIOS={isIOS}
      onInstall={triggerInstall}
      onDismiss={dismissBanner}
    />
  );
}

export default function App() {
  return (
    <NostalgiaProvider>
      <RadioProvider>
        <AppShell>
          <Home />
        </AppShell>
        <PWALayer />
      </RadioProvider>
    </NostalgiaProvider>
  );
}

