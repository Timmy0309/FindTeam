import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import DialogsPage from './pages/DialogsPage';
import Header from './components/Header';
import Footer from './components/Footer';
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
          <Route path="/dialogs" element={<DialogsPage />} />
          <Route path="/dialogs/:dialogId" element={<DialogsPage />} />
          <Route path="*" element={<div className={styles.mainContent}><h2>404 - Страница не найдена</h2></div>} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;