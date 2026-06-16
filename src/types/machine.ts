export interface Machine {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  hours: number;
  location: string;
  city: string;
  price: number;
  minPrice: number;
  coverImage: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  highlights: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRole: 'owner' | 'dealer' | 'contractor';
  isUrgent: boolean;
  canViewToday: boolean;
  includeTransport: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  status: 'active' | 'sold' | 'offline';
}

export interface MachineFilter {
  category?: string;
  city?: string;
  canViewToday?: boolean;
  includeTransport?: boolean;
  priceRange?: [number, number];
  keyword?: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'dealer' | 'contractor';
  phone: string;
  location: string;
  machineCount: number;
  dealCount: number;
  rating: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'inspection' | 'bargain' | 'system';
  bargainInfo?: BargainInfo;
  inspectionInfo?: InspectionInfo;
  createdAt: string;
  isRead: boolean;
}

export interface BargainInfo {
  originalPrice: number;
  offeredPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface InspectionInfo {
  items: InspectionItem[];
}

export interface InspectionItem {
  name: string;
  status: 'pass' | 'issue' | 'warning';
  note?: string;
}

export interface Conversation {
  id: string;
  machineId: string;
  machineTitle: string;
  machineImage: string;
  machinePrice: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Booking {
  id: string;
  machineId: string;
  machineTitle: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  viewTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contactName: string;
  contactPhone: string;
}

export interface Agreement {
  id: string;
  machineId: string;
  machineTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  deposit: number;
  totalPrice: number;
  status: 'draft' | 'signed' | 'completed' | 'failed';
  failReason?: 'price_gap' | 'condition_mismatch' | 'paperwork_issue' | 'other';
  createdAt: string;
}

export interface Favorite {
  id: string;
  machineId: string;
  machineTitle: string;
  machineImage: string;
  machinePrice: number;
  addedAt: string;
  priceAlert: boolean;
}

export interface UrgentRequest {
  id: string;
  category: string;
  brand?: string;
  model?: string;
  budget: [number, number];
  location: string;
  description: string;
  createdAt: string;
  responseCount: number;
  status: 'active' | 'closed';
}

export interface PublishForm {
  id?: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  hours: number;
  location: string;
  city: string;
  price: number;
  minPrice: number;
  description: string;
  tags: string[];
  videoUrl?: string;
  images: string[];
  canViewToday: boolean;
  includeTransport: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  role: 'owner' | 'dealer' | 'contractor';
  location: string;
  company?: string;
  publishedCount: number;
  dealCount: number;
  favoriteCount: number;
  rating: number;
}
