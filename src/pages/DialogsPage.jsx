import React from 'react';
import { useParams, Navigate } from 'react-router-dom'; // Импортируем хук useParams для получения ID из URL
import styles from '../App.module.css';
import DialogItem from '../components/DialogItem';
import Message from '../components/Message';
import { dialogsData, messagesData } from '../data/messagesData';

function DialogsPage() {
  // Получаем параметры из URL (например, /dialogs/1 даст { dialogId: "1" })
  const params = useParams();
  const activeDialogId = params.dialogId; // ID активного диалога из URL

  // Если диалог не выбран (просто зашли на /dialogs), показываем список диалогов с сообщением
  if (!activeDialogId) {
    return (
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Сообщения</h2>
        <div className={styles.dialogsContainer}>
          <div className={styles.dialogsList}>
            {dialogsData.map((dialog) => (
              <DialogItem 
                key={dialog.id}
                id={dialog.id}
                name={dialog.name}
                lastMessage={dialog.lastMessage}
                avatar={dialog.avatar}
                isActive={false}
              />
            ))}
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

  // Получаем сообщения для активного диалога
  const activeDialogMessages = messagesData[activeDialogId] || [];
  
  // Проверяем, существует ли такой диалог
  const activeDialog = dialogsData.find(d => d.id === activeDialogId);
  
  if (!activeDialog) {
    return <Navigate to="/dialogs" />; // Перенаправляем на список диалогов, если диалог не найден
  }

  return (
    <main className={styles.mainContent}>
      <h2 className={styles.pageTitle}>
        Сообщения — {activeDialog.name}
      </h2>
      <div className={styles.dialogsContainer}>
        {/* Список всех диалогов */}
        <div className={styles.dialogsList}>
          {dialogsData.map((dialog) => (
            <DialogItem 
              key={dialog.id}
              id={dialog.id}
              name={dialog.name}
              lastMessage={dialog.lastMessage}
              avatar={dialog.avatar}
              isActive={dialog.id === activeDialogId} // Подсвечиваем активный диалог
            />
          ))}
        </div>
        
        {/* Список сообщений для ВЫБРАННОГО диалога */}
        <div className={styles.messagesList}>
          {activeDialogMessages.length > 0 ? (
            activeDialogMessages.map((msg) => (
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default DialogsPage;