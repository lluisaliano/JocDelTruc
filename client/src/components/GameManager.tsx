import { useState, useEffect } from "react";
import { PageProps } from "../types/params";

export function GameManager({ setAppPage }: PageProps) {
  const [gameRooms, setGameRooms] = useState<Record<"name" | "id", string>[]>();

  // Fetch game rooms
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const response = await fetch("http://localhost:3001/gameRooms", {
        signal: controller.signal,
      });
      const json = await response.json();
      setGameRooms(json);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  const handleClick = (id: string) => {
    //TODO ROOM ID SHOULD BE CONTROLLED HERE
    console.log(id);
    setAppPage("game");
  };

  const rooms = gameRooms
    ? gameRooms.map((room) => (
        <div key={room.id}>
          <h2>{room.name}</h2>
          <p>Jugadors conectats: 1/4</p>
          <button onClick={() => handleClick(room.id)}>Entrar</button>
        </div>
      ))
    : null;

  return (
    <div className="gameSelector">
      <div>
        <button>Create Room</button>
      </div>
      {rooms}
    </div>
  );
}
