import React, { useState, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { machines } from '@/data/machines';
import { formatPrice, formatHours, getRoleLabel } from '@/utils/format';
import styles from './index.module.scss';

const DetailPage = () => {
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);

  const machine = useMemo(() => {
    const id = router.params.id;
    return machines.find((m) => m.id === id) || machines[0];
  }, [router.params.id]);

  const handleChat = () => {
    Taro.navigateTo({ url: `/pages/chat/index?machineId=${machine.id}` });
  };

  const handleBook = () => {
    Taro.navigateTo({ url: `/pages/booking/index?machineId=${machine.id}` });
  };

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: '13800006789' }).catch((err) => {
      console.error('[Detail] 拨打电话失败', err);
    });
  };

  return (
    <View className={styles.detailPage}>
      <View className={styles.imageSection}>
        <Swiper className={styles.mainImage} autoplay circular indicatorDots>
          {machine.images.map((img, idx) => (
            <SwiperItem key={idx}>
              <Image src={img} mode="aspectFill" style={{ width: '100%', height: '500rpx' }} />
            </SwiperItem>
          ))}
        </Swiper>
        {machine.videoUrl && (
          <View className={styles.videoBadge}>
            <Text className={styles.videoBadgeIcon}>▶️</Text>
            <Text className={styles.videoBadgeText}>有视频</Text>
          </View>
        )}
      </View>

      <View className={styles.infoSection}>
        <View className={styles.priceRow}>
          <Text className={styles.price}>{formatPrice(machine.price)}</Text>
          {machine.minPrice < machine.price && (
            <View className={styles.minPriceTag}>
              <Text className={styles.minPriceText}>底价{formatPrice(machine.minPrice)}</Text>
            </View>
          )}
        </View>
        <Text className={styles.title}>{machine.title}</Text>
        <View className={styles.tags}>
          {machine.tags.map((tag) => (
            <View key={tag} className={styles.tag}>
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View className={styles.metaGrid}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>品牌</Text>
            <Text className={styles.metaValue}>{machine.brand}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>型号</Text>
            <Text className={styles.metaValue}>{machine.model}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>年份</Text>
            <Text className={styles.metaValue}>{machine.year}年</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>工时</Text>
            <Text className={styles.metaValue}>{formatHours(machine.hours)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>所在城市</Text>
            <Text className={styles.metaValue}>{machine.city}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>看机方式</Text>
            <Text className={styles.metaValue}>{machine.canViewToday ? '当天可看' : '需预约'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.sellerSection}>
        <Image className={styles.sellerAvatar} src={machine.sellerAvatar} mode="aspectFill" />
        <View className={styles.sellerInfo}>
          <Text className={styles.sellerName}>{machine.sellerName}</Text>
          <View className={styles.sellerMeta}>
            <View className={styles.sellerRoleTag}>
              <Text className={styles.sellerRoleText}>{getRoleLabel(machine.sellerRole)}</Text>
            </View>
            <Text className={styles.sellerLocation}>{machine.city}</Text>
          </View>
        </View>
        <View className={styles.chatBtn} onClick={handleChat}>
          <Text className={styles.chatBtnText}>聊一聊</Text>
        </View>
      </View>

      <View className={styles.highlightsSection}>
        <Text className={styles.sectionTitle}>卖点卡片</Text>
        {machine.highlights.map((h) => (
          <View key={h} className={styles.highlightItem}>
            <View className={styles.highlightDot} />
            <Text className={styles.highlightText}>{h}</Text>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.favBtn} onClick={() => setIsFav(!isFav)}>
          <Text>{isFav ? '❤️' : '🤍'}</Text>
        </View>
        <View className={styles.bookBtn} onClick={handleBook}>
          <Text>预约看机</Text>
        </View>
        <View className={styles.callBtn} onClick={handleCall}>
          <Text>电话咨询</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
