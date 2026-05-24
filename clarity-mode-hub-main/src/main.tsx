import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force dark mode by default for the Clarity Mode aesthetic
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
