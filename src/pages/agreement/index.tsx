import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { formatPrice, formatDate, getFailReasonLabel } from '@/utils/format';
import styles from './index.module.scss';

const AGREEMENTS = [
  {
    id: 'a1',
    machine: '三一SY215C挖掘机',
    buyer: '王建国',
    seller: '李师傅',
    deposit: 10000,
    totalPrice: 285000,
    status: 'completed' as const,
    failReason: undefined,
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'a2',
    machine: '卡特320D挖掘机',
    buyer: '王建国',
    seller: '张老板',
    deposit: 5000,
    totalPrice: 260000,
    status: 'failed' as const,
    failReason: 'price_gap' as const,
    createdAt: '2026-06-12T14:00:00Z'
  },
  {
    id: 'a3',
    machine: '徐工XZ503J搅拌车',
    buyer: '王建国',
    seller: '赵总',
    deposit: 8000,
    totalPrice: 170000,
    status: 'pending' as const,
    failReason: undefined,
    createdAt: '2026-06-15T09:00:00Z'
  }
];

const CHECKLIST = [
  { label: '设备外观检查', checked: true },
  { label: '发动机启动正常', checked: true },
  { label: '液压系统无渗漏', checked: true },
  { label: '行走系统正常', checked: false },
  { label: '手续证件齐全', checked: false },
  { label: '定金已支付', checked: false }
];

const AgreementPage = () => {
  const [activeTab, setActiveTab] = useState<'agreement' | 'checklist'>('agreement');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <View className={classnames(styles.statusBadge, styles.statusPending)}>
            <Text className={styles.statusPendingText}>待签署</Text>
          </View>
        );
      case 'signed':
        return (
          <View className={classnames(styles.statusBadge, styles.statusSigned)}>
            <Text className={styles.statusSignedText}>已签署</Text>
          </View>
        );
      case 'completed':
        return (
          <View className={classnames(styles.statusBadge, styles.statusCompleted)}>
            <Text className={styles.statusCompletedText}>已完成</Text>
          </View>
        );
      case 'failed':
        return (
          <View className={classnames(styles.statusBadge, styles.statusFailed)}>
            <Text className={styles.statusFailedText}>已失败</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className={styles.agreementPage}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'agreement' && styles.tabItemActive)}
          onClick={() => setActiveTab('agreement')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'agreement' && styles.tabTextActive)}>定金协议</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'checklist' && styles.tabItemActive)}
          onClick={() => setActiveTab('checklist')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'checklist' && styles.tabTextActive)}>交机清单</Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 100rpx)' }}>
        <View className={styles.agreementList}>
          {activeTab === 'agreement' ? (
            AGREEMENTS.map((agreement) => (
              <View key={agreement.id} className={styles.agreementCard}>
                <View className={styles.agreementHeader}>
                  <Text className={styles.agreementMachine}>{agreement.machine}</Text>
                  {getStatusBadge(agreement.status)}
                </View>
                <View className={styles.agreementInfo}>
                  <View className={styles.agreementRow}>
                    <Text className={styles.agreementLabel}>买家</Text>
                    <Text className={styles.agreementValue}>{agreement.buyer}</Text>
                  </View>
                  <View className={styles.agreementRow}>
                    <Text className={styles.agreementLabel}>卖家</Text>
                    <Text className={styles.agreementValue}>{agreement.seller}</Text>
                  </View>
                  <View className={styles.agreementRow}>
                    <Text className={styles.agreementLabel}>定金</Text>
                    <Text className={classnames(styles.agreementValue, styles.agreementPrice)}>
                      {formatPrice(agreement.deposit)}
                    </Text>
                  </View>
                  <View className={styles.agreementRow}>
                    <Text className={styles.agreementLabel}>成交价</Text>
                    <Text className={classnames(styles.agreementValue, styles.agreementPrice)}>
                      {formatPrice(agreement.totalPrice)}
                    </Text>
                  </View>
                  <View className={styles.agreementRow}>
                    <Text className={styles.agreementLabel}>创建时间</Text>
                    <Text className={styles.agreementValue}>{formatDate(agreement.createdAt)}</Text>
                  </View>
                </View>
                {agreement.failReason && (
                  <View className={styles.failReason}>
                    <Text className={styles.failReasonText}>
                      失败原因：{getFailReasonLabel(agreement.failReason)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.checklistCard}>
              <Text className={styles.checklistTitle}>交机检查清单</Text>
              {CHECKLIST.map((item) => (
                <View key={item.label} className={styles.checklistItem}>
                  <View className={classnames(styles.checklistCheck, !item.checked && styles.checklistUncheck)}>
                    <Text>{item.checked ? '✓' : ''}</Text>
                  </View>
                  <Text className={styles.checklistText}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AgreementPage;
