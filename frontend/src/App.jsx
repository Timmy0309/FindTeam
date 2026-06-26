import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import DialogsPage from './pages/DialogsPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CreateTeamForm from './components/CreateTeamForm';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import styles from './App.module.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route
            path="/create-team"
            element={
              <ProtectedRoute requiredRights={['can_create_teams']}>
                <CreateTeamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dialogs"
            element={
              <ProtectedRoute requiredRights={['can_send_messages']}>
                <DialogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dialogs/:dialogId"
            element={
              <ProtectedRoute requiredRights={['can_send_messages']}>
                <DialogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <main className={styles.mainContent}>
                <h2 className={styles.pageTitle}>404 — Страница не найдена</h2>
              </main>
            }
          />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
