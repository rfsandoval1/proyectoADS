import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeDefaultUsers } from './lib/auth.ts'

// Inicializar usuarios de prueba
initializeDefaultUsers();

createRoot(document.getElementById("root")!).render(<App />);
