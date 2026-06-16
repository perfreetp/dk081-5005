import React, { useState } from 'react';
import { View, Text, Input, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { categories, machines } from '@/data/machines';
import { formatPrice } from '@/utils/format';
import styles from './index.module.scss';

const MATCHED_MACHINES = machines.filter((m) => m.isUrgent).slice(0, 4);

const UrgentPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleBroadcast = () => {
    if (!selectedCategory || !location) {
      Taro.showToast({ title: '请填写类别和城市', icon: 'none' });
      return;
    }
    console.info('[Urgent] 广播急找需求', { selectedCategory, brand, model, location });
    Taro.showToast({ title: '已广播给周边卖家', icon: 'success' });
  };

  const handleMachineClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className={styles.urgentPage}>
      <View className={styles.banner}>
        <Text className={styles.bannerTitle}>🚨 急找设备广播</Text>
        <Text className={styles.bannerDesc}>发布需求，周边卖家立即收到通知</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>📝 需求信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>设备类别</Text>
          <View className={styles.categoryGrid}>
            {categories.slice(0, 8).map((cat) => (
              <View
                key={cat.id}
                className={classnames(styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive)}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              >
                <Text className={classnames(styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive)}>
                  {cat.icon} {cat.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.rowGroup}>
          <View className={styles.rowItem}>
            <Text className={styles.formLabel}>品牌（选填）</Text>
            <Input
              className={styles.formInput}
              placeholder="如：三一"
              placeholderClass={styles.formInputPlaceholder}
              value={brand}
              onInput={(e) => setBrand(e.detail.value)}
            />
          </View>
          <View className={styles.rowItem}>
            <Text className={styles.formLabel}>型号（选填）</Text>
            <Input
              className={styles.formInput}
              placeholder="如：SY215C"
              placeholderClass={styles.formInputPlaceholder}
              value={model}
              onInput={(e) => setModel(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.rowGroup}>
          <View className={styles.rowItem}>
            <Text className={styles.formLabel}>预算最低</Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="元"
              placeholderClass={styles.formInputPlaceholder}
              value={budgetMin}
              onInput={(e) => setBudgetMin(e.detail.value)}
            />
          </View>
          <View className={styles.rowItem}>
            <Text className={styles.formLabel}>预算最高</Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="元"
              placeholderClass={styles.formInputPlaceholder}
              value={budgetMax}
              onInput={(e) => setBudgetMax(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>所在城市</Text>
          <Input
            className={styles.formInput}
            placeholder="如：成都"
            placeholderClass={styles.formInputPlaceholder}
            value={location}
            onInput={(e) => setLocation(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>补充说明</Text>
          <Textarea
            className={styles.textArea}
            placeholder="描述你的具体需求..."
            placeholderClass={styles.formInputPlaceholder}
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={300}
          />
        </View>

        <View className={styles.broadcastInfo}>
          <Text className={styles.broadcastInfoText}>📢 广播后，50公里内匹配的卖家将收到推送通知</Text>
        </View>
      </View>

      <View className={styles.resultSection}>
        <Text className={styles.sectionLabel}>🎯 匹配车源</Text>
        {MATCHED_MACHINES.map((m) => (
          <View key={m.id} className={styles.resultItem} onClick={() => handleMachineClick(m.id)}>
            <Image className={styles.resultImage} src={m.coverImage} mode="aspectFill" />
            <View className={styles.resultInfo}>
              <Text className={styles.resultTitle}>{m.title}</Text>
              <Text className={styles.resultMeta}>{m.city} · {m.year}年 · {m.hours.toLocaleString()}h</Text>
            </View>
            <Text className={styles.resultPrice}>{formatPrice(m.price)}</Text>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.broadcastBtn} onClick={handleBroadcast}>
          <Text>立即广播给周边卖家</Text>
        </View>
      </View>
    </View>
  );
};

export default UrgentPage;
