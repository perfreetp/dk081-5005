import React, { useMemo } from 'react';
import { View, Text, ScrollView, SwipeAction } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/utils/format';
import styles from './index.module.scss';

const FavoritesPage = () => {
  const favorites = useAppStore((s) => s.favorites);
  const machines = useAppStore((s) => s.machines);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const setPriceAlert = useAppStore((s) => s.setPriceAlert);

  const favoriteItems = useMemo(() => {
    return favorites.map((fav) => {
      const machine = machines.find((m) => m.id === fav.machineId);
      return {
        ...fav,
        machine
      };
    });
  }, [favorites, machines]);

  const handleMachineClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleRemoveFavorite = (machineId: string) => {
    Taro.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏这台设备吗？',
      success: (res) => {
        if (res.confirm) {
          removeFavorite(machineId);
          Taro.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  };

  const handleTogglePriceAlert = (machineId: string, currentAlert: boolean) => {
    setPriceAlert(machineId, !currentAlert);
    Taro.showToast({
      title: currentAlert ? '已关闭降价提醒' : '已开启降价提醒',
      icon: 'success'
    });
  };

  return (
    <View className={styles.favoritesPage}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>收藏车源 ({favoriteItems.length})</Text>
      </View>

      <ScrollView scrollY className={styles.scrollView}>
        {favoriteItems.length > 0 ? (
          <View className={styles.list}>
            {favoriteItems.map((item) => (
              <SwipeAction
                key={item.id}
                options={[
                  {
                    text: '取消收藏',
                    style: { backgroundColor: '#ff4d4f' },
                    onClick: () => handleRemoveFavorite(item.machineId)
                  }
                ]}
              >
                <View className={styles.favoriteCard}>
                  <View
                    className={styles.favoriteImage}
                    style={{ backgroundImage: `url(${item.machineImage})` }}
                    onClick={() => handleMachineClick(item.machineId)}
                  />
                  <View className={styles.favoriteInfo} onClick={() => handleMachineClick(item.machineId)}>
                    <Text className={styles.favoriteTitle}>{item.machineTitle}</Text>
                    <Text className={styles.favoritePrice}>{formatPrice(item.machinePrice)}</Text>
                    <View className={styles.favoriteMeta}>
                      {item.machine?.city && (
                        <Text className={styles.favoriteCity}>📍 {item.machine.city}</Text>
                      )}
                      {item.machine?.canViewToday && (
                        <View className={styles.todayTag}>
                          <Text className={styles.todayTagText}>当天可看</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View
                    className={classnames(styles.alertBtn, item.priceAlert && styles.alertBtnActive)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePriceAlert(item.machineId, item.priceAlert);
                    }}
                  >
                    <Text className={styles.alertIcon}>{item.priceAlert ? '🔔' : '🔕'}</Text>
                    <Text className={classnames(styles.alertText, item.priceAlert && styles.alertTextActive)}>
                      {item.priceAlert ? '提醒开' : '降价提醒'}
                    </Text>
                  </View>
                </View>
              </SwipeAction>
            ))}
          </View>
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState title="暂无收藏" description="去逛逛找找心仪设备" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FavoritesPage;
