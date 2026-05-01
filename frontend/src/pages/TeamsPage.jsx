import React from 'react';
import styles from '../App.module.css';

function TeamsPage() {
  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Поиск команд</h2>
      <div className={styles.teamsContainer}>
        <p>Здесь будет список команд, ищущих игроков</p>
        {/* Позже здесь будет список команд */}
      </div>
    </main>
  );
}

export default TeamsPage;