import { Link } from "react-router-dom";
import { useTheme } from "../lib/theme";

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <h1 className="site-header__title">
        <Link to="/">cafeconluna</Link>
      </h1>
      <nav className="site-header__nav">
        <Link to="/admin">admin</Link>
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
