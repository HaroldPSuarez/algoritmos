import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Guardar token
      localStorage.setItem('token', response.data.access_token);

      // Mensaje de éxito
      alert('¡Inicio de sesión exitoso!');

      // Ir a sedes después de aceptar el mensaje
      navigate('/sedes');

    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div
          className="login-card__rail"
          aria-hidden="true"
        />

        <div className="login-card__header">

          <svg
            className="login-glass"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 5H25L18 17.5V26H14V17.5L7 5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            <path
              d="M12 26H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <path
              d="M9.5 8.5H22.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          <h1 className="login-title">
            Bar Pola y Punto
          </h1>

          <p className="login-subtitle">
            Panel de acceso
          </p>

        </div>

        {error && (
          <div
            className="login-error"
            role="alert"
          >
            <svg
              className="login-error__icon"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="1.4"
              />

              <path
                d="M10 6.5V10.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              <circle
                cx="10"
                cy="13.3"
                r="0.9"
                fill="currentColor"
              />
            </svg>

            <span>
              {error}
            </span>
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <div className="login-field">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tucorreo@barpolaypunto.com"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="login-spinner"
                  aria-hidden="true"
                />

                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>

        </form>

      </div>
    </div>
  );
}