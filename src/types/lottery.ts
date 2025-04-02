
export interface ExtendedLottery {
  id: number;
  title: string;
  description: string;
  value: number;
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
