import { TrucMatch } from "./game/TrucMatch.ts";
import { ResponseMessage } from "./types/messages.ts";
import express from "express";

interface RoomData {
  connectedUsers: Array<[string, express.Response<any, Record<string, any>>]>;
  creatorUserName: string;
  visible: boolean;
  trucMatch?: TrucMatch;
}

interface RoomsGetter {
  id: string;
  visible: boolean;
  creatorUserName: string;
  connectedUsers: string[];
}

export class GameManager {
  private rooms: Map<string, RoomData> = new Map();

  public createRoom(
    user: string,
    client: express.Response<any, Record<string, any>>
  ) {
    if (this.userCantCreateOrJoin(user)) {
      return false;
    }
    const id = `room_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newRoom: RoomData = {
      creatorUserName: user,
      connectedUsers: [[user, client]],
      visible: true,
    };
    this.rooms.set(id, newRoom);
    return id;
  }

  public joinRoom(
    roomId: string,
    user: string,
    client: express.Response<any, Record<string, any>>
  ) {
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

    const updatedRoom: RoomData = {
      ...room,
      connectedUsers: [...room.connectedUsers, [user, client]],
    };
    this.rooms.set(roomId, updatedRoom);

    //TODO CHANGE THIS TO 4, JUST FOR TESTING
    if (updatedRoom.connectedUsers.length === 2) {
      this.startMatch(roomId);
    }

    return true;
  }

  public leaveRoom(roomId: string, user: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }
    const userIndex = room.connectedUsers.findIndex((u) => u[0] === user);
    if (userIndex === -1) {
      return false;
    }
    room.connectedUsers.splice(userIndex, 1);
    if (room.connectedUsers.length === 0 || room.creatorUserName === user) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  private startMatch(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || room.connectedUsers.length !== 4) {
      console.log(`Room with id ${roomId} not found or not enough users`);
      return;
    }
    const match = new TrucMatch(
      room.connectedUsers.map((value) => value[0]),
      roomId
    );
    this.rooms.set(roomId, { ...room, trucMatch: match, visible: false });
    this.rooms.get(roomId)!.connectedUsers.forEach((user) => {
      user[1].write(`event: gameStart\n`);
      user[1].write("data: " + roomId + "\n\n");
    });
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

  public getAllRooms(): RoomsGetter[] {
    let gameRooms = [];
    for (const gameRoom of this.rooms.entries()) {
      gameRooms.push({
        id: gameRoom[0],
        visible: gameRoom[1].visible,
        creatorUserName: gameRoom[1].creatorUserName,
        connectedUsers: gameRoom[1].connectedUsers.map((user) => user[0]),
      });
    }
    return gameRooms;
  }

  private userCantCreateOrJoin(user: string) {
    for (const room of this.rooms.entries()) {
      if (room[1].connectedUsers.findIndex((u) => u[0] === user) !== -1) {
        return room;
      }
    }
    return false;
  }
}
