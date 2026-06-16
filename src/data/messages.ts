import type { Conversation, ChatMessage } from '@/types/machine';

export const conversations: Conversation[] = [
  {
    id: 'conv_001',
    machineId: 'm_001',
    machineTitle: '三一SY215C挖掘机',
    machineImage: 'https://picsum.photos/id/3/300/300',
    machinePrice: 320000,
    otherUserId: 'u_002',
    otherUserName: '李师傅',
    otherUserAvatar: 'https://picsum.photos/id/91/200/200',
    lastMessage: '最低27万，你考虑一下',
    lastMessageTime: '2026-06-16T09:30:00Z',
    unreadCount: 2
  },
  {
    id: 'conv_002',
    machineId: 'm_002',
    machineTitle: '卡特320D挖掘机',
    machineImage: 'https://picsum.photos/id/160/300/300',
    machinePrice: 260000,
    otherUserId: 'u_003',
    otherUserName: '张老板',
    otherUserAvatar: 'https://picsum.photos/id/177/200/200',
    lastMessage: '明天上午可以来看机',
    lastMessageTime: '2026-06-15T18:00:00Z',
    unreadCount: 1
  },
  {
    id: 'conv_003',
    machineId: 'm_005',
    machineTitle: '柳工856H装载机',
    machineImage: 'https://picsum.photos/id/2/300/300',
    machinePrice: 220000,
    otherUserId: 'u_006',
    otherUserName: '陈工',
    otherUserAvatar: 'https://picsum.photos/id/91/200/200',
    lastMessage: '车况很好，欢迎来看',
    lastMessageTime: '2026-06-15T14:00:00Z',
    unreadCount: 0
  },
  {
    id: 'conv_004',
    machineId: 'm_008',
    machineTitle: '斗山DX150挖掘机',
    machineImage: 'https://picsum.photos/id/6/300/300',
    machinePrice: 270000,
    otherUserId: 'u_009',
    otherUserName: '杨经理',
    otherUserAvatar: 'https://picsum.photos/id/338/200/200',
    lastMessage: '可以包板车到成都',
    lastMessageTime: '2026-06-14T20:00:00Z',
    unreadCount: 0
  },
  {
    id: 'conv_005',
    machineId: 'm_007',
    machineTitle: '小松PC200-8挖掘机',
    machineImage: 'https://picsum.photos/id/201/300/300',
    machinePrice: 180000,
    otherUserId: 'u_008',
    otherUserName: '周师傅',
    otherUserAvatar: 'https://picsum.photos/id/64/200/200',
    lastMessage: '急出，价格好商量',
    lastMessageTime: '2026-06-14T16:30:00Z',
    unreadCount: 3
  },
  {
    id: 'conv_006',
    machineId: 'm_010',
    machineTitle: '三一SY5419THB泵车',
    machineImage: 'https://picsum.photos/id/9/300/300',
    machinePrice: 580000,
    otherUserId: 'u_011',
    otherUserName: '马老板',
    otherUserAvatar: 'https://picsum.photos/id/177/200/200',
    lastMessage: '泵送压力正常，你来看就知道了',
    lastMessageTime: '2026-06-13T10:00:00Z',
    unreadCount: 0
  }
];

export const chatMessages: Record<string, ChatMessage[]> = {
  conv_001: [
    {
      id: 'msg_001',
      conversationId: 'conv_001',
      senderId: 'u_001',
      senderName: '我',
      content: '这台215什么价？',
      type: 'text',
      createdAt: '2026-06-16T09:00:00Z',
      isRead: true
    },
    {
      id: 'msg_002',
      conversationId: 'conv_001',
      senderId: 'u_002',
      senderName: '李师傅',
      content: '32万，车况你放心',
      type: 'text',
      createdAt: '2026-06-16T09:05:00Z',
      isRead: true
    },
    {
      id: 'msg_003',
      conversationId: 'conv_001',
      senderId: 'u_001',
      senderName: '我',
      content: '28万能不能出？',
      type: 'bargain',
      bargainInfo: {
        originalPrice: 320000,
        offeredPrice: 280000,
        status: 'pending'
      },
      createdAt: '2026-06-16T09:10:00Z',
      isRead: true
    },
    {
      id: 'msg_004',
      conversationId: 'conv_001',
      senderId: 'u_002',
      senderName: '李师傅',
      content: '验机重点我都发你了，你先看',
      type: 'inspection',
      inspectionInfo: {
        items: [
          { name: '发动机启动', status: 'pass', note: '冷启动3秒内着车' },
          { name: '液压系统', status: 'pass', note: '无渗漏' },
          { name: '行走系统', status: 'warning', note: '左侧履带稍松' },
          { name: '回转系统', status: 'pass' },
          { name: '臂架动作', status: 'pass' }
        ]
      },
      createdAt: '2026-06-16T09:15:00Z',
      isRead: true
    },
    {
      id: 'msg_005',
      conversationId: 'conv_001',
      senderId: 'u_002',
      senderName: '李师傅',
      content: '最低27万，你考虑一下',
      type: 'text',
      createdAt: '2026-06-16T09:30:00Z',
      isRead: false
    }
  ]
};
