import { TrucMatch } from "./game/TrucMatch.ts";
import { ResponseMessage } from "./types/messages.ts";

interface RoomData {
  connectedUsers: string[];
  creatorUserName: string;
  visible: boolean;
  trucMatch?: TrucMatch;
}

export class GameManager {
  private rooms: Map<string, RoomData> = new Map();

  public createRoom(user: string) {
    if (this.userCantCreateOrJoin(user)) {
      return false;
    }
    const id = `room_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newRoom: RoomData = {
      creatorUserName: user,
      connectedUsers: [user],
      visible: true,
    };
    this.rooms.set(id, newRoom);
    return id;
  }

  public joinRoom(roomId: string, user: string) {
    const joinedRoom = this.userCantCreateOrJoin(user);
    if (joinedRoom) {
      if (joinedRoom[1].creatorUserName === user) {
        this.leaveRoom(joinedRoom[0], user);
      } else {
        return false;
      }
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }
    const users = room.connectedUsers;
    this.rooms.set(roomId, { ...room, connectedUsers: [...users, user] });

    if (users.length === 4) {
      this.startMatch(roomId);
    }

    return true;
  }

  public leaveRoom(roomId: string, user: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }
    const userIndex = room.connectedUsers.indexOf(user);
    if (userIndex === -1) {
      return false;
    }
    room.connectedUsers.splice(userIndex, 1);
    if (room.connectedUsers.length === 0 || room.creatorUserName === user) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  //TODO This has to notify the clients someway, or be done in joinRoom Method
  private startMatch(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || room.connectedUsers.length !== 4) {
      console.log(`Room with id ${roomId} not found or not enough users`);
      return;
    }
    const match = new TrucMatch(room.connectedUsers, roomId);
    this.rooms.set(roomId, { ...room, trucMatch: match, visible: false });
  }

  public applyMessage(message: ResponseMessage) {
    if (!message.id) {
      console.log("Message id is missing");
      return;
    }
    const room = this.rooms.get(message.id);
    if (!room) {
      console.log(`Match with id ${message.id} not found`);
    }
    //TODO APPLY MESSAGE TO GAME
  }

  public getRoom(id: string): TrucMatch | undefined {
    return this.rooms.get(id)?.trucMatch;
  }

  public getAllRooms(): MapIterator<[string, RoomData]> {
    return this.rooms.entries();
  }

  private userCantCreateOrJoin(user: string) {
    for (const room of this.rooms.entries()) {
      if (room[1].connectedUsers.includes(user)) {
        return room;
      }
    }
    return false;
  }
}
