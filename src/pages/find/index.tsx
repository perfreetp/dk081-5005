import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import MachineCard from '@/components/MachineCard';
import EmptyState from '@/components/EmptyState';
import { machines, categories } from '@/data/machines';
import styles from './index.module.scss';

const FindPage = () => {
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [canViewToday, setCanViewToday] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);

  const filteredMachines = useMemo(() => {
    let result = machines.filter((m) => m.status === 'active');
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(kw) ||
          m.brand.toLowerCase().includes(kw) ||
          m.model.toLowerCase().includes(kw)
      );
    }
    if (activeCategory) {
      result = result.filter((m) => m.category === activeCategory);
    }
    if (canViewToday) {
      result = result.filter((m) => m.canViewToday);
    }
    if (includeTransport) {
      result = result.filter((m) => m.includeTransport);
    }
    return result;
  }, [keyword, activeCategory, canViewToday, includeTransport]);

  const handleMachineClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleUrgent = () => {
    Taro.navigateTo({ url: '/pages/urgent/index' });
  };

  return (
    <View className={styles.findPage}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.brandWrap}>
            <Text className={styles.brandName}>铁甲直卖</Text>
            <Text className={styles.brandSub}>工地附近·当天能看·价格透明</Text>
          </View>
          <View className={styles.urgentBtn} onClick={handleUrgent}>
            <Text className={styles.urgentBtnText}>🔔 急找设备</Text>
          </View>
        </View>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索机型、品牌..."
            placeholderClass={styles.searchPlaceholder}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.categorySection}>
        <Text className={styles.sectionTitle}>设备分类</Text>
        <View className={styles.categoryGrid}>
          {categories.map((cat) => (
            <View
              key={cat.id}
              className={classnames(styles.categoryItem, activeCategory === cat.id && styles.categoryItemActive)}
              onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
            >
              <Text className={styles.categoryEmoji}>{cat.icon}</Text>
              <Text className={classnames(styles.categoryName, activeCategory === cat.id && styles.categoryNameActive)}>
                {cat.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterRow}>
          <View
            className={classnames(styles.filterChip, canViewToday && styles.filterChipActive)}
            onClick={() => setCanViewToday(!canViewToday)}
          >
            <Text className={classnames(styles.filterChipText, canViewToday && styles.filterChipTextActive)}>
              当天可看
            </Text>
          </View>
          <View
            className={classnames(styles.filterChip, includeTransport && styles.filterChipActive)}
            onClick={() => setIncludeTransport(!includeTransport)}
          >
            <Text className={classnames(styles.filterChipText, includeTransport && styles.filterChipTextActive)}>
              包板车
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.listSection}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>车源列表</Text>
          <Text className={styles.listCount}>共{filteredMachines.length}台</Text>
        </View>
        <ScrollView scrollY className={styles.scrollView}>
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} onClick={handleMachineClick} />
            ))
          ) : (
            <EmptyState title="暂无匹配车源" description="试试调整筛选条件" />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default FindPage;
