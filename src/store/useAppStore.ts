import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Machine, MachineFilter, UserProfile, Conversation, ChatMessage, Booking, Agreement, Favorite, PublishForm } from '@/types/machine';
import { machines as initialMachines, conversations as initialConversations, chatMessages as initialChatMessages } from '@/data/machines';
import { messages as initialMessagesData } from '@/data/messages';

interface ChatMessagesMap {
  [key: string]: ChatMessage[];
}

interface AppState {
  user: UserProfile | null;
  filter: MachineFilter;
  machines: Machine[];
  myPublished: Machine[];
  drafts: PublishForm[];
  currentDraft: PublishForm | null;
  favorites: Favorite[];
  conversations: Conversation[];
  chatMessages: ChatMessagesMap;
  bookings: Booking[];
  agreements: Agreement[];
  currentCity: string;

  setUser: (user: UserProfile) => void;
  setFilter: (filter: MachineFilter) => void;
  resetFilter: () => void;
  setCurrentCity: (city: string) => void;

  publishMachine: (machine: Machine) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  removeMachine: (id: string) => void;

  saveDraft: (draft: PublishForm, id?: string) => string;
  setCurrentDraft: (draft: PublishForm | null) => void;
  deleteDraft: (id: string) => void;

  addFavorite: (machine: Machine) => void;
  removeFavorite: (machineId: string) => void;
  setPriceAlert: (machineId: string, enabled: boolean) => void;
  isFavorite: (machineId: string) => boolean;
  hasPriceAlert: (machineId: string) => boolean;

  addMessage: (conversationId: string, message: ChatMessage) => void;
  createConversation: (machineId: string, otherUser: { id: string; name: string; avatar: string }, machine: { title: string; image: string; price: number }) => string;
  markAsRead: (conversationId: string) => void;

  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;

  addAgreement: (agreement: Agreement) => void;
  updateAgreementStatus: (id: string, status: Agreement['status'], failReason?: Agreement['failReason']) => void;
}

const defaultFilter: MachineFilter = {};

const defaultDraft: PublishForm = {
  brand: '',
  model: '',
  category: '',
  year: new Date().getFullYear(),
  hours: 0,
  location: '',
  city: '',
  price: 0,
  minPrice: 0,
  description: '',
  tags: [],
  images: [],
  canViewToday: false,
  includeTransport: false
};

const initialBookings: Booking[] = [
  {
    id: 'b_001',
    machineId: 'm_001',
    machineTitle: '三一SY215C挖掘机',
    sellerId: 'u_002',
    sellerName: '李师傅',
    sellerPhone: '138****1234',
    viewTime: '2026-06-17 10:00',
    location: '成都市双流区某工地',
    status: 'confirmed',
    contactName: '王建国',
    contactPhone: '138****6789'
  }
];

