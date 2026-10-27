
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

import api from "../api/axios";

import {
  parseJwt,
  ROL_ADMINISTRADOR,
  ROL_MESERO,
  ROL_CAJERO,
} from "../utils/jwt";

import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const token =
        response.data.access_token || response.data.token;

      if (!token) {
        throw new Error(
          "El backend no devolvió ningún token válido."
        );
      }

      localStorage.setItem("token", token);

      const payload = parseJwt(token);

      if (!payload) {
        throw new Error(
          "No se pudo leer la información del token."
        );
      }

      const rol = Number(payload.role);

      if (Number.isNaN(rol)) {
        throw new Error(
          "El rol obtenido del token no es un número válido."
        );
      }

      if (rol === ROL_ADMINISTRADOR) {
        navigate("/admin");
      } else if (rol === ROL_MESERO) {
        navigate("/mesas");
      } else if (rol === ROL_CAJERO) {
        navigate("/caja");
      } else {
        setError(`Rol desconocido: ${rol}`);
      }
    } catch (err: any) {
      console.error("Error en el login:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Correo o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand__overlay" />

        <div className="login-brand__content">
          <img
            src="/logo-pola-y-punto.svg"
            alt="Bar Pola y Punto"
            className="login-brand__logo"
          />

          <div className="login-brand__message">
            <h2>
              Buenas bebidas,
              <br />
              mejores momentos
            </h2>
          </div>

          <div
            className="login-brand__glass"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel__content">
          <div
            className="login-decoration login-decoration--top"
            aria-hidden="true"
          >
            ✧
          </div>

          <header className="login-header">
            <h1>Bar Pola y Punto</h1>
            <p>Panel de acceso</p>
            <span className="login-header__line" />
          </header>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error__icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">
                Correo electrónico
              </label>

              <div className="login-input">
                <span
                  className="login-input__icon"
                  aria-hidden="true"
                >
                  <i className="fa-regular fa-envelope" />
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu.correo@barpolaypunto.com"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>

              <div className="login-input">
                <span
                  className="login-input__icon"
                  aria-hidden="true"
                >
                  <i className="fa-solid fa-lock" />
                </span>

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setMostrarPassword((value) => !value)
                  }
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  <i
                    className={
                      mostrarPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  />
                </button>
              </div>
            </div>

          

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <span className="login-button__arrow">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <footer className="login-footer">
            <span />
            <small>Bar Pola y Punto</small>
            <span />
          </footer>
        </div>
      </section>
    </main>
  );
}
