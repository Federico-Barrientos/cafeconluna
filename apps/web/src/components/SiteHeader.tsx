import { Link } from "react-router-dom";
import { useTheme } from "../lib/theme";

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <h1 className="wordmark">
        <Link to="/">cafeconluna</Link>
        <small>diario visual en 35&nbsp;mm</small>
      </h1>
      <nav className="site-nav">
        <Link to="/">Índice</Link>
        <Link to="/admin">Admin</Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? "claro" : "oscuro"}
        </button>
      </nav>
    </header>
  );
}
