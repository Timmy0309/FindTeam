import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopularGames, fetchGames } from '../store/slices/gamesSlice';
import styles from '../App.module.css';

function HomePage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { popularGames, games, loading } = useSelector((state) => state.games);

  useEffect(() => {
    dispatch(fetchPopularGames());
    dispatch(fetchGames());
  }, [dispatch]);

  // Обновляем список при возврате на главную (после создания команды с новой игрой)
  useEffect(() => {
    const onFocus = () => {
      dispatch(fetchPopularGames());
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [dispatch]);

  const displayGames = popularGames.length > 0 ? popularGames : [];

  return (
    <main className={styles.mainContent}>
      <section className={styles.gamesSection}>
        <h2>Популярные игры</h2>
        <p className={styles.sectionSubtitle}>
          Игры, в которых уже есть активные команды
        </p>

        {loading && <div className={styles.loading}>Загрузка...</div>}

        {!loading && displayGames.length === 0 && (
          <div className={styles.emptyState}>
            <p>Пока нет команд. Создайте первую команду и выберите игру!</p>
            <Link to={isAuthenticated ? '/create-team' : '/register'} className={styles.primaryButton}>
              {isAuthenticated ? 'Создать команду' : 'Зарегистрироваться'}
            </Link>
          </div>
        )}

        <div className={styles.cardGrid}>
          {displayGames.map((game) => (
            <div key={game.id} className={styles.gameCard}>
              <div
                className={styles.gameIcon}
                style={{ backgroundColor: game.color || '#667eea' }}
              >
                {game.icon || '🎮'}
              </div>
              <h3>{game.name}</h3>
              <p>Команд: {game.team_count || 0}</p>
              <Link
                to={`/teams?game=${encodeURIComponent(game.name)}`}
                className={styles.findButton}
              >
                Найти команду
              </Link>
            </div>
          ))}
        </div>
      </section>

      {isAuthenticated ? (
        <section className={styles.quickActionsSection}>
          <h2>Быстрые действия</h2>
          <div className={styles.quickActionsGrid}>
            <Link to="/create-team" className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>➕</div>
              <h3>Создать команду</h3>
              <p>Набери игроков для своей команды</p>
            </Link>
            <Link to="/teams" className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>🔍</div>
              <h3>Найти команду</h3>
              <p>Присоединись к существующей команде</p>
            </Link>
            <Link to="/dialogs" className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>💬</div>
              <h3>Сообщения</h3>
              <p>Общайся с тиммейтами</p>
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2>Готов найти свою команду?</h2>
            <p>
              Доступно {games.length} игр. Присоединяйся к сообществу и найди идеальных тиммейтов!
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.primaryButton}>Зарегистрироваться</Link>
              <Link to="/login" className={styles.secondaryButton}>Войти</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default HomePage;
