import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import MachineCard from '@/components/MachineCard';
import EmptyState from '@/components/EmptyState';
import { categories } from '@/data/machines';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const ALL_CITIES = ['全部', '成都', '重庆', '绵阳', '德阳', '宜宾', '泸州', '南充', '乐山', '其他'];

const FindPage = () => {
  const machines = useAppStore((s) => s.machines);
  const currentCity = useAppStore((s) => s.currentCity);
  const setCurrentCity = useAppStore((s) => s.setCurrentCity);

  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [canViewToday, setCanViewToday] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);
  const [selectedCity, setSelectedCity] = useState('全部');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    setSelectedCity(currentCity || '全部');
  }, [currentCity]);

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

    if (selectedCity && selectedCity !== '全部') {
      result = result.filter((m) => m.city === selectedCity);
    }

    if (canViewToday) {
      result = result.filter((m) => m.canViewToday);
    }

    if (includeTransport) {
      result = result.filter((m) => m.includeTransport);
    }

    return result;
  }, [machines, keyword, activeCategory, selectedCity, canViewToday, includeTransport]);

  const stats = useMemo(() => {
    return {
      total: filteredMachines.length,
      todayView: filteredMachines.filter((m) => m.canViewToday).length,
      withTransport: filteredMachines.filter((m) => m.includeTransport).length,
      nearby: filteredMachines.length
    };
  }, [filteredMachines]);

  const handleMachineClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleUrgent = () => {
    Taro.navigateTo({ url: '/pages/urgent/index' });
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (city !== '全部') {
      setCurrentCity(city);
    }
    setShowCityPicker(false);
  };

  const getCityDisplay = () => {
    if (selectedCity === '全部') return '全部城市';
    return selectedCity;
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

      <View className={styles.citySection}>
        <View className={styles.cityCurrent} onClick={() => setShowCityPicker(!showCityPicker)}>
          <Text className={styles.cityCurrentText}>📍 {getCityDisplay()}</Text>
          <Text className={styles.cityArrow}>{showCityPicker ? '▲' : '▼'}</Text>
        </View>
        <View className={styles.cityStats}>
          <Text className={styles.cityStat}>附近{stats.nearby}台</Text>
          <Text className={styles.cityStat}>当天可看{stats.todayView}台</Text>
        </View>
        {showCityPicker && (
          <View className={styles.cityPicker}>
            {ALL_CITIES.map((city) => (
              <View
                key={city}
                className={classnames(styles.cityOption, selectedCity === city && styles.cityOptionActive)}
                onClick={() => handleCitySelect(city)}
              >
                <Text className={classnames(styles.cityOptionText, selectedCity === city && styles.cityOptionTextActive)}>
                  {city === '全部' ? '🌐' : '📍'} {city}
                </Text>
              </View>
            ))}
          </View>
        )}
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
              当天可看 {canViewToday && `(${stats.todayView})`}
            </Text>
          </View>
          <View
            className={classnames(styles.filterChip, includeTransport && styles.filterChipActive)}
            onClick={() => setIncludeTransport(!includeTransport)}
          >
            <Text className={classnames(styles.filterChipText, includeTransport && styles.filterChipTextActive)}>
              包板车 {includeTransport && `(${stats.withTransport})`}
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
