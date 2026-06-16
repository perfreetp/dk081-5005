import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ConversationItem from '@/components/ConversationItem';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const NOTIFICATIONS = [
  {
    id: 'n1',
    icon: '🔔',
    title: '降价提醒',
    desc: '你关注的"三一SY215C"已降价2万',
    time: '10分钟前'
  },
  {
    id: 'n2',
    icon: '📋',
    title: '协议通知',
    desc: '你有一份定金协议待签署',
    time: '1小时前'
  },
  {
    id: 'n3',
    icon: '✅',
    title: '预约确认',
    desc: '李师傅已确认明天看机预约',
    time: '3小时前'
  },
  {
    id: 'n4',
    icon: '💬',
    title: '急找设备匹配',
    desc: '有2台设备匹配你的急找需求',
    time: '昨天'
  }
];

const MessagePage = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notification'>('chat');
  const conversations = useAppStore((s) => s.conversations);
  const markAsRead = useAppStore((s) => s.markAsRead);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, [conversations]);

  const handleConversationClick = (id: string) => {
    markAsRead(id);
    Taro.navigateTo({ url: `/pages/chat/index?id=${id}` });
  };

  return (
    <View className={styles.messagePage}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'chat' && styles.tabItemActive)}
          onClick={() => setActiveTab('chat')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'chat' && styles.tabTextActive)}>聊天下单</Text>
          {totalUnread > 0 && (
            <View className={styles.tabBadge}>
              <Text className={styles.tabBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
            </View>
          )}
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'notification' && styles.tabItemActive)}
          onClick={() => setActiveTab('notification')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'notification' && styles.tabTextActive)}>系统通知</Text>
        </View>
      </View>

      {activeTab === 'chat' ? (
        <ScrollView scrollY className={styles.conversationList}>
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <ConversationItem key={conv.id} conversation={conv} onClick={handleConversationClick} />
            ))
          ) : (
            <View className={styles.emptyWrap}>
              <EmptyState title="暂无会话" description="去找车聊聊吧" />
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY className={styles.notificationSection}>
          {NOTIFICATIONS.map((n) => (
            <View key={n.id} className={styles.notificationCard}>
              <Text className={styles.notificationIcon}>{n.icon}</Text>
              <View className={styles.notificationContent}>
                <Text className={styles.notificationTitle}>{n.title}</Text>
                <Text className={styles.notificationDesc}>{n.desc}</Text>
                <Text className={styles.notificationTime}>{n.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MessagePage;
