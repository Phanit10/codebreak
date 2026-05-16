import { useState } from "react";
import { registerCandidate } from "../api";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await registerCandidate(name.trim(), email.trim());
      onLogin(user);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-icon large">{">"}_</span>
          <h1>CodeBreak</h1>
          <p className="login-subtitle">Escape the broken code.</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="login-input"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Connecting..." : "Enter the Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
