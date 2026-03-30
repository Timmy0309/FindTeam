import React from 'react';
import styles from '../App.module.css';

function PlayersPage() {
  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Поиск игроков</h2>
      <div className={styles.playersContainer}>
        <p>Здесь будет список игроков, ищущих команду</p>
        {/* Позже здесь будет список игроков */}
      </div>
    </main>
  );
}

export default PlayersPage;