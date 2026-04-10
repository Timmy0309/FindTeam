import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectAllDialogs, 
  selectMessagesByDialogId,
  selectDialogById,
  selectDialogsWithLastMessages
} from '../store/selectors/dialogsSelectors';
import { setActiveDialog, sendMessage } from '../store/slices/dialogsSlice';
import DialogItem from '../components/DialogItem';
import Message from '../components/Message';
import styles from '../App.module.css';

function DialogsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const activeDialogId = params.dialogId;
  
  // Используем селекторы для получения данных из Redux
  const dialogs = useSelector(selectAllDialogs);
  const dialogsWithLastMessages = useSelector(selectDialogsWithLastMessages);
  const activeDialog = useSelector((state) => selectDialogById(state, activeDialogId));
  const messages = useSelector((state) => selectMessagesByDialogId(state, activeDialogId));
  
  // Состояние для нового сообщения
  const [newMessage, setNewMessage] = useState('');
  
  // Устанавливаем активный диалог при его изменении
  React.useEffect(() => {
    if (activeDialogId) {
      dispatch(setActiveDialog(activeDialogId));
    }
  }, [activeDialogId, dispatch]);
  
  // Обработчик отправки сообщения
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    dispatch(sendMessage({
      dialogId: activeDialogId,
      message: newMessage,
      author: 'Я',
      isMyMessage: true
    }));
    
    setNewMessage('');
  };
  
  // Если диалог не выбран
  if (!activeDialogId) {
    return (
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Сообщения</h2>
        <div className={styles.dialogsContainer}>
          <div className={styles.dialogsList}>
            {dialogsWithLastMessages.map((dialog) => (
              <DialogItem 
                key={dialog.id}
                id={dialog.id}
                name={dialog.name}
                lastMessage={dialog.lastMessage?.message || dialog.lastMessage}
                avatar={dialog.avatar}
                game={dialog.game}
                online={dialog.online}
                unreadCount={dialog.unreadCount}
                isActive={false}
              />
            ))}
          </div>
          <div className={styles.messagesList}>
            <div className={styles.noDialogSelected}>
              <p>Выберите диалог, чтобы начать общение</p>
              <p className={styles.hint}>👆 Нажмите на любой чат слева</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  // Если диалог не найден
  if (!activeDialog) {
    return <Navigate to="/dialogs" />;
  }
  
  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>
        Чат с {activeDialog.name} 
        {activeDialog.game && <span className={styles.gameBadge}>{activeDialog.game}</span>}
        {activeDialog.online && <span className={styles.onlineBadge}>● Онлайн</span>}
      </h2>
      <div className={styles.dialogsContainer}>
        {/* Список всех диалогов */}
        <div className={styles.dialogsList}>
          {dialogsWithLastMessages.map((dialog) => (
            <DialogItem 
              key={dialog.id}
              id={dialog.id}
              name={dialog.name}
              lastMessage={dialog.lastMessage?.message || dialog.lastMessage}
              avatar={dialog.avatar}
              game={dialog.game}
              online={dialog.online}
              unreadCount={dialog.unreadCount}
              isActive={dialog.id === activeDialogId}
            />
          ))}
        </div>
        
        {/* Область чата */}
        <div className={styles.chatArea}>
          <div className={styles.messagesList}>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg.message}
                  author={msg.author}
                  isMyMessage={msg.isMyMessage || false}
                  time={msg.time}
                />
              ))
            ) : (
              <div className={styles.noMessages}>
                <p>Нет сообщений в этом диалоге</p>
                <p>Напишите что-нибудь, чтобы начать общение</p>
              </div>
            )}
          </div>
          
          {/* Форма отправки сообщения */}
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendButton}>
              Отправить
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default DialogsPage;