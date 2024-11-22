import { useEffect, useRef, useState } from "react";
import { Authentication } from "../apis/auth";
import { handleMessages } from "../apis/handleMessages";

import { PageProps, PlayerCards } from "../types/params";
import { FirstMessage, NewGameMessage } from "../types/messages";
import { Board } from "./gameComponents/Board";
import { Player } from "./gameComponents/Player";

import { toast } from "react-toastify";

// Lazy Load Card Images and send it to Players component
const cardImages = import.meta.glob<{ default: string }>(
  "/src/assets/cards/*.png"
);

//TODO Export this on .env file
const API_URL = "http://localhost:8080";

export function Game({ setAppPage }: PageProps) {
  // We will store the websocket in a ref, so we can send messages from all event handlers.
  const wsRef = useRef<WebSocket>();

  // TODO SHAURIA DEMPRAR UN USEREDUCER O ALGO SIMILAR PER MANETJAR SA LOGICA DE SES CARTES i tot sestat
  const [currentPlayerCards, setCurrentPlayerCards] = useState<PlayerCards>();
  // TODO TEAM SHOULD GO ON TOP
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    console.log("Starting Socket Connection");
    const ws = new WebSocket(API_URL);
    // We store web socket in a referece
    wsRef.current = ws;

    // We send the JWT for authentication when connection has been opened
    // Restore token (Not Null Assertion because if we  had no token, we would be redirected to entry page)
    const token = Authentication.recoverToken()!;
    ws.addEventListener("open", () => {
      const firstMessage: FirstMessage = {
        type: "firstConnection",
        token,
      };
      ws.send(JSON.stringify(firstMessage));
      console.log("WebSocket is open");
    });

    ws.addEventListener("message", (event) => {
      // TODO IMPROVE THIS LOGIC mes que res perque no hi ha logica, se hauria de pasar es setter des reducer a sa funcio handleMessage...
      handleMessages(event, { setCurrentPlayerCards, setPlayers });
    });

    ws.addEventListener("error", () => {
      ws.close(1000, "Error WebSocket");
    });

    ws.addEventListener("close", (event) => {
      console.log(event.reason);
    });

    // Clean function
    return () => {
      console.log("UseEffect WebSocket CleanUp function");
      ws.close(1000, "Closing WebSocket, UseEffect CleanUp Function");
    };
  }, []);

  const handleNewGame = () => {
    // TODO IMPLEMENT ELSE IN CASE OF ERROR
    // TODO sending this message should depend on how many users are connected
    if (wsRef.current) {
      const newGameMessage: NewGameMessage = {
        type: "newGame",
        token: Authentication.recoverToken()!,
      };
      wsRef.current.send(JSON.stringify(newGameMessage));
    }
  };

  const handleLogOut = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, "User Logged Out");
    }
    Authentication.deleteToken();
    setAppPage("entryPage");
    toast.success("Sessió Tancada");
  };
  //TODO CLIENT ONLY WILL KNOW PLAYER CARDS ONCE THROWED, THIS IS FOR TESTING
  return (
    <>
      <Board color={"#936846"}>
        <Player
          playerCards={
            currentPlayerCards
              ? currentPlayerCards
              : [{ id: "back_card" }, { id: "back_card" }, { id: "back_card" }]
          }
          cardImages={cardImages}
          position="bottom"
          name={players[0]}
        ></Player>
        <Player
          playerCards={[
            { id: "back_card" },
            { id: "back_card" },
            { id: "back_card" },
          ]}
          cardImages={cardImages}
          position="top"
          name={players[1]}
        ></Player>
        <Player
          playerCards={[
            { id: "back_card" },
            { id: "back_card" },
            { id: "back_card" },
          ]}
          cardImages={cardImages}
          position="left"
          name={players[2]}
        ></Player>
        <Player
          playerCards={[
            { id: "back_card" },
            { id: "back_card" },
            { id: "back_card" },
          ]}
          cardImages={cardImages}
          position="right"
          name={players[3]}
        ></Player>
      </Board>
      <button onClick={handleNewGame}>Nova Partida</button>
      <button onClick={handleLogOut}>Tancar Sessió</button>
    </>
  );
}
