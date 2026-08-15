import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, me } from "../lib/api";

export function Login() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    me().then((user) => {
      if (user) {
        navigate("/admin");
        return;
      }
      setCheckingSession(false);
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="centered-page">
        <p>Verificando sesión…</p>
      </div>
    );
  }

  return (
    <div className="centered-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Ingresar</h1>

        {error && <p className="form-error">{error}</p>}

        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
