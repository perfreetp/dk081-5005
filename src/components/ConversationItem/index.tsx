import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { Conversation } from '@/types/machine';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

interface ConversationItemProps {
  conversation: Conversation;
  onClick?: (id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  return (
    <View className={styles.item} onClick={() => onClick?.(conversation.id)}>
      <Image className={styles.avatar} src={conversation.otherUserAvatar} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{conversation.otherUserName}</Text>
          <Text className={styles.time}>{formatTime(conversation.lastMessageTime)}</Text>
        </View>
        <View className={styles.machineInfo}>
          <Image className={styles.machineImage} src={conversation.machineImage} mode="aspectFill" />
          <Text className={styles.machineTitle}>{conversation.machineTitle}</Text>
        </View>
        <View className={styles.messageRow}>
          <Text className={styles.lastMessage}>{conversation.lastMessage}</Text>
          {conversation.unreadCount > 0 && (
            <View className={styles.badge}>
              <Text className={styles.badgeText}>{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ConversationItem;
