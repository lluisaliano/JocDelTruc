export interface AuthenticationData {
  userName: string;
  password: string;
}

export interface RegisteredUsers {
  [key: string]: string;
}

//Game Rooms
export interface RoomsRequest {
  type: "roomCreate" | "roomJoin" | "roomLeave";
  userName: string;
  roomId?: string;
}
