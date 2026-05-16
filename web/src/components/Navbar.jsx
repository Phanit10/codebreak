import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Terminal" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/reviewer", label: "Reviewer" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">{">"}_</span>
        <span className="brand-text">CodeBreak</span>
      </div>
      <div className="nav-links">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${pathname === l.to ? "active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="nav-user">
        <span className="user-name">{user.name}</span>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
