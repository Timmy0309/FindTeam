import React from 'react';
import styles from '../styles/Message.module.css';

const Message = (props) => {
  // Определяем класс в зависимости от того, чье это сообщение
  const messageClass = props.isMyMessage 
    ? `${styles.message} ${styles.myMessage}` 
    : styles.message;
  
  return (
    <div className={messageClass}>
      {!props.isMyMessage && (
        <div className={styles.messageAuthor}>{props.author}</div>
      )}
      <div className={styles.messageText}>{props.message}</div>
      <div className={styles.messageTime}>{props.time || "Только что"}</div>
    </div>
  );
}

export default Message;