import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { Machine } from '@/types/machine';
import { formatPrice, formatHours, getRoleLabel } from '@/utils/format';
import styles from './index.module.scss';

interface MachineCardProps {
  machine: Machine;
  onClick?: (id: string) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick }) => {
  return (
    <View className={styles.card} onClick={() => onClick?.(machine.id)}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.coverImage}
          src={machine.coverImage}
          mode="aspectFill"
        />
        {machine.isUrgent && (
          <View className={styles.urgentBadge}>急出</View>
        )}
        <View className={styles.yearBadge}>{machine.year}年</View>
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{machine.title}</Text>
        <View className={styles.tags}>
          {machine.tags.slice(0, 3).map((tag) => (
            <View key={tag} className={styles.tag}>
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View className={styles.meta}>
          <Text className={styles.metaItem}>工时 {formatHours(machine.hours)}</Text>
          <Text className={styles.metaDivider}>|</Text>
          <Text className={styles.metaItem}>{machine.city}</Text>
        </View>
        <View className={styles.bottom}>
          <View className={styles.priceWrap}>
            <Text className={styles.price}>{formatPrice(machine.price)}</Text>
            {machine.minPrice < machine.price && (
              <Text className={styles.minPrice}>底价{formatPrice(machine.minPrice)}</Text>
            )}
          </View>
          <View className={styles.seller}>
            <Image className={styles.sellerAvatar} src={machine.sellerAvatar} mode="aspectFill" />
            <Text className={styles.sellerName}>{machine.sellerName}</Text>
            <Text className={styles.sellerRole}>{getRoleLabel(machine.sellerRole)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MachineCard;
