// src/App.jsx
import { RadioProvider } from './context/RadioContext';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';

export default function App() {
  return (
    <RadioProvider>
      <AppShell>
        <Home />
      </AppShell>
    </RadioProvider>
  );
}
