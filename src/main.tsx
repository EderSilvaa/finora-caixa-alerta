import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build: 2025-01-26-v3 - Force cache invalidation
createRoot(document.getElementById("root")!).render(<App />);
