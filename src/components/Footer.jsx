import React from 'react';
import styles from '../styles/Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p>© {currentYear} GameTeam. Платформа для поиска команд.</p>
    </footer>
  );
}

export default Footer;