import React from 'react';
import styles from '../styles/GameCard.module.css';

function GameCard({ gameName, imageUrl, playerCount }) {
  return (
    <div className={styles.card}>
      <img src={imageUrl} alt={gameName} className={styles.gameImage} />
      <h3>{gameName}</h3>
      <p>Игроков онлайн: {playerCount}</p>
      <button className={styles.findButton}>Найти команду</button>
    </div>
  );
}

export default GameCard;