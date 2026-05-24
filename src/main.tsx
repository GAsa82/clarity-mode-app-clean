import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force dark mode by default for the Clarity Mode aesthetic
document.documentElement.classList.add("dark");

// Import background image so Vite resolves its URL correctly and expose as CSS variable
import bgCover from "./assets/bg-cover.jpg";
if (bgCover) {
	document.documentElement.style.setProperty("--bg-image-url", `url(${bgCover})`);
}

createRoot(document.getElementById("root")!).render(<App />);
