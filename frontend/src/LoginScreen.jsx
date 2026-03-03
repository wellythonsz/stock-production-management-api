import React, { useState } from 'react';
import './LoginScreen.css';

// Reparou no { onLogin } aqui? É ele quem vai falar com o App.jsx!
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLoginSubmit = (e) => {
    e.preventDefault();
    // Em vez de só dar um alert, agora ele envia os dados para o App.jsx validar
    onLogin(username, password);
  };

  const onRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Register Submit clicked');
    alert('Função de registro indisponível neste MVP.');
  };

  return (
    <div className="login-screen-wrapper">
      <div className="main-container">
        {/* Painel Esquerdo: Registro/Bem-vindo */}
        <div className="left-panel">
          <h1 className="welcome-title">Hello, Welcome!</h1>
          <p className="welcome-subtext">Don't have an account?</p>
          <button className="btn-outline" onClick={onRegisterSubmit}>Register</button>
        </div>

        {/* Painel Direito: Formulário de Login */}
        <div className="right-panel">
          <form className="login-form" onSubmit={onLoginSubmit}>
            <h2 className="form-title">Login</h2>
            
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <i className="fas fa-lock input-icon"></i>
            </div>
            
            <div className="forgot-password-link">
              <a href="#">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn-primary">Login</button>
            
            <div className="social-login-section">
              <p className="social-text">or login with social platforms</p>
              <div className="social-icons-group">
                <button type="button" className="social-icon-btn"><i className="fab fa-google"></i></button>
                <button type="button" className="social-icon-btn"><i className="fab fa-facebook-f"></i></button>
                <button type="button" className="social-icon-btn"><i className="fab fa-github"></i></button>
                <button type="button" className="social-icon-btn"><i className="fab fa-linkedin-in"></i></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;