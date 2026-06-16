import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { categories } from '@/data/machines';
import { formatPrice } from '@/utils/format';
import styles from './index.module.scss';

const QUICK_TAGS = ['当天可看', '包板车', '手续齐全', '急出', '可议价', '原厂漆', '准新车', '低工时'];

const PublishPage = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [canViewToday, setCanViewToday] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);

  const highlights = useMemo(() => {
    const points: string[] = [];
    if (year) points.push(`${year}年上牌`);
    if (hours) points.push(`工时${Number(hours).toLocaleString()}小时`);
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

  const handlePublish = () => {
    if (!brand || !model || !category || !price) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }
    console.info('[Publish] 发布车源', { brand, model, category, price, minPrice });
    Taro.showToast({ title: '发布成功', icon: 'success' });
  };

  const handleDraft = () => {
    Taro.showToast({ title: '已保存草稿', icon: 'none' });
  };

  return (
    <View className={styles.publishPage}>
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
        <View className={styles.videoUpload}>
          <Text className={styles.videoUploadIcon}>📹</Text>
          <Text className={styles.videoUploadText}>点击上传短视频</Text>
          <Text className={styles.videoUploadHint}>展示发动机启动、行走、回转、臂架动作</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>
          <Text className={styles.sectionIcon}>📸</Text>设备照片
        </Text>
        <View className={styles.imageUploadRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className={styles.imageUploadItem}>
              <Text className={styles.imageUploadAdd}>+</Text>
            </View>
          ))}
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
        <View className={styles.draftBtn} onClick={handleDraft}>
          <Text>存草稿</Text>
        </View>
        <View className={styles.publishBtn} onClick={handlePublish}>
          <Text>立即发布</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
