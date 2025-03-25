import { useState } from "react";

import { EntryPage } from "./components/EntryPage";
import { Game } from "./components/Game";
import { GameManager } from "./components/GameManager";

import { appPageType } from "./types/params";
import { Authentication } from "./apis/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // If user is logged in, we load game, else we load entryPage
  const [appPage, setAppPage] = useState<appPageType>(
    Authentication.recoverToken() ? "game" : "entryPage"
  );

  // Connected Room ID
  const [roomId, setRoomId] = useState<string | null>(null);

  let page = null;

  // Load corret page
  switch (appPage) {
    case "gameManager":
      page = (
        <GameManager
          setAppPage={setAppPage}
          setRoomId={setRoomId}
          roomId={roomId}
        ></GameManager>
      );
      break;
    case "game":
      page = (
        <Game
          setAppPage={setAppPage}
          setRoomId={setRoomId}
          roomId={roomId}
        ></Game>
      );
      break;
    default:
      page = <EntryPage setAppPage={setAppPage}></EntryPage>;
  }

  return (
    <>
      <main style={{ height: "100dvh", maxWidth: "100dvw" }}>{page}</main>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
