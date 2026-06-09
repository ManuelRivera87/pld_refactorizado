import axios from "axios";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandLogo } from "../components/BrandLogo";
import { FormError } from "../components/FormError";
import { AuthLayout } from "../layouts/AuthLayout";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudo iniciar sesion.";
  }

  return "No se pudo iniciar sesion.";
};

export function LoginPage() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-copy">
        <BrandLogo />
        <p className="eyebrow">Acceso corporativo</p>
        <h1>Ingreso al portal PLD</h1>
        <p>
          Ingresa con tu cuenta autorizada para consultar, cargar y dar seguimiento
          a la operacion regulatoria.
        </p>
        <small className="login-note">Acceso exclusivo para cuentas corporativas autorizadas.</small>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>Correo corporativo</span>
          <div className="input-shell">
            <Mail aria-hidden="true" size={18} strokeWidth={2} />
            <input
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo.corporativo"
              required
              type="email"
              value={email}
            />
          </div>
        </label>

        <label>
          <span>Password</span>
          <div className="input-shell">
            <LockKeyhole aria-hidden="true" size={18} strokeWidth={2} />
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
        </label>

        <FormError message={error} />

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <LogIn aria-hidden="true" size={18} strokeWidth={2} />
          <span>{isSubmitting ? "Ingresando..." : "Ingresar"}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
