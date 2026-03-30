import React from 'react';
import { Link } from 'react-router-dom'; // Импортируем Link вместо обычных ссылок
import styles from '../styles/Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src='https://cdn-icons-png.flaticon.com/512/3468/3468381.png'
          alt='Логотип платформы'
        />
        <Link to="/" className={styles.siteName}>GameTeam</Link> {/* Теперь это Link */}
      </div>
      <nav className={styles.nav}>
        <Link to="/">Главная</Link>
        <Link to="/teams">Команды</Link>
        <Link to="/players">Игроки</Link>
        <Link to="/dialogs">Сообщения</Link>
        <Link to="/profile">Профиль</Link>
      </nav>
    </header>
  );
}

export default Header;