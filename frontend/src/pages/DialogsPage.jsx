import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDialogs,
  fetchMessages,
  sendMessageToAPI,
  setActiveDialog,
  addMessageOptimistic,
  createDialog,
  clearError,
} from '../store/slices/dialogsSlice';
import { userAPI } from '../services/api';
import DialogItem from '../components/DialogItem';
import Message from '../components/Message';
import { getDialogDisplay } from '../utils/dialogHelpers';
import styles from '../App.module.css';

function DialogsPage() {
  const { dialogId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const { dialogs, messages, loading, error } = useSelector((state) => state.dialogs);
  const { user } = useSelector((state) => state.auth);

  const [newMessage, setNewMessage] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dialogsReady, setDialogsReady] = useState(false);
  const [creatingDialog, setCreatingDialog] = useState(false);

  const dialogKey = dialogId ? String(dialogId) : null;
  const activeMessages = useMemo(
    () => (dialogKey ? messages[dialogKey] || [] : []),
    [dialogKey, messages]
  );
  const activeDialog = dialogs.find((d) => d.id === Number(dialogId));

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchDialogs()).finally(() => setDialogsReady(true));
  }, [dispatch]);

  useEffect(() => {
    if (dialogId) {
      dispatch(fetchMessages(dialogId));
      dispatch(setActiveDialog(dialogId));
    }
  }, [dialogId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  useEffect(() => {
    if (!showNewDialog) return;

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await userAPI.getUsers();
        setUsers(response.data.data.filter((u) => u.id !== user?.id));
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, [showNewDialog, user?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !dialogId) return;

    const tempId = `temp-${Date.now()}`;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    dispatch(
      addMessageOptimistic({
        dialogId,
        tempId,
        message: { message: text, user_id: user?.id },
      })
    );

    const result = await dispatch(
      sendMessageToAPI({ dialog_id: Number(dialogId), message: text, tempId })
    );
    setSending(false);

    if (result.meta.requestStatus === 'rejected') {
      alert(result.payload?.error || result.payload || 'Ошибка отправки');
    }
  };

  const handleStartDialog = async (otherUserId) => {
    setCreatingDialog(true);
    dispatch(clearError());
    const result = await dispatch(createDialog(otherUserId));
    setCreatingDialog(false);
    setShowNewDialog(false);

    if (result.meta.requestStatus === 'fulfilled') {
      await dispatch(fetchDialogs());
      navigate(`/dialogs/${result.payload.id}`);
    } else {
      alert(result.payload || 'Не удалось создать диалог');
    }
  };

  const renderDialogList = () =>
    dialogs.map((dialog) => {
      const display = getDialogDisplay(dialog, user?.id);
      return (
        <DialogItem
          key={dialog.id}
          id={dialog.id}
          name={display.name}
          lastMessage={dialog.last_message}
          avatar={display.avatar}
          game={display.game}
          isActive={dialog.id === Number(dialogId)}
        />
      );
    });

  if (!dialogId) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.dialogsPageHeader}>
          <h2 className={styles.pageTitleInline}>Сообщения</h2>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setShowNewDialog(!showNewDialog)}
          >
            + Новый диалог
          </button>
        </div>

        {showNewDialog && (
          <div className={styles.newDialogPanel}>
            <h3>Выберите игрока</h3>
            {usersLoading && <p className={styles.loadingText}>Загрузка игроков...</p>}
            {!usersLoading && users.length === 0 && (
              <p className={styles.emptyHint}>
                Нет других игроков. Пригласите друзей зарегистрироваться на платформе.
              </p>
            )}
            {!usersLoading && users.length > 0 && (
              <ul className={styles.usersList}>
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => handleStartDialog(u.id)}
                      disabled={creatingDialog}
                    >
                      <span className={styles.userAvatarSmall}>
                        {u.avatar || u.name?.charAt(0)}
                      </span>
                      <span>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.dialogsContainer}>
          <div className={styles.dialogsList}>
            {loading && dialogs.length === 0 && (
              <div className={styles.loading}>Загрузка...</div>
            )}
            {!loading && dialogs.length === 0 && (
              <p className={styles.emptyHint}>
                Диалогов пока нет. Напишите игроку или войдите в команду.
              </p>
            )}
            {renderDialogList()}
          </div>
          <div className={styles.chatPlaceholder}>
            <div className={styles.noDialogSelected}>
              <p>Выберите диалог, чтобы начать общение</p>
              <Link to="/players" className={styles.secondaryButton}>
                Найти игроков
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (dialogsReady && !loading && !activeDialog) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.emptyState}>
          <p>Диалог не найден</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/dialogs')}
          >
            К списку диалогов
          </button>
        </div>
      </main>
    );
  }

  const display = activeDialog ? getDialogDisplay(activeDialog, user?.id) : { name: '...' };

  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Чат: {display.name}</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.dialogsContainer}>
        <div className={styles.dialogsList}>
          <button
            type="button"
            className={styles.backToDialogs}
            onClick={() => navigate('/dialogs')}
          >
            ← Все диалоги
          </button>
          {renderDialogList()}
        </div>

        <div className={styles.chatArea}>
          <div className={styles.messagesList}>
            {loading && activeMessages.length === 0 && (
              <div className={styles.loading}>Загрузка сообщений...</div>
            )}
            {!loading && activeMessages.length === 0 && (
              <p className={styles.emptyHint}>Напишите первое сообщение</p>
            )}
            {activeMessages.map((msg) => (
              <Message
                key={msg.id || msg.tempId}
                message={msg.message}
                author={msg.is_my_message ? 'Я' : msg.author_name || display.name}
                isMyMessage={msg.is_my_message}
                time={msg.time}
                pending={msg.pending}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className={styles.messageInput}
              disabled={sending || !activeDialog}
            />
            <button type="submit" className={styles.sendButton} disabled={sending || !activeDialog}>
              {sending ? '...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default DialogsPage;
