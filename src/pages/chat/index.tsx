import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { chatMessages, conversations } from '@/data/messages';
import { machines } from '@/data/machines';
import { formatPrice } from '@/utils/format';
import styles from './index.module.scss';

const ChatPage = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const convId = router.params.id || 'conv_001';

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id === convId) || conversations[0];
  }, [convId]);

  const messages = useMemo(() => {
    return chatMessages[convId] || [];
  }, [convId]);

  const machine = useMemo(() => {
    return machines.find((m) => m.id === conversation.machineId) || machines[0];
  }, [conversation.machineId]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    console.info('[Chat] 发送消息', inputText);
    setInputText('');
  };

  const getStatusColor = (status: string) => {
    if (status === 'pass') return styles.inspectionDotPass;
    if (status === 'issue') return styles.inspectionDotIssue;
    return styles.inspectionDotWarning;
  };

  return (
    <View className={styles.chatPage}>
      <View className={styles.machineBar}>
        <Image className={styles.machineImage} src={machine.coverImage} mode="aspectFill" />
        <View className={styles.machineInfo}>
          <Text className={styles.machineTitle}>{machine.title}</Text>
          <Text className={styles.machinePrice}>{formatPrice(machine.price)}</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.messageList}>
        {messages.map((msg) => {
          const isSelf = msg.senderId === 'u_001';
          return (
            <View
              key={msg.id}
              className={classnames(styles.messageItem, isSelf ? styles.messageSelf : styles.messageOther)}
            >
              <Text className={styles.messageSender}>{msg.senderName}</Text>

              {msg.type === 'bargain' && msg.bargainInfo ? (
                <View className={styles.bargainCard}>
                  <Text className={styles.bargainTitle}>💰 砍价出价</Text>
                  <View className={styles.bargainRow}>
                    <Text className={styles.bargainLabel}>卖家报价</Text>
                    <Text className={styles.bargainValue}>{formatPrice(msg.bargainInfo.originalPrice)}</Text>
                  </View>
                  <View className={styles.bargainRow}>
                    <Text className={styles.bargainLabel}>{isSelf ? '我的出价' : '对方出价'}</Text>
                    <Text className={styles.bargainValue}>{formatPrice(msg.bargainInfo.offeredPrice)}</Text>
                  </View>
                  <View className={styles.bargainStatus}>
                    <Text className={styles.bargainStatusText}>
                      {msg.bargainInfo.status === 'pending' ? '等待回复' : msg.bargainInfo.status === 'accepted' ? '已接受' : '已拒绝'}
                    </Text>
                  </View>
                </View>
              ) : msg.type === 'inspection' && msg.inspectionInfo ? (
                <View className={styles.inspectionCard}>
                  <Text className={styles.inspectionTitle}>🔍 验机重点</Text>
                  {msg.inspectionInfo.items.map((item) => (
                    <View key={item.name} className={styles.inspectionItem}>
                      <View className={classnames(styles.inspectionDot, getStatusColor(item.status))} />
                      <Text className={styles.inspectionName}>{item.name}</Text>
                      {item.note && <Text className={styles.inspectionNote}>{item.note}</Text>}
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.messageBubble}>
                  <Text>{msg.content}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.quickActions}>
        <View className={styles.quickActionBtn}>
          <Text className={styles.quickActionText}>发验机重点</Text>
        </View>
        <View className={styles.quickActionBtn}>
          <Text className={styles.quickActionText}>砍价出价</Text>
        </View>
        <View className={styles.quickActionBtn}>
          <Text className={styles.quickActionText}>预约看机</Text>
        </View>
      </View>

      <View className={styles.inputBar}>
        <Input
          className={styles.inputField}
          placeholder="输入消息..."
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          onConfirm={handleSend}
        />
        <View className={styles.sendBtn} onClick={handleSend}>
          <Text className={styles.sendBtnText}>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
