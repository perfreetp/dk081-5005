import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Input, ScrollView, Modal } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/utils/format';
import type { ChatMessage, InspectionInfo, BargainInfo } from '@/types/machine';
import styles from './index.module.scss';

const INSPECTION_ITEMS = [
  { name: '发动机启动', status: 'warning' as const },
  { name: '行走系统', status: 'warning' as const },
  { name: '回转机构', status: 'warning' as const },
  { name: '臂架动作', status: 'warning' as const },
  { name: '液压系统', status: 'warning' as const },
  { name: '外观漆面', status: 'warning' as const },
];

const ChatPage = () => {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const [inputText, setInputText] = useState('');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainPrice, setBargainPrice] = useState('');
  const [inspectionState, setInspectionState] = useState(INSPECTION_ITEMS.map(item => ({ ...item })));

  const convId = router.params.id || 'conv_001';
  const user = useAppStore((s) => s.user);
  const machines = useAppStore((s) => s.machines);
  const conversations = useAppStore((s) => s.conversations);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const addMessage = useAppStore((s) => s.addMessage);

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id === convId) || conversations[0];
  }, [conversations, convId]);

  const messages = useMemo(() => {
    return chatMessages[convId] || [];
  }, [chatMessages, convId]);

  const machine = useMemo(() => {
    return machines.find((m) => m.id === conversation?.machineId) || machines[0];
  }, [machines, conversation?.machineId]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToBottom?.();
    }, 100);
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId: user.id,
      senderName: user.name,
      content: inputText.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    addMessage(convId, newMessage);
    setInputText('');
  };

  const handleSendInspection = () => {
    if (!user) return;

    const inspectionInfo: InspectionInfo = {
      items: inspectionState
    };

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId: user.id,
      senderName: user.name,
      content: '已发送验机重点',
      type: 'inspection',
      inspectionInfo,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    addMessage(convId, newMessage);
    setShowInspectionModal(false);
    setInspectionState(INSPECTION_ITEMS.map(item => ({ ...item })));
  };

  const handleSendBargain = () => {
    if (!bargainPrice || !user) return;

    const priceWan = parseFloat(bargainPrice);
    if (isNaN(priceWan) || priceWan <= 0) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' });
      return;
    }

    const priceYuan = Math.round(priceWan * 10000);

    const bargainInfo: BargainInfo = {
      originalPrice: machine.price,
      offeredPrice: priceYuan,
      status: 'pending'
    };

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId: user.id,
      senderName: user.name,
      content: `出价 ${formatPrice(priceYuan)}`,
      type: 'bargain',
      bargainInfo,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    addMessage(convId, newMessage);
    setShowBargainModal(false);
    setBargainPrice('');
  };

  const handleBooking = () => {
    Taro.navigateTo({ url: `/pages/booking/index?machineId=${machine.id}` });
  };

  const toggleInspectionStatus = (index: number) => {
    setInspectionState(prev => {
      const newState = [...prev];
      const statuses = ['warning', 'pass', 'issue'] as const;
      const currentIndex = statuses.indexOf(newState[index].status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      newState[index] = { ...newState[index], status: statuses[nextIndex] };
      return newState;
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'pass') return styles.inspectionDotPass;
    if (status === 'issue') return styles.inspectionDotIssue;
    return styles.inspectionDotWarning;
  };

  const getStatusText = (status: string) => {
    if (status === 'pass') return '正常';
    if (status === 'issue') return '有问题';
    return '待检查';
  };

  return (
    <View className={styles.chatPage}>
      <View className={styles.machineBar}>
        <View className={styles.machineImage} style={{ backgroundImage: `url(${machine.coverImage})` }} />
        <View className={styles.machineInfo}>
          <Text className={styles.machineTitle}>{machine.title}</Text>
          <Text className={styles.machinePrice}>{formatPrice(machine.price)}</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.messageList} ref={scrollRef}>
        {messages.map((msg) => {
          const isSelf = msg.senderId === user?.id;
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
                      <Text className={styles.inspectionNote}>{getStatusText(item.status)}</Text>
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
        <View className={styles.quickActionBtn} onClick={() => setShowInspectionModal(true)}>
          <Text className={styles.quickActionText}>发验机重点</Text>
        </View>
        <View className={styles.quickActionBtn} onClick={() => setShowBargainModal(true)}>
          <Text className={styles.quickActionText}>砍价出价</Text>
        </View>
        <View className={styles.quickActionBtn} onClick={handleBooking}>
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

      <Modal
        title="选择验机重点"
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        content={
          <View className={styles.modalContent}>
            {inspectionState.map((item, index) => (
              <View
                key={item.name}
                className={styles.inspectionOption}
                onClick={() => toggleInspectionStatus(index)}
              >
                <View className={classnames(styles.inspectionDot, getStatusColor(item.status))} />
                <Text className={styles.inspectionOptionName}>{item.name}</Text>
                <Text className={styles.inspectionOptionStatus}>{getStatusText(item.status)}</Text>
              </View>
            ))}
            <View className={styles.modalFooter}>
              <View className={styles.modalCancelBtn} onClick={() => setShowInspectionModal(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleSendInspection}>
                <Text className={styles.modalConfirmText}>发送</Text>
              </View>
            </View>
          </View>
        }
      />

      <Modal
        title="砍价出价"
        isOpen={showBargainModal}
        onClose={() => setShowBargainModal(false)}
        content={
          <View className={styles.modalContent}>
            <View className={styles.bargainInputRow}>
              <Text className={styles.bargainInputLabel}>当前报价</Text>
              <Text className={styles.bargainInputValue}>{formatPrice(machine.price)}</Text>
            </View>
            <View className={styles.bargainInputRow}>
              <Text className={styles.bargainInputLabel}>我的出价</Text>
              <Input
                className={styles.bargainInputField}
                type="number"
                placeholder="请输入出价"
                value={bargainPrice}
                onInput={(e) => setBargainPrice(e.detail.value)}
              />
              <Text className={styles.bargainInputUnit}>万</Text>
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.modalCancelBtn} onClick={() => setShowBargainModal(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleSendBargain}>
                <Text className={styles.modalConfirmText}>发送</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default ChatPage;
