import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = ''
}) => {
  return (
    <View className={styles.empty}>
      <Text className={styles.emptyIcon}>📭</Text>
      <Text className={styles.emptyTitle}>{title}</Text>
      {description && <Text className={styles.emptyDesc}>{description}</Text>}
    </View>
  );
};

export default EmptyState;
