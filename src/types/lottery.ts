
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
  participants?: any[];
  winner?: any;
  drawDate?: string;
}
