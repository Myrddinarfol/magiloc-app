import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setError('');
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>🔐 Authentification MagiLoc</h2>
          <p>Accès sécurisé au système de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Mot de passe :</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Entrez le mot de passe"
              autoFocus
            />
            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Se connecter
          </button>
        </form>

        <div className="login-footer">
          <p>© 2025 MagiLoc - Gestion Parc Location COUERON</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
