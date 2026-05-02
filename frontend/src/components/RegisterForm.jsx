import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice'; // Используем асинхронный экшен
import styles from '../styles/AuthForm.module.css';

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация паролей
    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    // Отправляем данные на регистрацию
    const result = await dispatch(registerUser({
      name: formData.name,
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
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя пользователя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              required
            />
          </div>
          
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
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p className={styles.authFooter}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;