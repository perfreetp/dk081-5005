import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { getRoleLabel, formatPrice } from '@/utils/format';
import styles from './index.module.scss';

const DEAL_RECORDS = [
  {
    id: 'd1',
    machine: '三一SY215C挖掘机',
    status: 'completed' as const,
    statusText: '已成交',
    price: 285000,
    dotStyle: 'dealDotSuccess' as const
  },
  {
    id: 'd2',
    machine: '卡特320D挖掘机',
    status: 'failed' as const,
    statusText: '失败-价格差距大',
    price: 260000,
    dotStyle: 'dealDotFail' as const
  },
  {
    id: 'd3',
    machine: '徐工XZ503J搅拌车',
    status: 'pending' as const,
    statusText: '协议签署中',
    price: 170000,
    dotStyle: 'dealDotPending' as const
  }
];

const MinePage = () => {
  const user = useAppStore((s) => s.user);

  if (!user) return null;

  return (
    <View className={styles.minePage}>
      <View className={styles.profileHeader}>
        <View className={styles.profileInfo}>
          <Image className={styles.profileAvatar} src={user.avatar} mode="aspectFill" />
          <View className={styles.profileDetail}>
            <Text className={styles.profileName}>{user.name}</Text>
            <View className={styles.profileRole}>
              <Text className={styles.profileRoleText}>{getRoleLabel(user.role)}</Text>
            </View>
            <Text className={styles.profilePhone}>{user.phone}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.publishedCount}</Text>
            <Text className={styles.statLabel}>发布车源</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.dealCount}</Text>
            <Text className={styles.statLabel}>成交次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.favoriteCount}</Text>
            <Text className={styles.statLabel}>收藏车源</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.rating}</Text>
            <Text className={styles.statLabel}>信用评分</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })}>
          <Text className={styles.menuIcon}>⭐</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>我的收藏</Text>
            <Text className={styles.menuDesc}>收藏的车源和降价提醒</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/urgent/index' })}>
          <Text className={styles.menuIcon}>🚨</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>急找设备</Text>
            <Text className={styles.menuDesc}>发布和查看急找需求</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/agreement/index' })}>
          <Text className={styles.menuIcon}>📋</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>我的协议</Text>
            <Text className={styles.menuDesc}>定金协议和交机清单</Text>
          </View>
          <View className={styles.menuBadge}>
            <Text className={styles.menuBadgeText}>1</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>📍</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>我的发布</Text>
            <Text className={styles.menuDesc}>管理已发布的设备</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>🔔</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>降价提醒</Text>
            <Text className={styles.menuDesc}>关注机型降价通知</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>⚙️</Text>
          <View className={styles.menuContent}>
            <Text className={styles.menuLabel}>设置</Text>
            <Text className={styles.menuDesc}>账户与隐私设置</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.dealSection}>
        <Text className={styles.dealTitle}>最近成交</Text>
        {DEAL_RECORDS.map((deal) => (
          <View key={deal.id} className={styles.dealItem}>
            <View className={classnames(styles.dealDot, deal.status === 'completed' && styles.dealDotSuccess, deal.status === 'failed' && styles.dealDotFail, deal.status === 'pending' && styles.dealDotPending)} />
            <View className={styles.dealInfo}>
              <Text className={styles.dealMachine}>{deal.machine}</Text>
              <Text className={styles.dealStatus}>{deal.statusText}</Text>
            </View>
            <Text className={styles.dealPrice}>{formatPrice(deal.price)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MinePage;
