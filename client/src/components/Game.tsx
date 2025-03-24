import { useEffect, useRef, useState } from "react";
import { Authentication } from "../apis/auth";
import { handleMessages } from "../apis/handleMessages";

import { PageProps, CardsOfPlayer, ThrownPlayerCards } from "../types/params";
import { FirstMessage, StartGameMessage } from "../types/messages";
import { Board } from "./gameComponents/Board";
import { Player } from "./gameComponents/Player";

import { toast } from "react-toastify";
import { WebSocketContext } from "../contexts/WebSocketContext";
import { HeadMenu } from "./HeadMenu";

import "../styles/Game.css";
import { FooterMenu } from "./FooterMenu";
import { GameButton } from "./gameComponents/GameButton";
import { Score } from "./gameComponents/Score";

// Lazy Load Card Images and send it to Players component
const cardImages = import.meta.glob<{ default: string }>(
  "/src/assets/cards/*.png"
);

//TODO Export this on .env file
const API_URL = String(import.meta.env.VITE_API_URL);

export function Game({ setAppPage }: PageProps) {
  // We will store the websocket in a ref, so we can send messages from all event handlers. This Ref will be stored in a context
  const wsRef = useRef<WebSocket>();

  // TODO SHAURIA DEMPRAR UN USEREDUCER O ALGO SIMILAR PER MANETJAR SA LOGICA DE SES CARTES i tot sestat
  const [currentPlayerCards, setCurrentPlayerCards] = useState<CardsOfPlayer>();

  //TODO PENDING OTHERPLAYER CARDS STATE
  //const [otherPlayerCards, setOtherPlayersCards] = useState<OtherPlayerCards>()

  const [thrownPlayerCards, setThrownPlayerCards] = useState<ThrownPlayerCards>(
    {
      top: [],
      bottom: [],
      left: [],
      right: [],
    }
  );

  // TODO TEAM SHOULD GO ON TOP
  const [players, setPlayers] = useState<string[]>([]);

  // SCORE
  const [score, setScore] = useState<Record<"team1" | "team2", number>>({
    team1: 0,
    team2: 0,
  });

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
      handleMessages(event, {
        setCurrentPlayerCards,
        setPlayers,
        setThrownPlayerCards,
        setScore,
      });
    });

    ws.addEventListener("error", () => {
      ws.close(1000, "Error WebSocket");
    });

    ws.addEventListener("close", (event) => {
      console.log(event.reason);
    });

    // Clean function
    return () => {
      ws.close(1000, "Closing WebSocket, UseEffect cleanUp Function");
    };
  }, []);

  const handleNewGame = () => {
    // Reset Thrown Cards:
    setThrownPlayerCards({
      top: [],
      bottom: [],
      left: [],
      right: [],
    });
    // TODO IMPLEMENT ELSE IN CASE OF ERROR
    // TODO sending this message should depend on how many users are connected
    if (wsRef.current) {
      const newGameMessage: StartGameMessage = {
        type: "startGame",
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
  return (
    <div className="gameContainer">
      <HeadMenu>
        <div className="titleContainer">
          <h1>Truc Menorquí</h1>
        </div>
        <Score score={score} />
        <div className="sideButtons">
          <button className="sessionButton" onClick={handleNewGame}>
            Start
          </button>
          <button className="sessionButton" onClick={handleLogOut}>
            <img src="/GameImages/leaveIcon.svg" alt="Log out button" />
          </button>
        </div>
      </HeadMenu>
      <Board>
        <WebSocketContext.Provider value={wsRef ? wsRef : null}>
          <Player
            playerCards={
              currentPlayerCards
                ? currentPlayerCards
                : [
                    { id: "back_card" },
                    { id: "back_card" },
                    { id: "back_card" },
                  ]
            }
            thrownCards={thrownPlayerCards.bottom}
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
            thrownCards={thrownPlayerCards.top}
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
            thrownCards={thrownPlayerCards.left}
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
            thrownCards={thrownPlayerCards.right}
            cardImages={cardImages}
            position="right"
            name={players[3]}
          ></Player>
        </WebSocketContext.Provider>
      </Board>
      <FooterMenu>
        {/** #TODO THIS WILL HAVE TO BE A BUTTON MAP OR ARRAY */}
        <GameButton
          type="Truc"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="Envit"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="Retruc"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="Renvit"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="Vull"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="No Vull"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
        <GameButton
          type="MAZO"
          onClick={() => console.log("Truc clicked")}
        ></GameButton>
      </FooterMenu>
    </div>
  );
}
