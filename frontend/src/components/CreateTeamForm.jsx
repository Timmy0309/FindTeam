import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTeam, clearError } from '../store/slices/teamsSlice';
import { fetchGames, fetchPopularGames } from '../store/slices/gamesSlice';
import styles from '../styles/CreateTeamForm.module.css';

const CUSTOM_GAME_OPTION = '__custom__';

function CreateTeamForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { games } = useSelector((state) => state.games);
  const { error } = useSelector((state) => state.teams);
  const [loading, setLoading] = useState(false);
  const [gameSelection, setGameSelection] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_players: 5,
  });

  const isCustomGame = gameSelection === CUSTOM_GAME_OPTION;

  useEffect(() => {
    dispatch(fetchGames());
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'max_players' ? Number(value) : value,
    }));
  };

  const handleGameSelect = (e) => {
    setGameSelection(e.target.value);
    if (e.target.value !== CUSTOM_GAME_OPTION) {
      setCustomGameName('');
    }
  };

  const resolveGameName = () => {
    if (isCustomGame) {
      return customGameName.trim();
    }
    return gameSelection;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gameName = resolveGameName();
    if (!gameName) {
      return;
    }

    setLoading(true);
    const result = await dispatch(
      createTeam({
        ...formData,
        game: gameName,
      })
    );
    setLoading(false);

    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(fetchGames());
      dispatch(fetchPopularGames());
      navigate('/teams');
    }
  };

  return (
    <div className={styles.createTeamContainer}>
      <div className={styles.createTeamCard}>
        <h2>Создание команды</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.createTeamForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название команды</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите название команды"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="game">Игра</label>
            <select
              id="game"
              name="game"
              value={gameSelection}
              onChange={handleGameSelect}
              required={!isCustomGame}
            >
              <option value="">Выберите игру из списка</option>
              {games.map((game) => (
                <option key={game.id} value={game.name}>
                  {game.icon} {game.name}
                </option>
              ))}
              <option value={CUSTOM_GAME_OPTION}>✏️ Своя игра (ввести название)</option>
            </select>
          </div>

          {isCustomGame && (
            <div className={styles.formGroup}>
              <label htmlFor="customGame">Название вашей игры</label>
              <input
                type="text"
                id="customGame"
                name="customGame"
                value={customGameName}
                onChange={(e) => setCustomGameName(e.target.value)}
                placeholder="Например: Minecraft, Rust, Palworld..."
                maxLength={100}
                required
                className={styles.customGameInput}
              />
              <p className={styles.fieldHint}>
                Игра появится на главной странице после создания команды
              </p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="max_players">Максимум игроков</label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              value={formData.max_players}
              onChange={handleChange}
              min="2"
              max="10"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Расскажите о команде и требованиях к игрокам"
              rows="5"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !resolveGameName() || !formData.name.trim()}
          >
            {loading ? 'Создание...' : 'Создать команду'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTeamForm;
