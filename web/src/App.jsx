import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./screens/Login";
import Terminal from "./screens/Terminal";
import Leaderboard from "./screens/Leaderboard";
import ReviewerDashboard from "./screens/ReviewerDashboard";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("codebreak_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem("codebreak_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("codebreak_user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Terminal user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/reviewer" element={<ReviewerDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
