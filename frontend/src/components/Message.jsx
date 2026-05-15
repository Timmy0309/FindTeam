import React from 'react';
import styles from '../styles/Message.module.css';

function Message({ message, author, isMyMessage, time, pending }) {
  const messageClass = isMyMessage
    ? `${styles.message} ${styles.myMessage}${pending ? ` ${styles.pending}` : ''}`
    : `${styles.message}${pending ? ` ${styles.pending}` : ''}`;

  return (
    <div className={messageClass}>
      {!isMyMessage && <div className={styles.messageAuthor}>{author}</div>}
      <div className={styles.messageText}>{message}</div>
      <div className={styles.messageTime}>{time || 'Только что'}</div>
    </div>
  );
}

export default Message;
