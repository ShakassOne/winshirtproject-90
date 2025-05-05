
// Check if this file exists, if not create it with the proper type definitions
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
}

export interface ExtendedLottery extends Lottery {
  winner?: Participant | null;
}
