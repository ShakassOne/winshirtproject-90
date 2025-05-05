export interface ExtendedLottery {
  id: number;
  title: string;
  description: string;
  value: number;  // This is used instead of prize
  targetParticipants: number;
  currentParticipants: number;
  status: "active" | "completed" | "relaunched" | "cancelled";
  image: string;
  linkedProducts?: number[];
  participants?: Participant[];
  winner?: Participant | null;
  drawDate?: string | null;
  endDate?: string | null;
  featured?: boolean; // New field to mark lotteries as featured
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface LotteryParticipation {
  id: number;
  userId: number;
  lotteryId: number;
  productId: number;
  ticketNumber: string;
  date: string;
}

export interface Lottery {
  id: number;
  title: string;
  description: string;
  value: number;
  targetParticipants: number; 
  currentParticipants?: number;
  status: "active" | "completed" | "relaunched" | "cancelled";
  image: string;
  linkedProducts?: number[];
  participants: number; // Changed to be required for type consistency
  winnerId?: number;
  winnerName?: string;
  winnerEmail?: string;
  drawDate?: string | null;
  endDate: string; // Required field
  createdAt?: string;
  featured?: boolean;
}

export interface LotteryParticipant {
  userId: number;
  lotteryId: number;
  participationDate: string;
  ticketCount: number;
  userName?: string;
  userEmail?: string;
}

// Add JSON type to handle Supabase JSON data
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
