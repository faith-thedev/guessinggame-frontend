export interface Player {
  id: string;
  username: string;
  score: number;
}

export interface Message {
  type: "system" | "player";
  message: string;
  timestamp: Date;
}

export interface SessionData {
  sessionId: string;
  player: Player;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  isMaster: boolean;
}

export interface ScoreItem {
  username: string;
  score: number;
}
