import { useState, useEffect } from "react";
import { PageProps } from "../types/params";
import { Authentication } from "../apis/auth";

const API_URL = "http://localhost:3000/gamerooms";

interface GameRoom {
  id: string;
  visible: boolean;
  creatorUserName: string;
  connectedUsers: string[];
}

export function GameManager({ setAppPage, setRoomId }: PageProps) {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>();
  const userName = Authentication.getUserName();

  // Using EventSource to poll gameRooms
  useEffect(() => {
    const eventSource = new EventSource(API_URL);

    eventSource.addEventListener("roomsData", (event) => {
      const data = JSON.parse(event.data);
      setGameRooms(data);
    });

    eventSource.addEventListener("gameStart", (event) => {
      const data = JSON.parse(event.data);
      setRoomId(data.roomId);
      setAppPage("game");
    });

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close(); // opcional: reconectar después de un tiempo
    };

    return () => {
      eventSource.close();
    };
  }, [setAppPage, setRoomId]);

  const handleLeaveClick = async (id: string) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "roomLeave",
        userName: userName,
        roomId: id,
      }),
    });
    const json = await response.json();
    console.log(json);
  };
  const handleJoinClick = async (id: string) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "roomJoin",
        userName: userName,
        roomId: id,
      }),
    });
    const json = await response.json();
    console.log(json);
  };

  const handleCreateClick = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "roomCreate", userName: userName }),
    });
    const json = await response.json();
    console.log(json);
  };

  const rooms = gameRooms
    ? gameRooms.map((room) => {
        if (room.visible === false) {
          return null;
        }
        const button =
          room.connectedUsers.findIndex((user) => user === userName) === -1 ? (
            <button onClick={() => handleJoinClick(room.id)}>Entrar</button>
          ) : (
            <button onClick={() => handleLeaveClick(room.id)}>Sortir</button>
          );
        return (
          <div key={room.id}>
            <h2>{room.creatorUserName}</h2>
            <p>Jugadors conectats: {room.connectedUsers.length}/4</p>
            {button}
          </div>
        );
      })
    : null;

  return (
    <div className="gameSelector">
      <div>
        <button onClick={handleCreateClick}>Create Room</button>
      </div>
      {rooms}
    </div>
  );
}
