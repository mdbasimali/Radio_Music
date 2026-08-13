// src/App.jsx
import { RadioProvider } from './context/RadioContext';
import { NostalgiaProvider } from './context/NostalgiaContext';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';

export default function App() {
  return (
    <NostalgiaProvider>
      <RadioProvider>
        <AppShell>
          <Home />
        </AppShell>
      </RadioProvider>
    </NostalgiaProvider>
  );
}
