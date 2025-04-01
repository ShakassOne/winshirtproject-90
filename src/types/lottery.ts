
export interface ExtendedLottery {
  id: number;
  title: string;
  description: string;
  value: number;
  targetParticipants: number;
  currentParticipants: number;
  status: string;
  image: string;
  linkedProducts?: number[];
  participants?: Participant[];
  winner?: Participant | null;
  drawDate?: string | null;
  endDate?: string | null;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}
