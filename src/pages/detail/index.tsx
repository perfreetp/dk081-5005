import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Swiper, SwiperItem, Video } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice, formatHours, getRoleLabel } from '@/utils/format';
import styles from './index.module.scss';

const DetailPage = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const machines = useAppStore((s) => s.machines);
  const user = useAppStore((s) => s.user);
  const isFavorite = useAppStore((s) => s.isFavorite);
  const hasPriceAlert = useAppStore((s) => s.hasPriceAlert);
  const addFavorite = useAppStore((s) => s.addFavorite);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const setPriceAlert = useAppStore((s) => s.setPriceAlert);
  const createConversation = useAppStore((s) => s.createConversation);

  const machine = useMemo(() => {
    const id = router.params.id;
    return machines.find((m) => m.id === id) || machines[0];
  }, [machines, router.params.id]);

  const fav = useMemo(() => isFavorite(machine.id), [isFavorite, machine.id]);
  const alert = useMemo(() => hasPriceAlert(machine.id), [hasPriceAlert, machine.id]);

  const handleToggleFavorite = () => {
    if (fav) {
      removeFavorite(machine.id);
      Taro.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      addFavorite(machine);
      Taro.showToast({ title: '已收藏', icon: 'success' });
    }
  };

  const handleTogglePriceAlert = () => {
    if (!fav) {
      Taro.showToast({ title: '请先收藏设备', icon: 'none' });
      return;
    }
    setPriceAlert(machine.id, !alert);
    Taro.showToast({ title: alert ? '已关闭降价提醒' : '已开启降价提醒', icon: 'success' });
  };

  const handleChat = () => {
    if (!user) return;

    const existingConversations = useAppStore.getState().conversations;
    const existingConv = existingConversations.find((c) => c.machineId === machine.id);

    if (existingConv) {
      Taro.navigateTo({ url: `/pages/chat/index?id=${existingConv.id}` });
    } else {
      const convId = createConversation(
        machine.id,
        { id: machine.sellerId, name: machine.sellerName, avatar: machine.sellerAvatar },
        { title: machine.title, image: machine.coverImage, price: machine.price }
      );
      Taro.navigateTo({ url: `/pages/chat/index?id=${convId}` });
    }
  };

  const handleBook = () => {
    Taro.navigateTo({ url: `/pages/booking/index?machineId=${machine.id}` });
  };

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: '13800006789' }).catch((err) => {
      console.error('[Detail] 拨打电话失败', err);
    });
  };

  const handleImageClick = (index: number) => {
    if (index === 0 && machine.videoUrl) {
      setShowVideo(true);
    }
  };

  const allMedia = useMemo(() => {
    const result = [...machine.images];
    return result;
  }, [machine.images]);

  return (
    <View className={styles.detailPage}>
      <View className={styles.imageSection}>
        {showVideo && machine.videoUrl ? (
          <View className={styles.videoContainer}>
            <Video
              className={styles.videoPlayer}
              src={machine.videoUrl}
              autoplay
              controls
              showFullscreenBtn
              showCenterPlayBtn
            />
            <View className={styles.videoCloseBtn} onClick={() => setShowVideo(false)}>
              <Text className={styles.videoCloseText}>✕ 返回图片</Text>
            </View>
          </View>
        ) : (
          <>
            <Swiper
              className={styles.mainImage}
              autoplay={false}
              circular
              indicatorDots
              current={currentImageIndex}
              onChange={(e) => setCurrentImageIndex(e.detail.current)}
            >
              {allMedia.map((img, idx) => (
                <SwiperItem key={idx} onClick={() => handleImageClick(idx)}>
                  <View className={styles.imageWrapper} style={{ backgroundImage: `url(${img})` }}>
                    {idx === 0 && machine.videoUrl && (
                      <View className={styles.playOverlay}>
                        <Text className={styles.playIcon}>▶️</Text>
                        <Text className={styles.playText}>点击播放视频</Text>
                      </View>
                    )}
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
            {machine.videoUrl && (
              <View className={styles.videoBadge}>
                <Text className={styles.videoBadgeIcon}>🎬</Text>
                <Text className={styles.videoBadgeText}>有视频</Text>
              </View>
            )}
          </>
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
        <View className={styles.sellerAvatar} style={{ backgroundImage: `url(${machine.sellerAvatar})` }} />
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
        <View className={styles.favBtn} onClick={handleToggleFavorite}>
          <Text className={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          <Text className={styles.favText}>收藏</Text>
        </View>
        <View
          className={classnames(styles.alertBtn, fav && styles.alertBtnActive)}
          onClick={handleTogglePriceAlert}
        >
          <Text className={styles.alertIcon}>{alert ? '🔔' : '🔕'}</Text>
          <Text className={classnames(styles.alertText, alert && styles.alertTextActive)}>
            {alert ? '降价提醒开' : '降价提醒'}
          </Text>
        </View>
        <View className={styles.bookBtn} onClick={handleBook}>
          <Text className={styles.bookBtnText}>预约看机</Text>
        </View>
        <View className={styles.callBtn} onClick={handleCall}>
          <Text className={styles.callBtnText}>电话咨询</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
