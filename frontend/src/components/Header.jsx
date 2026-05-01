import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, hasRight } from '../store/selectors/authSelectors';
import UserMenu from './UserMenu';
import styles from '../styles/Header.module.css';

function Header() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const canCreateTeams = useSelector((state) => 
    hasRight(state, ['can_create_teams'])
  );
  
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src='https://cdn-icons-png.flaticon.com/512/3468/3468381.png'
          alt='Логотип платформы'
        />
        <Link to="/" className={styles.siteName}>GameTeam</Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/">Главная</Link>
        <Link to="/teams">Команды</Link>
        <Link to="/players">Игроки</Link>
        {isAuthenticated && <Link to="/dialogs">Сообщения</Link>}
        {canCreateTeams && <Link to="/create-team" className={styles.createTeamLink}>+ Создать команду</Link>}
      </nav>
      <UserMenu />
    </header>
  );
}

export default Header;