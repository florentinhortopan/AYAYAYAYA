export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isRegistered: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserProfile extends User {
  phone?: string;
  dateOfBirth?: Date;
  location?: string;
  interests?: string[];
  goals?: string[];
}

export interface UserStats {
  userId: string;
  trainingProgress: number;
  achievementsCount: number;
  points: number;
  level: number;
  badges: string[];
}

