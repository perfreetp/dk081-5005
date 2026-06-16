import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Textarea, Image, Video, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { categories } from '@/data/machines';
import { formatPrice, getCategoryLabel, formatTime } from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';
import type { PublishForm, Machine } from '@/types/machine';
import styles from './index.module.scss';

const QUICK_TAGS = ['当天可看', '包板车', '手续齐全', '急出', '可议价', '原厂漆', '准新车', '低工时'];

const PublishPage = () => {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const currentDraft = useAppStore((s) => s.currentDraft);
  const drafts = useAppStore((s) => s.drafts);
  const myPublished = useAppStore((s) => s.myPublished);
  const publishMachine = useAppStore((s) => s.publishMachine);
  const updateMachine = useAppStore((s) => s.updateMachine);
  const removeMachine = useAppStore((s) => s.removeMachine);
  const saveDraft = useAppStore((s) => s.saveDraft);
  const setCurrentDraft = useAppStore((s) => s.setCurrentDraft);
  const currentCity = useAppStore((s) => s.currentCity);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(currentCity || '');
  const [price, setPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [canViewToday, setCanViewToday] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);

  useEffect(() => {
    if (currentDraft) {
      console.info('[Publish] 从草稿恢复编辑', currentDraft);
      setBrand(currentDraft.brand);
      setModel(currentDraft.model);
      setCategory(currentDraft.category);
      setYear(String(currentDraft.year));
      setHours(String(currentDraft.hours));
      setLocation(currentDraft.location);
      setCity(currentDraft.city || currentCity);
      setPrice(String(currentDraft.price));
      setMinPrice(String(currentDraft.minPrice));
      setTags(currentDraft.tags || []);
      setDescription(currentDraft.description);
      setCanViewToday(currentDraft.canViewToday);
      setIncludeTransport(currentDraft.includeTransport);
      setImages(currentDraft.images || []);
      setVideoUrl(currentDraft.videoUrl || '');
      setEditingDraftId(currentDraft.id || null);
      setEditingMachineId(null);
      setCurrentDraft(null);
      setActiveTab('form');
    }
  }, [currentDraft]);

  const highlights = useMemo(() => {
    const points: string[] = [];
    if (year) points.push(`${year}年上牌`);
    if (hours && Number(hours) > 0) points.push(`工时${Number(hours).toLocaleString()}小时`);
    if (brand) points.push(`${brand}正品`);
    if (canViewToday) points.push('当天可实地看机');
    if (includeTransport) points.push('包板车运输');
    if (tags.length > 0) points.push(...tags);
    return points;
  }, [year, hours, brand, canViewToday, includeTransport, tags]);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleChooseImage = async () => {
    try {
      const remaining = 6 - images.length;
      if (remaining <= 0) {
        Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
        return;
      }
      const res = await Taro.chooseMedia({
        count: remaining,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed']
      });
      const tempFiles = res.tempFiles.map((f) => f.tempFilePath);
      console.info('[Publish] 选择图片', tempFiles);
      setImages([...images, ...tempFiles]);
    } catch (err) {
      console.error('[Publish] 选择图片失败', err);
    }
  };

  const handleChooseVideo = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album', 'camera'],
        maxDuration: 30
      });
      const tempFile = res.tempFiles[0]?.tempFilePath;
      if (tempFile) {
        console.info('[Publish] 选择视频', tempFile);
        setVideoUrl(tempFile);
      }
    } catch (err) {
      console.error('[Publish] 选择视频失败', err);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
  };

  const getFormData = (): PublishForm => ({
    id: editingDraftId || undefined,
    brand,
    model,
    category,
    year: Number(year) || new Date().getFullYear(),
    hours: Number(hours) || 0,
    location,
    city,
    price: Number(price) || 0,
    minPrice: Number(minPrice) || 0,
    description,
    tags,
    images,
    videoUrl: videoUrl || undefined,
    canViewToday,
    includeTransport
  });

  const handleDraft = () => {
    const formData = getFormData();
    const draftId = saveDraft(formData, editingDraftId || undefined);
    console.info('[Publish] 保存草稿', draftId, formData);
    setEditingDraftId(draftId);
    Taro.showToast({ title: '已保存草稿', icon: 'success' });
  };

  const handlePublish = () => {
    if (!brand || !model || !category || !price) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }
    if (images.length === 0) {
      Taro.showToast({ title: '请至少上传1张图片', icon: 'none' });
      return;
    }
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (editingMachineId) {
      const updatedMachine: Partial<Machine> = {
        title: `${brand}${model}${getCategoryLabel(category)}`,
        brand,
        model,
        category,
        year: Number(year) || new Date().getFullYear(),
        hours: Number(hours) || 0,
        location: location || city,
        city,
        price: Number(price),
        minPrice: Number(minPrice) || Number(price),
        coverImage: images[0],
        images,
        videoUrl: videoUrl || undefined,
        tags,
        highlights,
        isUrgent: tags.includes('急出'),
        canViewToday,
        includeTransport
      };
      updateMachine(editingMachineId, updatedMachine);
      console.info('[Publish] 更新成功', updatedMachine);
      Taro.showToast({ title: '更新成功', icon: 'success' });
      setTimeout(() => {
        setActiveTab('list');
        resetForm();
      }, 1000);
    } else {
      const newMachine: Machine = {
        id: `m_new_${Date.now()}`,
        title: `${brand}${model}${getCategoryLabel(category)}`,
        brand,
        model,
        category,
        year: Number(year) || new Date().getFullYear(),
        hours: Number(hours) || 0,
        location: location || city,
        city,
        price: Number(price),
        minPrice: Number(minPrice) || Number(price),
        coverImage: images[0],
        images,
        videoUrl: videoUrl || undefined,
        tags,
        highlights,
        sellerId: user.id,
        sellerName: user.name,
        sellerAvatar: user.avatar,
        sellerRole: user.role,
        isUrgent: tags.includes('急出'),
        canViewToday,
        includeTransport,
        viewCount: 0,
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      publishMachine(newMachine);
      console.info('[Publish] 发布成功', newMachine);

      if (editingDraftId) {
        const { deleteDraft } = useAppStore.getState();
        deleteDraft(editingDraftId);
      }

      Taro.showToast({ title: '发布成功', icon: 'success' });

      setTimeout(() => {
        resetForm();
        setActiveTab('list');
      }, 1000);
    }
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setCategory('');
    setYear(String(new Date().getFullYear()));
    setHours('');
    setLocation('');
    setCity(currentCity || '');
    setPrice('');
    setMinPrice('');
    setTags([]);
    setDescription('');
    setCanViewToday(false);
    setIncludeTransport(false);
    setImages([]);
    setVideoUrl('');
    setEditingDraftId(null);
    setEditingMachineId(null);
    setCurrentDraft(null);
  };

  const handleEditMachine = (machine: Machine) => {
    setBrand(machine.brand);
    setModel(machine.model);
    setCategory(machine.category);
    setYear(String(machine.year));
    setHours(String(machine.hours));
    setLocation(machine.location);
    setCity(machine.city);
    setPrice(String(machine.price));
    setMinPrice(String(machine.minPrice));
    setTags(machine.tags);
    setDescription(machine.description || '');
    setCanViewToday(machine.canViewToday);
    setIncludeTransport(machine.includeTransport);
    setImages(machine.images);
    setVideoUrl(machine.videoUrl || '');
    setEditingMachineId(machine.id);
    setEditingDraftId(null);
    setActiveTab('form');
  };

  const handleDeleteMachine = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条发布吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          removeMachine(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleGoDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className={styles.publishPage}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'list' && styles.tabItemActive)}
          onClick={() => setActiveTab('list')}
        >
          <Text className={classnames(styles.tabText, activeTab === 'list' && styles.tabTextActive)}>
            我的发布
          </Text>
          {myPublished.length > 0 && (
            <View className={styles.tabBadge}>
              <Text className={styles.tabBadgeText}>{myPublished.length}</Text>
            </View>
          )}
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'form' && styles.tabItemActive)}
          onClick={() => { resetForm(); setActiveTab('form'); }}
        >
          <Text className={classnames(styles.tabText, activeTab === 'form' && styles.tabTextActive)}>
            {editingMachineId ? '编辑设备' : '发布新车'}
          </Text>
        </View>
      </View>

      {activeTab === 'list' ? (
        <ScrollView scrollY className={styles.listScroll}>
          {drafts.length > 0 && (
            <View className={styles.draftSection}>
              <Text className={styles.draftTitle}>📝 草稿箱 ({drafts.length})</Text>
              <ScrollView scrollX className={styles.draftScroll}>
                {drafts.map((draft) => (
                  <View
                    key={draft.id}
                    className={styles.draftCard}
                    onClick={() => setCurrentDraft(draft)}
                  >
                    {draft.images && draft.images.length > 0 ? (
                      <Image className={styles.draftImage} src={draft.images[0]} mode="aspectFill" />
                    ) : (
                      <View className={styles.draftImageEmpty}>
                        <Text>📷</Text>
                      </View>
                    )}
                    <View className={styles.draftInfo}>
                      <Text className={styles.draftMachine}>
                        {draft.brand || '未填写'} {draft.model || '未填写'}
                      </Text>
                      <Text className={styles.draftPrice}>
                        {draft.price ? formatPrice(draft.price) : '价格未填'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View className={styles.publishedSection}>
            <Text className={styles.sectionTitle}>已发布 ({myPublished.length}台)</Text>
            {myPublished.length > 0 ? (
              <View className={styles.publishedList}>
                {myPublished.map((machine) => (
                  <View key={machine.id} className={styles.publishedCard}>
                    <View
                      className={styles.publishedImage}
                      style={{ backgroundImage: `url(${machine.coverImage})` }}
                      onClick={() => handleGoDetail(machine.id)}
                    >
                      {machine.status === 'active' ? (
                        <View className={styles.statusActive}>
                          <Text className={styles.statusActiveText}>在售</Text>
                        </View>
                      ) : (
                        <View className={styles.statusSold}>
                          <Text className={styles.statusSoldText}>已售出</Text>
                        </View>
                      )}
                    </View>
                    <View className={styles.publishedInfo}>
                      <Text className={styles.publishedTitle}>{machine.title}</Text>
                      <Text className={styles.publishedPrice}>{formatPrice(machine.price)}</Text>
                      <View className={styles.publishedMeta}>
                        <Text className={styles.publishedMetaText}>
                          {machine.year}年 · {formatTime(machine.hours)}小时
                        </Text>
                        <Text className={styles.publishedMetaText}>📍 {machine.city}</Text>
                      </View>
                      <View className={styles.publishedActions}>
                        <View
                          className={styles.actionBtnOutline}
                          onClick={() => handleEditMachine(machine)}
                        >
                          <Text className={styles.actionBtnOutlineText}>编辑</Text>
                        </View>
                        <View
                          className={styles.actionBtnDanger}
                          onClick={() => handleDeleteMachine(machine.id)}
                        >
                          <Text className={styles.actionBtnDangerText}>删除</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyPublished}>
                <Text className={styles.emptyIcon}>🚜</Text>
                <Text className={styles.emptyTitle}>还没有发布设备</Text>
                <Text className={styles.emptyDesc}>点击上方"发布新车"开始发布第一台设备吧</Text>
                <View
                  className={styles.emptyActionBtn}
                  onClick={() => { resetForm(); setActiveTab('form'); }}
                >
                  <Text className={styles.emptyActionBtnText}>立即发布</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView scrollY className={styles.formScroll}>
          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>📋</Text>基本信息
            </Text>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}><Text className={styles.required}>*</Text>设备类别</Text>
              <View className={styles.categoryGrid}>
                {categories.slice(0, 8).map((cat) => (
                  <View
                    key={cat.id}
                    className={classnames(styles.categoryChip, category === cat.id && styles.categoryChipActive)}
                    onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                  >
                    <Text className={classnames(styles.categoryChipText, category === cat.id && styles.categoryChipTextActive)}>
                      {cat.icon} {cat.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.rowGroup}>
              <View className={styles.rowItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>品牌</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：三一、卡特"
                  placeholderClass={styles.formInputPlaceholder}
                  value={brand}
                  onInput={(e) => setBrand(e.detail.value)}
                />
              </View>
              <View className={styles.rowItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>型号</Text>
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
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>年份</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  placeholder="如：2020"
                  placeholderClass={styles.formInputPlaceholder}
                  value={year}
                  onInput={(e) => setYear(e.detail.value)}
                />
              </View>
              <View className={styles.rowItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>工时表读数</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="小时数"
                  placeholderClass={styles.formInputPlaceholder}
                  value={hours}
                  onInput={(e) => setHours(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>常驻工地</Text>
              <Input
                className={styles.formInput}
                placeholder="如：成都市双流区某工地"
                placeholderClass={styles.formInputPlaceholder}
                value={location}
                onInput={(e) => setLocation(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>所在城市</Text>
              <Input
                className={styles.formInput}
                placeholder="如：成都"
                placeholderClass={styles.formInputPlaceholder}
                value={city}
                onInput={(e) => setCity(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>💰</Text>价格设置
            </Text>

            <View className={styles.rowGroup}>
              <View className={styles.rowItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>挂牌价</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="元"
                  placeholderClass={styles.formInputPlaceholder}
                  value={price}
                  onInput={(e) => setPrice(e.detail.value)}
                />
              </View>
              <View className={styles.rowItem}>
                <Text className={styles.formLabel}>最低出手价</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="元（选填）"
                  placeholderClass={styles.formInputPlaceholder}
                  value={minPrice}
                  onInput={(e) => setMinPrice(e.detail.value)}
                />
              </View>
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>🎬</Text>短视频展示
            </Text>
            {videoUrl ? (
              <View className={styles.videoPreview}>
                <Video
                  className={styles.videoPlayer}
                  src={videoUrl}
                  controls
                  showCenterPlayBtn
                />
                <View className={styles.videoRemove} onClick={handleRemoveVideo}>
                  <Text className={styles.videoRemoveText}>✕</Text>
                </View>
              </View>
            ) : (
              <View className={styles.videoUpload} onClick={handleChooseVideo}>
                <Text className={styles.videoUploadIcon}>📹</Text>
                <Text className={styles.videoUploadText}>点击上传短视频</Text>
                <Text className={styles.videoUploadHint}>展示发动机启动、行走、回转、臂架动作</Text>
              </View>
            )}
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>📸</Text>设备照片 ({images.length}/6)
            </Text>
            <View className={styles.imageUploadRow}>
              {images.map((img, index) => (
                <View key={index} className={styles.imageItem}>
                  <Image className={styles.imagePreview} src={img} mode="aspectFill" />
                  <View className={styles.imageRemove} onClick={() => handleRemoveImage(index)}>
                    <Text className={styles.imageRemoveText}>✕</Text>
                  </View>
                </View>
              ))}
              {images.length < 6 && (
                <View className={styles.imageUploadItem} onClick={handleChooseImage}>
                  <Text className={styles.imageUploadAdd}>+</Text>
                  <Text className={styles.imageUploadHint}>上传照片</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>🏷️</Text>标签与描述
            </Text>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>快捷标签</Text>
              <View className={styles.tagInput}>
                {tags.map((tag) => (
                  <View key={tag} className={styles.tagItem}>
                    <Text className={styles.tagItemText}>{tag}</Text>
                    <Text className={styles.tagRemove} onClick={() => handleRemoveTag(tag)}>✕</Text>
                  </View>
                ))}
                {tags.length < 5 && (
                  <View className={styles.tagAddBtn} onClick={() => {}}>
                    <Text className={styles.tagAddText}>+ 添加</Text>
                  </View>
                )}
              </View>
              <View className={styles.quickTags}>
                {QUICK_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <View key={tag} className={styles.quickTag} onClick={() => handleAddTag(tag)}>
                    <Text className={styles.quickTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>补充描述</Text>
              <Textarea
                className={styles.textArea}
                placeholder="描述车况、维修记录、配件更换等..."
                placeholderClass={styles.formInputPlaceholder}
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
                maxlength={500}
              />
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionLabel}>
              <Text className={styles.sectionIcon}>⚙️</Text>交易设置
            </Text>

            <View className={styles.switchRow}>
              <View>
                <Text className={styles.switchLabel}>当天可看机</Text>
                <Text className={styles.switchDesc}>买家今天就能到现场看机</Text>
              </View>
              <View
                className={classnames(styles.switchControl, canViewToday && styles.switchControlActive)}
                onClick={() => setCanViewToday(!canViewToday)}
              >
                <View className={classnames(styles.switchThumb, canViewToday && styles.switchThumbActive)} />
              </View>
            </View>

            <View className={styles.switchRow}>
              <View>
                <Text className={styles.switchLabel}>包板车运输</Text>
                <Text className={styles.switchDesc}>卖家承担板车运输费用</Text>
              </View>
              <View
                className={classnames(styles.switchControl, includeTransport && styles.switchControlActive)}
                onClick={() => setIncludeTransport(!includeTransport)}
              >
                <View className={classnames(styles.switchThumb, includeTransport && styles.switchThumbActive)} />
              </View>
            </View>
          </View>

          <View className={styles.previewSection}>
            <Text className={styles.previewTitle}>卖点卡片预览</Text>
            <View className={styles.sellingCard}>
              <Text className={styles.sellingCardTitle}>{brand || '品牌'} {model || '型号'}</Text>
              <View className={styles.sellingPoints}>
                {highlights.length > 0 ? highlights.map((point) => (
                  <View key={point} className={styles.sellingPoint}>
                    <View className={styles.sellingPointDot} />
                    <Text className={styles.sellingPointText}>{point}</Text>
                  </View>
                )) : (
                  <Text className={styles.sellingPointText}>填写信息后自动生成卖点</Text>
                )}
              </View>
              <View className={styles.sellingCardMeta}>
                <Text className={styles.sellingCardPrice}>{price ? formatPrice(Number(price)) : '面议'}</Text>
                <Text className={styles.sellingCardLocation}>{city || '未知城市'}</Text>
              </View>
            </View>
          </View>

          <View className={styles.bottomBar}>
            {!editingMachineId && (
              <View className={styles.draftBtn} onClick={handleDraft}>
                <Text>{editingDraftId ? '更新草稿' : '存草稿'}</Text>
              </View>
            )}
            <View className={styles.publishBtn} onClick={handlePublish}>
              <Text>{editingMachineId ? '保存修改' : '立即发布'}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PublishPage;
