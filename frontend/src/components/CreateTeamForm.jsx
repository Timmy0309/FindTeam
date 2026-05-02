import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../store/slices/teamsSlice';
import styles from '../styles/CreateTeamForm.module.css';

function CreateTeamForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    max_players: 5
  });

  const games = ['Dota 2', 'CS2', 'Valorant', 'League of Legends', 'Apex Legends'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              {games.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="max_players">Максимальное количество игроков</label>
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
            <label htmlFor="description">Описание команды</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Расскажите о вашей команде, требованиях к игрокам и т.д."
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