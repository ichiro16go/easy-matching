export const RoomStatus = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
} as const;

// 追加: オブジェクトの値から型を生成して、同じ名前でエクスポートする
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
}

export interface Room {
  passcode: string; // Used as the unique ID
  createdAt: number;
  status: RoomStatus; // これでエラーが消えます
  players: Player[];
  gameContext?: string; // AI generated context
}

export type ViewState = 'HOME' | 'CREATE' | 'JOIN' | 'LOBBY';

export interface RoomError {
  field: string;
  message: string;
}