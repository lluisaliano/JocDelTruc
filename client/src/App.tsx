import { useState } from "react";

import { EntryPage } from "./components/EntryPage";
import { Game } from "./components/Game";
import { Leaderboard } from "./components/Leaderboard";

import { appPageType } from "./types/params";
import { Authentication } from "./apis/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // If user is logged in, we load game, else we load entryPage
  const [appPage, setAppPage] = useState<appPageType>(
    Authentication.recoverToken() ? "game" : "entryPage"
  );

  let page = null;

  // Load corret page
  switch (appPage) {
    case "leaderBoard":
      page = <Leaderboard></Leaderboard>;
      break;
    case "game":
      page = <Game setAppPage={setAppPage}></Game>;
      break;
    default:
      page = <EntryPage setAppPage={setAppPage}></EntryPage>;
  }

  return (
    <>
      <main>{page}</main>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
