import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTeam, clearError } from '../store/slices/teamsSlice';
import { fetchGames } from '../store/slices/gamesSlice';
import styles from '../styles/CreateTeamForm.module.css';

function CreateTeamForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { games } = useSelector((state) => state.games);
  const { error } = useSelector((state) => state.teams);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    max_players: 5,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(createTeam(formData));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
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
              value={formData.game}
              onChange={handleChange}
              required
            >
              <option value="">Выберите игру</option>
              {games.map((game) => (
                <option key={game.id} value={game.name}>
                  {game.icon} {game.name}
                </option>
              ))}
            </select>
          </div>

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
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Создание...' : 'Создать команду'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTeamForm;
