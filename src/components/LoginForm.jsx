import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginStart, loginFailure } from '../store/slices/authSlice';
import styles from '../styles/AuthForm.module.css';

function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    
    // Имитация API запроса
    setTimeout(() => {
      // Простая валидация для демонстрации
      if (formData.email && formData.password) {
        const user = {
          id: 1,
          name: formData.email.split('@')[0],
          email: formData.email,
          avatar: formData.email.charAt(0).toUpperCase()
        };
        
        dispatch(loginSuccess({
          user: user,
          roles: ['user'],
          rights: ['can_view_teams', 'can_view_players', 'can_send_messages', 'can_create_teams']
        }));
      } else {
        dispatch(loginFailure('Неверный email или пароль'));
      }
    }, 1000);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Вход в аккаунт</h2>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p className={styles.authFooter}>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;