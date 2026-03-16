import React from 'react';
import styles from '../styles/Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src='https://cdn-icons-png.flaticon.com/512/3468/3468381.png'
          alt='Логотип платформы'
        />
        <span className={styles.siteName}>GameTeam</span>
      </div>
      <nav className={styles.nav}>
        <a href="/">Главная</a>
        <a href="/teams">Команды</a>
        <a href="/players">Игроки</a>
        <a href="/login">Войти</a>
      </nav>
    </header>
  );
}

export default Header;