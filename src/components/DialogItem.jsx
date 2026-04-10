import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/DialogItem.module.css';

const DialogItem = (props) => {
  let path = "/dialogs/" + props.id;
  
  const dialogClass = props.isActive 
    ? `${styles.dialogItem} ${styles.activeDialog}` 
    : styles.dialogItem;
  
  const onlineStatusClass = props.online 
    ? `${styles.onlineStatus} ${styles.online}` 
    : styles.onlineStatus;
  
  return (
    <div className={dialogClass}>
      <Link to={path} className={styles.dialogLink}>
        <div className={styles.avatarContainer}>
          <div className={styles.dialogAvatar}>
            {props.avatar || props.name.charAt(0)}
          </div>
          <span className={onlineStatusClass}></span>
          {props.unreadCount > 0 && (
            <span className={styles.unreadBadge}>{props.unreadCount}</span>
          )}
        </div>
        <div className={styles.dialogInfo}>
          <div className={styles.dialogHeader}>
            <div className={styles.dialogName}>{props.name}</div>
            {props.game && <div className={styles.gameTag}>{props.game}</div>}
          </div>
          <div className={styles.lastMessage}>
            {props.lastMessage?.substring(0, 50) || props.lastMessage || "Нет сообщений"}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default DialogItem;