const initialAgreements: Agreement[] = [
  {
    id: 'a_001',
    machineId: 'm_001',
    machineTitle: '三一SY215C挖掘机',
    buyerId: 'u_001',
    buyerName: '王建国',
    sellerId: 'u_002',
    sellerName: '李师傅',
    deposit: 10000,
    totalPrice: 285000,
    status: 'completed',
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'a_002',
    machineId: 'm_002',
    machineTitle: '卡特320D挖掘机',
    buyerId: 'u_001',
    buyerName: '王建国',
    sellerId: 'u_003',
    sellerName: '张老板',
    deposit: 5000,
    totalPrice: 260000,
    status: 'failed',
    failReason: 'price_gap',
    createdAt: '2026-06-12T14:00:00Z'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'u_001',
        name: '王建国',
        avatar: 'https://picsum.photos/id/64/200/200',
        phone: '138****6789',
        role: 'dealer',
        location: '成都市',
        company: '建国工程机械',
        publishedCount: 12,
        dealCount: 28,
        favoriteCount: 5,
        rating: 4.8
      },
      filter: defaultFilter,
      machines: initialMachines,
      myPublished: [],
      drafts: [],
      currentDraft: null,
      favorites: [],
      conversations: initialMessagesData.conversations || initialConversations,
      chatMessages: initialMessagesData.chatMessages || {},
      bookings: initialBookings,
      agreements: initialAgreements,
      currentCity: '成都',

      setUser: (user) => set({ user }),
      setFilter: (filter) => set({ filter }),
      resetFilter: () => set({ filter: defaultFilter }),
      setCurrentCity: (city) => set({ currentCity: city }),

      publishMachine: (machine) => set((state) => ({
        machines: [machine, ...state.machines],
        myPublished: [machine, ...state.myPublished]
      })),

      updateMachine: (id, updates) => set((state) => ({
        machines: state.machines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        myPublished: state.myPublished.map((m) => (m.id === id ? { ...m, ...updates } : m))
      })),

      removeMachine: (id) => set((state) => ({
        machines: state.machines.filter((m) => m.id !== id),
        myPublished: state.myPublished.filter((m) => m.id !== id)
      })),

      saveDraft: (draft, id) => {
        const newId = id || `draft_${Date.now()}`;
        set((state) => {
          const existingIndex = state.drafts.findIndex((d) => d.id === id);
          if (existingIndex >= 0) {
            const newDrafts = [...state.drafts];
            newDrafts[existingIndex] = { ...draft, id: newId };
            return { drafts: newDrafts };
          }
          return { drafts: [...state.drafts, { ...draft, id: newId }] };
        });
        return newId;
      },

      setCurrentDraft: (draft) => set({ currentDraft: draft }),

      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id)
      })),

      addFavorite: (machine) => set((state) => {
        const exists = state.favorites.some((f) => f.machineId === machine.id);
        if (exists) return {};
        const newFavorite: Favorite = {
          id: `fav_${Date.now()}`,
          machineId: machine.id,
          machineTitle: machine.title,
          machineImage: machine.coverImage,
          machinePrice: machine.price,
          addedAt: new Date().toISOString(),
          priceAlert: false
        };
        return { favorites: [...state.favorites, newFavorite] };
      }),

      removeFavorite: (machineId) => set((state) => ({
        favorites: state.favorites.filter((f) => f.machineId !== machineId)
      })),

      setPriceAlert: (machineId, enabled) => set((state) => ({
        favorites: state.favorites.map((f) =>
          f.machineId === machineId ? { ...f, priceAlert: enabled } : f
        )
      })),

      isFavorite: (machineId) => {
        return get().favorites.some((f) => f.machineId === machineId);
      },

      hasPriceAlert: (machineId) => {
        const fav = get().favorites.find((f) => f.machineId === machineId);
        return fav?.priceAlert || false;
      },

      addMessage: (conversationId, message) => set((state) => {
        const existing = state.chatMessages[conversationId] || [];
        return {
          chatMessages: {
            ...state.chatMessages,
            [conversationId]: [...existing, message]
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: message.content,
                  lastMessageTime: message.createdAt,
                  unreadCount: message.senderId !== 'u_001' ? c.unreadCount + 1 : c.unreadCount
                }
              : c
          )
        };
      }),

      createConversation: (machineId, otherUser, machine) => {
        const convId = `conv_${Date.now()}`;
        const newConv: Conversation = {
          id: convId,
          machineId,
          machineTitle: machine.title,
          machineImage: machine.image,
          machinePrice: machine.price,
          otherUserId: otherUser.id,
          otherUserName: otherUser.name,
          otherUserAvatar: otherUser.avatar,
          lastMessage: '开始聊一聊',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          chatMessages: {
            ...state.chatMessages,
            [convId]: []
          }
        }));
        return convId;
      },

      markAsRead: (conversationId) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      })),

      addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
      })),

      updateBookingStatus: (id, status) => set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b))
      })),

      addAgreement: (agreement) => set((state) => ({
        agreements: [agreement, ...state.agreements]
      })),

      updateAgreementStatus: (id, status, failReason) => set((state) => ({
        agreements: state.agreements.map((a) =>
          a.id === id ? { ...a, status, failReason: failReason || a.failReason } : a
        )
      }))
    }),
    {
      name: 'iron-trade-storage',
      partialize: (state) => ({
        machines: state.machines,
        myPublished: state.myPublished,
        drafts: state.drafts,
        favorites: state.favorites,
        conversations: state.conversations,
        chatMessages: state.chatMessages,
        bookings: state.bookings,
        agreements: state.agreements,
        currentCity: state.currentCity
      })
    }
  )
);
