import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { selectUser, selectIsAuthenticated } from '../store/selectors/authSelectors';
import styles from '../styles/UserMenu.module.css';

function UserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  if (!isAuthenticated) {
    return (
      <div className={styles.authButtons}>
        <Link to="/login" className={styles.loginButton}>Войти</Link>
        <Link to="/register" className={styles.registerButton}>Регистрация</Link>
      </div>
    );
  }
  
  return (
    <div className={styles.userMenu}>
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>
          {user?.avatar || user?.name?.charAt(0) || 'U'}
        </div>
        <span className={styles.userName}>{user?.name}</span>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Выйти
      </button>
    </div>
  );
}

export default UserMenu;