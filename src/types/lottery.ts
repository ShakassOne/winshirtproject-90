
export interface Participant {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Lottery {
  id: number;
  title: string;
  description?: string;
  value: number;
  targetParticipants: number;
  currentParticipants?: number;
  status: "active" | "completed" | "relaunched" | "cancelled";
  image?: string;
  linkedProducts?: number[];
  endDate?: string;
  drawDate?: string;
  featured?: boolean;
  participants: Participant[];
  ticketPrice?: number; // Added to match usage in LotteriesAdminPage
}

export interface NewLottery extends Omit<Lottery, 'id'> {
  id?: number;
}

export interface ExtendedLottery extends Lottery {
  winner?: Participant | null;
  ticketPrice?: number; // Add this to match usage in LotteriesAdminPage
  totalParticipants?: number; // Add this to match usage in LotteriesAdminPage
}
