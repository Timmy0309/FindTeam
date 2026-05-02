import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice'; // Используем асинхронный экшен
import styles from '../styles/AuthForm.module.css';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    
    const result = await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
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