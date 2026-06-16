import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatPrice = (price: number): string => {
  if (price >= 10000) {
    const wan = price / 10000;
    return wan % 1 === 0 ? `${wan}万` : `${wan.toFixed(1)}万`;
  }
  return `${price}元`;
};

export const formatHours = (hours: number): string => {
  return `${hours.toLocaleString()}小时`;
};

export const formatTime = (time: string): string => {
  return dayjs(time).fromNow();
};

export const formatDate = (time: string, format = 'YYYY-MM-DD'): string => {
  return dayjs(time).format(format);
};

export const getRoleLabel = (role: 'owner' | 'dealer' | 'contractor'): string => {
  const map = {
    owner: '机主',
    dealer: '机贩子',
    contractor: '包工头'
  };
  return map[role];
};

export const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    excavator: '挖掘机',
    loader: '装载机',
    crane: '吊车',
    roller: '压路机',
    bulldozer: '推土机',
    grader: '平地机',
    paver: '摊铺机',
    forklift: '叉车',
    concrete_pump: '泵车',
    mixer: '搅拌车'
  };
  return map[category] || category;
};

export const getFailReasonLabel = (reason: string): string => {
  const map: Record<string, string> = {
    price_gap: '价格差距大',
    condition_mismatch: '车况不符',
    paperwork_issue: '手续不齐',
    other: '其他原因'
  };
  return map[reason] || reason;
};
