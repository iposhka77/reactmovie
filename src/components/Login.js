import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Импортируем стили для этого компонента

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', {
        usernameOrEmail,
        password
      });

      // Сохраняем токен в localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('username', response.data.user.username);

      navigate('/');
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Что-то пошло не так. Попробуйте снова.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Имя пользователя или email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-btn">Войти</button>
      </form>
    </div>
  );
};

export default Login;
