import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import MachineCard from '@/components/MachineCard';
import EmptyState from '@/components/EmptyState';
import { machines } from '@/data/machines';
import styles from './index.module.scss';

const FavoritesPage = () => {
  const [priceAlert, setPriceAlert] = useState(false);
  const favoriteMachines = machines.slice(0, 4);

  const handleMachineClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className={styles.favoritesPage}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>收藏车源 ({favoriteMachines.length})</Text>
        <View className={styles.alertToggle} onClick={() => setPriceAlert(!priceAlert)}>
          <Text className={classnames(styles.alertToggleText, priceAlert && styles.alertToggleTextActive)}>
            {priceAlert ? '🔔 降价提醒开' : '🔕 降价提醒关'}
          </Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={styles.list}>
          {favoriteMachines.length > 0 ? (
            favoriteMachines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} onClick={handleMachineClick} />
            ))
          ) : (
            <View className={styles.emptyWrap}>
              <EmptyState title="暂无收藏" description="去逛逛找找心仪设备" />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoritesPage;
