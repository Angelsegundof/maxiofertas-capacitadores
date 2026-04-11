export type Role = "admin" | "trainer";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: number;
  createdBy?: string;
  historicCount?: number;
  historicCutoffDate?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  active: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}
