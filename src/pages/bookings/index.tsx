import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Modal } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import type { Booking, Agreement } from '@/types/machine';
import { formatDate, getFailReasonLabel } from '@/utils/format';
import styles from './index.module.scss';

const FAIL_REASONS = [
  { key: 'price_gap', label: '价格差距大' },
  { key: 'condition_mismatch', label: '车况不符' },
  { key: 'paperwork_issue', label: '手续不齐' },
  { key: 'other', label: '其他原因' }
];

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'agreements'>('bookings');
  const [showFailModal, setShowFailModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [currentAgreementForChecklist, setCurrentAgreementForChecklist] = useState<Agreement | null>(null);

  const bookings = useAppStore((s) => s.bookings);
  const agreements = useAppStore((s) => s.agreements);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const updateAgreementStatus = useAppStore((s) => s.updateAgreementStatus);
  const addAgreement = useAppStore((s) => s.addAgreement);
  const machines = useAppStore((s) => s.machines);
  const user = useAppStore((s) => s.user);

  const getStatusBadge = (status: Booking['status']) => {
    const statusMap: Record<string, { className: string; text: string; textClass: string }> = {
      pending: { className: styles.statusPending, text: '待确认', textClass: styles.statusPendingText },
      confirmed: { className: styles.statusConfirmed, text: '已确认', textClass: styles.statusConfirmedText },
      completed: { className: styles.statusCompleted, text: '已完成', textClass: styles.statusCompletedText },
      cancelled: { className: styles.statusCancelled, text: '已取消', textClass: styles.statusCancelledText }
    };
    const cfg = statusMap[status];
    return (
      <View className={classnames(styles.statusBadge, cfg.className)}>
        <Text className={cfg.textClass}>{cfg.text}</Text>
      </View>
    );
  };

  const getAgreementStatusBadge = (status: Agreement['status']) => {
    const statusMap: Record<string, { className: string; text: string; textClass: string }> = {
      draft: { className: styles.statusPending, text: '待签署', textClass: styles.statusPendingText },
      signed: { className: styles.statusConfirmed, text: '已签署', textClass: styles.statusConfirmedText },
      completed: { className: styles.statusCompleted, text: '已完成', textClass: styles.statusCompletedText },
      failed: { className: styles.statusCancelled, text: '已失败', textClass: styles.statusCancelledText }
    };
    const cfg = statusMap[status];
    return (
      <View className={classnames(styles.statusBadge, cfg.className)}>
        <Text className={cfg.textClass}>{cfg.text}</Text>
      </View>
    );
  };

  const handleConfirmBooking = (id: string) => {
    Taro.showModal({
      title: '确认看机',
      content: '确认已经完成看机？',
      success: (res) => {
        if (res.confirm) {
          updateBookingStatus(id, 'completed');
          Taro.showToast({ title: '已确认完成', icon: 'success' });
        }
      }
    });
  };

  const handleCancelBooking = (id: string) => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          updateBookingStatus(id, 'cancelled');
          Taro.showToast({ title: '已取消预约', icon: 'success' });
        }
      }
    });
  };

  const handleCreateAgreement = (booking: Booking) => {
    Taro.showModal({
      title: '生成定金协议',
      content: `确认与${booking.sellerName}生成${booking.machineTitle}的定金协议？`,
      success: (res) => {
        if (res.confirm && user) {
          const machine = machines.find((m) => m.id === booking.machineId);
          const newAgreement: Agreement = {
            id: `a_${Date.now()}`,
            machineId: booking.machineId,
            machineTitle: booking.machineTitle,
            buyerId: user.id,
            buyerName: user.name,
            sellerId: booking.sellerId,
            sellerName: booking.sellerName,
            deposit: machine ? Math.round(machine.price * 0.05) : 5000,
            totalPrice: machine?.price || 0,
            status: 'draft',
            createdAt: new Date().toISOString()
          };
          addAgreement(newAgreement);
          updateBookingStatus(booking.id, 'completed');
          Taro.showToast({ title: '协议已生成', icon: 'success' });
        }
      }
    });
  };

  const handleSignAgreement = (agreement: Agreement) => {
    Taro.showModal({
      title: '签署协议',
      content: '确认签署此定金协议？',
      success: (res) => {
        if (res.confirm) {
          updateAgreementStatus(agreement.id, 'signed');
          Taro.showToast({ title: '已签署', icon: 'success' });
        }
      }
    });
  };

  const handleCompleteAgreement = (agreement: Agreement) => {
    setCurrentAgreementForChecklist(agreement);
    setShowChecklist(true);
  };

  const handleConfirmComplete = () => {
    if (currentAgreementForChecklist) {
      updateAgreementStatus(currentAgreementForChecklist.id, 'completed');
      setShowChecklist(false);
      setCurrentAgreementForChecklist(null);
      Taro.showToast({ title: '交易已完成', icon: 'success' });
    }
  };

  const handleFailAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setSelectedReason('');
    setShowFailModal(true);
  };

  const handleConfirmFail = () => {
    if (!selectedReason || !selectedAgreement) return;
    updateAgreementStatus(selectedAgreement.id, 'failed', selectedReason as Agreement['failReason']);
    setShowFailModal(false);
    setSelectedAgreement(null);
    setSelectedReason('');
    Taro.showToast({ title: '已标记失败', icon: 'success' });
  };

  const checklistItems = useMemo(() => [
    { label: '设备外观检查', checked: true },
    { label: '发动机启动正常', checked: true },
    { label: '液压系统无渗漏', checked: true },
    { label: '行走系统正常', checked: true },
    { label: '回转机构正常', checked: true },
    { label: '臂架动作正常', checked: true },
    { label: '手续证件齐全', checked: true },
    { label: '定金已支付', checked: true }
  ], []);

  return (
    <View className={styles.bookingsPage}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'bookings' && styles.tabItemActive)}
          onClick={() => setActiveTab('bookings')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'bookings' && styles.tabTextActive)}>
            预约记录 ({bookings.length})
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'agreements' && styles.tabItemActive)}
          onClick={() => setActiveTab('agreements')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'agreements' && styles.tabTextActive)}>
            协议清单 ({agreements.length})
          </Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.scrollView}>
        {activeTab === 'bookings' ? (
          <View className={styles.list}>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <View key={booking.id} className={styles.bookingCard}>
                  <View className={styles.bookingHeader}>
                    <Text className={styles.bookingTitle}>{booking.machineTitle}</Text>
                    {getStatusBadge(booking.status)}
                  </View>
                  <View className={styles.bookingInfo}>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>看机时间</Text>
                      <Text className={styles.bookingValue}>{booking.viewTime}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>看机地点</Text>
                      <Text className={styles.bookingValue}>{booking.location}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>联系人</Text>
                      <Text className={styles.bookingValue}>{booking.contactName} {booking.contactPhone}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>卖家</Text>
                      <Text className={styles.bookingValue}>{booking.sellerName} {booking.sellerPhone}</Text>
                    </View>
                  </View>
                  {booking.status === 'pending' && (
                    <View className={styles.bookingActions}>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnOutline)}
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Text className={styles.actionBtnText}>取消预约</Text>
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnSuccess)}
                        onClick={() => handleConfirmBooking(booking.id)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>确认看机</Text>
                      </View>
                    </View>
                  )}
                  {booking.status === 'confirmed' && (
                    <View className={styles.bookingActions}>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnOutline)}
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Text className={styles.actionBtnText}>取消</Text>
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                        onClick={() => handleCreateAgreement(booking)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>生成定金协议</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState title="暂无预约记录" description="去逛逛找到心仪设备预约看机" />
              </View>
            )}
          </View>
        ) : (
          <View className={styles.list}>
            {agreements.length > 0 ? (
              agreements.map((agreement) => (
                <View key={agreement.id} className={styles.bookingCard}>
                  <View className={styles.bookingHeader}>
                    <Text className={styles.bookingTitle}>{agreement.machineTitle}</Text>
                    {getAgreementStatusBadge(agreement.status)}
                  </View>
                  <View className={styles.bookingInfo}>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>买家</Text>
                      <Text className={styles.bookingValue}>{agreement.buyerName}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>卖家</Text>
                      <Text className={styles.bookingValue}>{agreement.sellerName}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>定金</Text>
                      <Text className={styles.bookingValue}>¥{agreement.deposit.toLocaleString()}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>成交价</Text>
                      <Text className={styles.bookingValue}>¥{agreement.totalPrice.toLocaleString()}</Text>
                    </View>
                    <View className={styles.bookingRow}>
                      <Text className={styles.bookingLabel}>创建时间</Text>
                      <Text className={styles.bookingValue}>{formatDate(agreement.createdAt)}</Text>
                    </View>
                  </View>
                  {agreement.failReason && (
                    <View style={{ paddingTop: 16, marginTop: 16, borderTop: '2rpx solid #f0f0f0' }}>
                      <Text style={{ fontSize: 24, color: '#ff4d4f' }}>
                        失败原因：{getFailReasonLabel(agreement.failReason)}
                      </Text>
                    </View>
                  )}
                  {agreement.status === 'draft' && (
                    <View className={styles.bookingActions}>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                        onClick={() => handleFailAgreement(agreement)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>标记失败</Text>
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                        onClick={() => handleSignAgreement(agreement)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>签署协议</Text>
                      </View>
                    </View>
                  )}
                  {agreement.status === 'signed' && (
                    <View className={styles.bookingActions}>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                        onClick={() => handleFailAgreement(agreement)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>交易失败</Text>
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.actionBtnSuccess)}
                        onClick={() => handleCompleteAgreement(agreement)}
                      >
                        <Text className={styles.actionBtnTextPrimary}>确认成交</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState title="暂无协议" description="完成看机后可生成定金协议" />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        title="选择失败原因"
        isOpen={showFailModal}
        onClose={() => setShowFailModal(false)}
        content={
          <View className={styles.failModalContent}>
            <Text className={styles.failModalTitle}>请选择交易失败原因</Text>
            {FAIL_REASONS.map((reason) => (
              <View
                key={reason.key}
                className={styles.failOption}
                onClick={() => setSelectedReason(reason.key)}
              >
                <Text className={styles.failOptionText}>{reason.label}</Text>
                <View
                  className={classnames(
                    styles.failOptionCheck,
                    selectedReason === reason.key && styles.failOptionCheckActive
                  )}
                >
                  {selectedReason === reason.key && <Text>✓</Text>}
                </View>
              </View>
            ))}
            <View className={styles.modalFooter}>
              <View className={styles.modalCancelBtn} onClick={() => setShowFailModal(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleConfirmFail}>
                <Text className={styles.modalConfirmText}>确认提交</Text>
              </View>
            </View>
          </View>
        }
      />

      <Modal
        title="交机清单"
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
        content={
          <View className={styles.failModalContent}>
            <Text className={styles.failModalTitle}>请确认交机检查项</Text>
            {checklistItems.map((item) => (
              <View key={item.label} className={styles.checklistItem}>
                <View className={classnames(styles.checklistCheck, !item.checked && styles.checklistUncheck)}>
                  <Text>{item.checked ? '✓' : ''}</Text>
                </View>
                <Text className={styles.checklistText}>{item.label}</Text>
              </View>
            ))}
            <View className={styles.modalFooter}>
              <View className={styles.modalCancelBtn} onClick={() => setShowChecklist(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleConfirmComplete}>
                <Text className={styles.modalConfirmText}>确认交机完成</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default BookingsPage;
