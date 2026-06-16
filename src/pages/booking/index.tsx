import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/utils/format';
import type { Booking } from '@/types/machine';
import styles from './index.module.scss';

const TIME_SLOTS = ['今天上午', '今天下午', '明天上午', '明天下午', '后天上午', '后天下午'];

const BookingPage = () => {
  const router = useRouter();
  const machineId = router.params.machineId || 'm_001';

  const machines = useAppStore((s) => s.machines);
  const user = useAppStore((s) => s.user);
  const addBooking = useAppStore((s) => s.addBooking);

  const machine = useMemo(() => {
    return machines.find((m) => m.id === machineId) || machines[0];
  }, [machines, machineId]);

  const [selectedTime, setSelectedTime] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const handleSubmit = () => {
    if (!selectedTime || !contactName || !contactPhone) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (!user) return;

    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      machineId: machine.id,
      machineTitle: machine.title,
      sellerId: machine.sellerId,
      sellerName: machine.sellerName,
      sellerPhone: '138****1234',
      viewTime: selectedTime,
      location: machine.location,
      status: 'confirmed',
      contactName,
      contactPhone
    };

    addBooking(newBooking);
    Taro.showToast({ title: '预约成功', icon: 'success' });

    setTimeout(() => {
      Taro.redirectTo({ url: '/pages/bookings/index' });
    }, 1500);
  };

  const handleNavigate = () => {
    Taro.openLocation({
      latitude: 30.5728,
      longitude: 104.0668,
      name: machine.location,
      address: machine.location
    }).catch((err) => {
      console.error('[Booking] 打开导航失败', err);
    });
  };

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: '13800006789' }).catch((err) => {
      console.error('[Booking] 拨打电话失败', err);
    });
  };

  return (
    <View className={styles.bookingPage}>
      <View className={styles.machineCard}>
        <View className={styles.machineImage} style={{ backgroundImage: `url(${machine.coverImage})` }} />
        <View className={styles.machineInfo}>
          <Text className={styles.machineTitle}>{machine.title}</Text>
          <Text className={styles.machinePrice}>{formatPrice(machine.price)}</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>选择看机时间</Text>
        <View className={styles.timeSlots}>
          {TIME_SLOTS.map((slot) => (
            <View
              key={slot}
              className={classnames(styles.timeSlot, selectedTime === slot && styles.timeSlotActive)}
              onClick={() => setSelectedTime(slot)}
            >
              <Text className={classnames(styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive)}>
                {slot}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>看机地点</Text>
        <View className={styles.locationCard}>
          <Text className={styles.locationIcon}>📍</Text>
          <View className={styles.locationInfo}>
            <Text className={styles.locationAddress}>{machine.location}</Text>
            <Text className={styles.locationHint}>{machine.city} · {machine.canViewToday ? '当天可看' : '需预约'}</Text>
          </View>
          <View className={styles.navBtn} onClick={handleNavigate}>
            <Text className={styles.navBtnText}>导航</Text>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>联系人信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>您的姓名</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入姓名"
            placeholderClass={styles.formInputPlaceholder}
            value={contactName}
            onInput={(e) => setContactName(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>联系电话</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入手机号"
            placeholderClass={styles.formInputPlaceholder}
            value={contactPhone}
            onInput={(e) => setContactPhone(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>卖家联系方式</Text>
        <View className={styles.sellerCard}>
          <View className={styles.sellerAvatar} style={{ backgroundImage: `url(${machine.sellerAvatar})` }} />
          <View className={styles.sellerDetail}>
            <Text className={styles.sellerName}>{machine.sellerName}</Text>
            <Text className={styles.sellerPhone}>138****6789</Text>
          </View>
          <View className={styles.callBtn} onClick={handleCall}>
            <Text className={styles.callBtnText}>拨打电话</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>确认预约</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;
