import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { getRoleLabel, formatPrice, formatDate, getFailReasonLabel } from '@/utils/format';
import styles from './index.module.scss';

const MinePage = () => {
  const user = useAppStore((s) => s.user);
  const myPublished = useAppStore((s) => s.myPublished);
  const favorites = useAppStore((s) => s.favorites);
  const bookings = useAppStore((s) => s.bookings);
  const agreements = useAppStore((s) => s.agreements);

  const stats = useMemo(() => {
    const completedAgreements = agreements.filter((a) => a.status === 'completed');
    return {
      publishedCount: myPublished.length,
      dealCount: completedAgreements.length,
      favoriteCount: favorites.length,
      bookingCount: bookings.length
    };
  }, [myPublished, agreements, favorites, bookings]);

  const recentDeals = useMemo(() => {
    return agreements.slice(0, 5).map((agreement) => {
      let statusText = '';
      let dotStyle = '';
      if (agreement.status === 'completed') {
        statusText = '已成交';
        dotStyle = 'dealDotSuccess';
      } else if (agreement.status === 'failed') {
        statusText = `失败-${getFailReasonLabel(agreement.failReason || 'other')}`;
        dotStyle = 'dealDotFail';
      } else if (agreement.status === 'signed') {
        statusText = '已签署，待交机';
        dotStyle = 'dealDotPending';
      } else {
        statusText = '待签署';
        dotStyle = 'dealDotPending';
      }
      return {
        id: agreement.id,
        machine: agreement.machineTitle,
        status: agreement.status,
        statusText,
        price: agreement.totalPrice,
        dotStyle,
        date: agreement.createdAt
      };
    });
  }, [agreements]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
  }, [bookings]);

  const pendingAgreements = useMemo(() => {
    return agreements.filter((a) => a.status === 'draft' || a.status === 'signed').length;
  }, [agreements]);

  if (!user) return null;

  return (
    <View className={styles.minePage}>
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.profileHeader}>
          <View className={styles.profileInfo}>
            <View className={styles.profileAvatar} style={{ backgroundImage: `url(${user.avatar})` }} />
            <View className={styles.profileDetail}>
              <Text className={styles.profileName}>{user.name}</Text>
              <View className={styles.profileRole}>
                <Text className={styles.profileRoleText}>{getRoleLabel(user.role)}</Text>
              </View>
              <Text className={styles.profilePhone}>{user.phone}</Text>
              {user.company && (
                <Text className={styles.profileCompany}>{user.company}</Text>
              )}
            </View>
          </View>
        </View>

        <View className={styles.statsSection}>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{stats.publishedCount}</Text>
              <Text className={styles.statLabel}>发布车源</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{stats.dealCount}</Text>
              <Text className={styles.statLabel}>成交次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{stats.favoriteCount}</Text>
              <Text className={styles.statLabel}>收藏车源</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{user.rating}</Text>
              <Text className={styles.statLabel}>信用评分</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuSection}>
          <Text className={styles.menuTitle}>车源管理</Text>
          <View
            className={styles.menuItem}
            onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
          >
            <Text className={styles.menuIcon}>🚗</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>我的发布</Text>
              <Text className={styles.menuDesc}>管理已发布的设备（{myPublished.length}台）</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })}
          >
            <Text className={styles.menuIcon}>⭐</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>我的收藏</Text>
              <Text className={styles.menuDesc}>收藏的车源和降价提醒（{favorites.length}台）</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.menuSection}>
          <Text className={styles.menuTitle}>交易管理</Text>
          <View
            className={styles.menuItem}
            onClick={() => Taro.navigateTo({ url: '/pages/bookings/index' })}
          >
            <Text className={styles.menuIcon}>📅</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>预约记录</Text>
              <Text className={styles.menuDesc}>看机预约与行程安排（{bookings.length}条）</Text>
            </View>
            {pendingBookings > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuBadgeText}>{pendingBookings}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.navigateTo({ url: '/pages/bookings/index?tab=agreements' })}
          >
            <Text className={styles.menuIcon}>📋</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>协议清单</Text>
              <Text className={styles.menuDesc}>定金协议和交机清单（{agreements.length}条）</Text>
            </View>
            {pendingAgreements > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuBadgeText}>{pendingAgreements}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.navigateTo({ url: '/pages/urgent/index' })}
          >
            <Text className={styles.menuIcon}>🚨</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>急找设备</Text>
              <Text className={styles.menuDesc}>发布和查看急找需求</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        {recentDeals.length > 0 && (
          <View className={styles.dealSection}>
            <Text className={styles.dealTitle}>最近交易</Text>
            {recentDeals.map((deal) => (
              <View key={deal.id} className={styles.dealItem}>
                <View
                  className={classnames(
                    styles.dealDot,
                    deal.dotStyle === 'dealDotSuccess' && styles.dealDotSuccess,
                    deal.dotStyle === 'dealDotFail' && styles.dealDotFail,
                    deal.dotStyle === 'dealDotPending' && styles.dealDotPending
                  )}
                />
                <View className={styles.dealInfo}>
                  <Text className={styles.dealMachine}>{deal.machine}</Text>
                  <Text className={styles.dealStatus}>
                    {deal.statusText} · {formatDate(deal.date)}
                  </Text>
                </View>
                <Text className={styles.dealPrice}>{formatPrice(deal.price)}</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.menuSection}>
          <Text className={styles.menuTitle}>其他</Text>
          <View className={styles.menuItem}>
            <Text className={styles.menuIcon}>⚙️</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>设置</Text>
              <Text className={styles.menuDesc}>账户与隐私设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <Text className={styles.menuIcon}>❓</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>帮助与反馈</Text>
              <Text className={styles.menuDesc}>常见问题和意见反馈</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.footer}>
          <Text className={styles.footerText}>铁甲直卖 v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
