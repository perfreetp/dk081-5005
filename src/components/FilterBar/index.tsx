import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  activeValue?: string;
  onChange?: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ options, activeValue, onChange }) => {
  return (
    <View className={styles.filterBar}>
      {options.map((option) => (
        <View
          key={option.value}
          className={classnames(styles.filterItem, activeValue === option.value && styles.filterItemActive)}
          onClick={() => onChange?.(option.value)}
        >
          <Text className={classnames(styles.filterText, activeValue === option.value && styles.filterTextActive)}>
            {option.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default FilterBar;
