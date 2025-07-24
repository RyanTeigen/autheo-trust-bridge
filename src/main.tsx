import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize security services early
import './services/security/SecurityInitializer'

createRoot(document.getElementById("root")!).render(<App />);
