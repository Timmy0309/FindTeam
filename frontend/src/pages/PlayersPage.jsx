import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createDialog, fetchDialogs } from '../store/slices/dialogsSlice';
import { userAPI } from '../services/api';
import styles from '../App.module.css';

function PlayersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [messagingId, setMessagingId] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const response = await userAPI.getUsers();
        setPlayers(response.data.data.filter((p) => p.id !== user?.id));
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки игроков');
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, [isAuthenticated, user?.id]);

  const handleMessage = async (playerId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setMessagingId(playerId);
    setError(null);

    const result = await dispatch(createDialog(playerId));
    setMessagingId(null);

    if (result.meta.requestStatus === 'fulfilled') {
      await dispatch(fetchDialogs());
      navigate(`/dialogs/${result.payload.id}`);
    } else {
      setError(result.payload || 'Не удалось создать диалог');
    }
  };

  const filtered = players.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Поиск игроков</h2>
        <p className={styles.sectionSubtitle}>
          Войдите в аккаунт, чтобы видеть список игроков и писать им.
        </p>
        <button type="button" className={styles.primaryButton} onClick={() => navigate('/login')}>
          Войти
        </button>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Поиск игроков</h2>
      <p className={styles.sectionSubtitle}>Найдите тиммейтов и начните диалог</p>

      <input
        type="search"
        placeholder="Поиск по имени или email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      {loading && <div className={styles.loading}>Загрузка...</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.playersGrid}>
        {!loading && filtered.length === 0 && <p className={styles.emptyHint}>Игроки не найдены</p>}
        {filtered.map((player) => (
          <div key={player.id} className={styles.playerCard}>
            <div className={styles.playerAvatar}>{player.avatar || player.name?.charAt(0)}</div>
            <div className={styles.playerInfo}>
              <h3>{player.name}</h3>
              <p>{player.email}</p>
            </div>
            <button
              type="button"
              className={styles.chatButton}
              onClick={() => handleMessage(player.id)}
              disabled={messagingId === player.id}
            >
              {messagingId === player.id ? 'Открытие...' : '💬 Написать'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default PlayersPage;
