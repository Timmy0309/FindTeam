import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDialogs, 
  fetchMessages, 
  sendMessageToAPI,
  setActiveDialog,
  addMessageOptimistic
} from '../store/slices/dialogsSlice';
import DialogItem from '../components/DialogItem';
import Message from '../components/Message';
import styles from '../App.module.css';

function DialogsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const activeDialogId = params.dialogId;
  
  const { dialogs, messages, loading } = useSelector((state) => state.dialogs);
  const { user } = useSelector((state) => state.auth);
  
  const [newMessage, setNewMessage] = useState('');
  
  // Загружаем диалоги при монтировании
  useEffect(() => {
    dispatch(fetchDialogs());
  }, [dispatch]);
  
  // Загружаем сообщения при выборе диалога
  useEffect(() => {
    if (activeDialogId) {
      dispatch(fetchMessages(activeDialogId));
      dispatch(setActiveDialog(activeDialogId));
    }
  }, [activeDialogId, dispatch]);
  
  // Получаем сообщения для активного диалога
  const activeMessages = messages[activeDialogId] || [];
  
  // Информация об активном диалоге
  const activeDialog = dialogs.find(d => d.id === parseInt(activeDialogId));
  
  // Обработчик отправки сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Оптимистичное обновление
    dispatch(addMessageOptimistic({
      dialogId: activeDialogId,
      message: {
        message: newMessage,
        user_id: user?.id
      }
    }));
    
    // Отправка на сервер
    await dispatch(sendMessageToAPI({
      dialog_id: activeDialogId,
      message: newMessage
    }));
    
    setNewMessage('');
  };
  
  if (!activeDialogId) {
    return (
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Сообщения</h2>
        <div className={styles.dialogsContainer}>
          <div className={styles.dialogsList}>
            {loading && <div className={styles.loading}>Загрузка...</div>}
            {dialogs.map((dialog) => {
              // Определяем собеседника
              const otherUser = dialog.user1_id === user?.id 
                ? { name: dialog.user2_name, avatar: dialog.user2_avatar, id: dialog.user2_id }
                : { name: dialog.user1_name, avatar: dialog.user1_avatar, id: dialog.user1_id };
              
              return (
                <DialogItem 
                  key={dialog.id}
                  id={dialog.id}
                  name={otherUser.name}
                  lastMessage={dialog.last_message}
                  avatar={otherUser.avatar}
                  isActive={false}
                />
              );
            })}
          </div>
          <div className={styles.messagesList}>
            <div className={styles.noDialogSelected}>
              <p>Выберите диалог, чтобы начать общение</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  if (!activeDialog && !loading) {
    return <Navigate to="/dialogs" />;
  }
  
  // Определяем собеседника для активного диалога
  const otherUser = activeDialog ? (
    activeDialog.user1_id === user?.id 
      ? { name: activeDialog.user2_name, avatar: activeDialog.user2_avatar }
      : { name: activeDialog.user1_name, avatar: activeDialog.user1_avatar }
  ) : null;
  
  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>
        Чат с {otherUser?.name || '...'}
      </h2>
      <div className={styles.dialogsContainer}>
        <div className={styles.dialogsList}>
          {dialogs.map((dialog) => {
            const other = dialog.user1_id === user?.id 
              ? { name: dialog.user2_name, avatar: dialog.user2_avatar, id: dialog.user2_id }
              : { name: dialog.user1_name, avatar: dialog.user1_avatar, id: dialog.user1_id };
            
            return (
              <DialogItem 
                key={dialog.id}
                id={dialog.id}
                name={other.name}
                lastMessage={dialog.last_message}
                avatar={other.avatar}
                isActive={dialog.id === parseInt(activeDialogId)}
              />
            );
          })}
        </div>
        
        <div className={styles.chatArea}>
          <div className={styles.messagesList}>
            {loading && <div className={styles.loading}>Загрузка сообщений...</div>}
            {activeMessages.map((msg) => (
              <Message
                key={msg.id}
                message={msg.message}
                author={msg.is_my_message ? 'Я' : (msg.author_name || otherUser?.name)}
                isMyMessage={msg.is_my_message || msg.user_id === user?.id}
                time={msg.time}
              />
            ))}
          </div>
          
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