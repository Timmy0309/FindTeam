import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';
import UserMenu from './UserMenu';
import styles from '../styles/Header.module.css';

function Header() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎮</span>
        <Link to="/" className={styles.siteName}>FindTeam</Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/">Главная</Link>
        <Link to="/teams">Команды</Link>
        <Link to="/players">Игроки</Link>
        {isAuthenticated && <Link to="/dialogs">Сообщения</Link>}
        {isAuthenticated && (
          <Link to="/create-team" className={styles.createTeamLink}>
            + Создать команду
          </Link>
        )}
      </nav>
      <UserMenu />
    </header>
  );
}

export default Header;
