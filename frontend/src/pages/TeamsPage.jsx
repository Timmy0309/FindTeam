import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeams,
  joinTeam,
  leaveTeam,
  deleteTeam,
  setFilters,
  clearError,
} from '../store/slices/teamsSlice';
import { fetchGames } from '../store/slices/gamesSlice';
import { openTeamChat } from '../store/slices/dialogsSlice';
import styles from '../App.module.css';

const isMember = (team, userId) => {
  if (!team?.members || !userId) return false;
  return team.members.map(Number).includes(Number(userId));
};

const isCaptain = (team, userId) => Number(team?.captain_id) === Number(userId);

function TeamsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { teams, loading, error, filters } = useSelector((state) => state.teams);
  const { games } = useSelector((state) => state.games);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const gameFromUrl = searchParams.get('game');
  const [selectedGame, setSelectedGame] = useState(gameFromUrl || filters.game || 'all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  useEffect(() => {
    if (gameFromUrl) {
      setSelectedGame(gameFromUrl);
      dispatch(setFilters({ game: gameFromUrl }));
    }
  }, [gameFromUrl, dispatch]);

  useEffect(() => {
    dispatch(
      fetchTeams({
        game: selectedGame,
        playersNeeded: showOpenOnly ? 'open' : 'all',
      })
    );
  }, [dispatch, selectedGame, showOpenOnly]);

  const handleGameFilter = (game) => {
    setSelectedGame(game);
    dispatch(setFilters({ game }));
  };

  const handleJoinTeam = async (teamId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionLoading(teamId);
    dispatch(clearError());
    const result = await dispatch(joinTeam(teamId));
    setActionLoading(null);
    if (result.meta.requestStatus === 'rejected') {
      alert(result.payload);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    setActionLoading(teamId);
    dispatch(clearError());
    const result = await dispatch(leaveTeam(teamId));
    setActionLoading(null);
    if (result.meta.requestStatus === 'rejected') {
      alert(result.payload);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Удалить команду? Это действие нельзя отменить.')) return;
    setActionLoading(teamId);
    const result = await dispatch(deleteTeam(teamId));
    setActionLoading(null);
    if (result.meta.requestStatus === 'rejected') {
      alert(result.payload);
    }
  };

  const handleTeamChat = async (teamId) => {
    const result = await dispatch(openTeamChat(teamId));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(`/dialogs/${result.payload.id}`);
    } else {
      alert(result.payload || 'Не удалось открыть чат');
    }
  };

  const gameOptions = [{ name: 'all', label: 'Все игры' }, ...games.map((g) => ({ name: g.name, label: g.name }))];

  if (loading && teams.length === 0) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.loading}>Загрузка команд...</div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.teamsHeader}>
        <h2 className={styles.pageTitle}>Поиск команд</h2>
        {isAuthenticated && (
          <Link to="/create-team" className={styles.primaryButton}>
            + Создать команду
          </Link>
        )}
      </div>

      <div className={styles.filterSection}>
        <label htmlFor="game-filter">Игра:</label>
        <select
          id="game-filter"
          value={selectedGame}
          onChange={(e) => handleGameFilter(e.target.value)}
          className={styles.filterSelect}
        >
          {gameOptions.map((g) => (
            <option key={g.name} value={g.name}>
              {g.label}
            </option>
          ))}
        </select>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showOpenOnly}
            onChange={(e) => setShowOpenOnly(e.target.checked)}
          />
          Только с местами
        </label>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.teamsGrid}>
        {teams.length === 0 ? (
          <div className={styles.noTeams}>
            <p>Команд не найдено</p>
            {isAuthenticated && (
              <Link to="/create-team" className={styles.createFirstTeam}>
                Создать команду
              </Link>
            )}
          </div>
        ) : (
          teams.map((team) => {
            const member = isMember(team, user?.id);
            const captain = isCaptain(team, user?.id);
            const isFull = (team.current_players || 0) >= (team.max_players || 5);
            const busy = actionLoading === team.id;

            return (
              <div key={team.id} className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <h3>{team.name}</h3>
                  <span className={styles.gameBadge}>{team.game}</span>
                </div>
                <p className={styles.teamDescription}>
                  {team.description || 'Описание отсутствует'}
                </p>
                <div className={styles.teamInfo}>
                  <span>👥 {team.current_players || 0}/{team.max_players}</span>
                  <span>👑 {team.captain_name || `ID:${team.captain_id}`}</span>
                </div>
                <div className={styles.teamActions}>
                  {isAuthenticated ? (
                    <>
                      {member && (
                        <button
                          type="button"
                          onClick={() => handleTeamChat(team.id)}
                          className={styles.chatButton}
                          disabled={busy}
                        >
                          💬 Чат команды
                        </button>
                      )}
                      {member && !captain && (
                        <button
                          type="button"
                          onClick={() => handleLeaveTeam(team.id)}
                          className={styles.leaveButton}
                          disabled={busy}
                        >
                          Покинуть
                        </button>
                      )}
                      {captain && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team.id)}
                          className={styles.deleteButton}
                          disabled={busy}
                        >
                          Удалить команду
                        </button>
                      )}
                      {!member && (
                        <button
                          type="button"
                          onClick={() => handleJoinTeam(team.id)}
                          className={styles.joinButton}
                          disabled={isFull || busy}
                        >
                          {isFull ? 'Команда полна' : 'Присоединиться'}
                        </button>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className={styles.joinButton}>
                      Войти чтобы присоединиться
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

export default TeamsPage;
