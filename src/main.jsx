import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{
      fontFamily: "sans-serif",
      background: "#fff9f4",
      color: "#333",
      padding: "2rem",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#FF8C3A" }}>LinguaListen 🎧</h1>
      <p>前端部署成功！</p>
      <p>请确认你已在 Vercel 环境变量中设置：<br/><code>VITE_API_BASE_URL=https://lingualisten-backend.onrender.com</code></p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
