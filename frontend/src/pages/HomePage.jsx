import React from 'react';
import GameCard from '../components/GameCard';
import styles from '../App.module.css';

// "База данных" игр для примера (обычно это приходит с сервера)
const popularGames = [
  {
    id: 1,
    gameName: "Dota 2",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota2_social.jpg",
    playerCount: "450K"
  },
  {
    id: 2,
    gameName: "CS:GO 2",
    imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    playerCount: "800K"
  },
  {
    id: 3,
    gameName: "Brawl Stars",
    imageUrl: "https://avatars.mds.yandex.net/i?id=ffa83b6f86390b28efcf2a14fd02e976412292df-5613292-images-thumbs&n=13",
    playerCount: "320K"
  },
  {
    id: 4,
    gameName: "Minecraft",
    imageUrl: "https://ir.ozone.ru/s3/multimedia-1-o/7256266008.jpg",
    playerCount: "1.2M"
  }
];

function HomePage() {
  return (
    <>
      
      <main className={styles.mainContent}>
        <section className={styles.gamesSection}>
          <h2>Популярные игры</h2>
          <div className={styles.cardGrid}>
            {popularGames.map((game) => (
              <GameCard
                key={game.id}
                gameName={game.gameName}
                imageUrl={game.imageUrl}
                playerCount={game.playerCount}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;