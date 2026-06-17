export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "USER" | "AGENT" | "ADMIN";
  points: number;
  credits: number;
  totalPoints: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Signal {
  id: string;
  userId: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: 1 | 2 | 3;
  status: "PENDING" | "IN_PROGRESS" | "COLLECTED" | "REJECTED";
  createdAt: string;
  user?: User;
}

export interface Collection {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  date: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  totalPoints: number;
  distance?: number;
  duration?: number;
  carbonSaved?: number;
  agent?: User;
  points?: CollectionPoint[];
}

export interface CollectionPoint {
  id: string;
  collectionId: string;
  signalId?: string;
  latitude: number;
  longitude: number;
  address?: string;
  order: number;
  isVisited: boolean;
}

export interface Tip {
  id: string;
  adminId: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: "COMPOSTING" | "RECYCLING" | "UPCYCLING" | "GENERAL";
  isPublished: boolean;
  views: number;
  createdAt: string;
  admin?: User;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  tags?: string[];
  score: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: User;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  zone: string;
  frequency: string;
  dayOfWeek?: number;
  timeSlot: string;
  isActive: boolean;
  pdfUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}