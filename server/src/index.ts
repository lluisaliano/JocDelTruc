import express, { response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";

import { Users } from "./types/game.ts";
import { AuthenticationData, RegisteredUsers } from "./types/api.ts";
import { TrucMatch } from "./game/TrucMatch.ts";
import {
  ErrorResponse,
  Message,
  NewPlayerResponse,
  PlayerPlayMessage,
  ResponseMessage,
  StartGameResponse,
  StateResponse,
} from "./types/messages.ts";
import { GameManager } from "./GameManager.ts";

dotenv.config();

const app = express();

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const WS_PORT = parseInt(process.env.WS_PORT ?? "8080", 10);

//TODO SPREAD THIS LOGIC IN DIFFERENT FILES
//TODO ADD MATCHES TO LET USER JOIN A SPECIFIC MATCH
// Registered Users
const registeredUsers: RegisteredUsers = {
  lluis: "lolito",
  pere: "lolito",
  agus: "lolito",
  bruno: "lolito",
};

// JWT Secret Key
const secretKey = process.env.JWT_KEY as string;

// Use Cors
app.use(cors());

// Use JSON Middleware
app.use(express.json());

// Login Route
app.post("/login", (req, res) => {
  // Get login form data
  const { userName, password } = req.body as AuthenticationData;

  if (!registeredUsers[userName]) {
    res.status(401).json({ responseMessage: "Usuari incorrecte" });
    return;
  }

  if (registeredUsers[userName] === password) {
    // If user and password are correct, we create the token
    const payload = {
      userName: userName,
      role: userName === "lluis" ? "admin" : "user",
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });

    res.json({ responseMessage: "Sessió Iniciada", token: token });
  } else {
    res.status(401).json({ responseMessage: "Contrasenya incorrecte" });
  }
});

// Game Rooms Route
app.get("/gameRooms", (req, res) => {
  const gameRooms = gameManager.getAllMatchesIds().map((matchId, index) => ({
    name: "Sala " + index,
    id: matchId,
  }));

  res.json(gameRooms);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});

// Create Websocket server which will send and receive messages from the client to handle game logic
const wss = new WebSocketServer({ port: WS_PORT });

// TODO The difference between a user and a player is that a user can join a match, while a player is already in a match
// TODO Different matches will be available in the future
/**
 * This array will store users data
 * A player have:
 * - userName
 * - socket
 */
let users: Users = new Map();

/**
 * This array will store trucMatches
 * TODO It currently only stores one trucMatch.
 */
// This contains a truc match
let gameManager = new GameManager();

// This conaints messages and userName so we can access from everywhere
let message: Message;
let messageUserName: string;

wss.on("connection", (ws: WebSocket) => {
  // Save user id
  const userId = crypto.randomUUID();
  users.set(userId, { userName: "", socket: ws, connectedMatchId: "" });

  // Show any possible error
  ws.on("error", console.error);

  // Show client Info
  console.log("Client connected");

  ws.on("close", (code, reason) => {
    // Remove user from users array
    const user = users.get(userId);
    users.delete(userId);

    if (user?.connectedMatchId) {
      const trucMatch = gameManager.getMatch(user?.connectedMatchId);
      trucMatch!.deletePlayer(trucMatch!.getPlayerFromUser(user.userName)!);
    }
    console.log(reason.toString("utf8"));
  });

  ws.on("message", (data, isBinary) => {
    // First we convert the message to Message Object
    message = JSON.parse(data.toString());

    // Verify user's token
    let decodedToken; // Declared here because we will use it later
    try {
      decodedToken = jwt.verify(message.token, secretKey) as jwt.JwtPayload;
      //ws.send("TOKEN_VALID"); THERE IS NO NEED TO NOTIFY CLIENT IF HIS TOKEN IS VALID
    } catch (error) {
      //TODO THIS SHOULD BE CORRECTED
      ws.close(1000, "TOKEN_NOT_VALID");
      return;
    }

    // If token does not contain a payload, we close the connection
    if (typeof decodedToken === "string") {
      ws.close(1000, "TOKEN_NOT_VALID_NO_PAYLOAD");
      return;
    }

    // Get the username of the user who sended the message
    messageUserName = decodedToken.userName;

    //This will contain the Response Message
    let responseMessage: ResponseMessage;

    // Then we check message type
    switch (message.type) {
      // If message is a firstConnection
      case "firstConnection":
        // User will never be undefined, because we generate an id for each user in every connection
        const user = users.get(userId);
        // We push user to users array
        user!.userName = messageUserName;
        user!.socket = ws;

        return;
      case "startGame": {
        const matchId = gameManager.createMatch();
        //TODO CREATE MATCH ROOMS

        const trucMatch = gameManager.getMatch(matchId)!;

        // If there are not four users, game should not start...
        if (trucMatch.getNumPlayers() !== 4) {
          ws.send(
            JSON.stringify({
              type: "errorResponse",
              errorMessage: "There are not 4 users",
            } as ErrorResponse)
          );
          console.log("THERE ARE NOT 4 USERS on match " + matchId);
          return;
        }

        const gameState = trucMatch.getState();

        for (const user of users) {
          // Get player that correspond to iteration user
          const selfPlayerState = gameState.players.find(
            (player) => player.userName === user.userName
          );

          responseMessage = {
            type: "startGameResponse",
            data: gameState, // Adding the required 'data' property
            selfPlayerState: selfPlayerState,
          } as StartGameResponse;

          user.socket.send(JSON.stringify(responseMessage));
        }

        return;
      }
      //TODO Add score,gamePhase... etc, this should be sent later, once score has been calculated
      // start score counter
      // send shuffled cards to player with response message type newGameResponse and send initial score
      case "playerCall":
        /**
         * Handle playcalls. It should check match has already started
         * Get Player from username
         * call playcall method of trucmatch
         * if it does not throw an error, we send new game status to all users
         */
        break;
      case "playerPlay": {
        /**
         * Handle playerPlay. It should check match has already started
         * Check if match has started
         * Get Player from user Username
         * Call playcard method of trucmatch
         * if it does not throw an error, send new game status to all suers
         */
        if (!trucMatch) {
          responseMessage = {
            type: "errorResponse",
            errorMessage: "Truc Game has not started yet",
          } as ErrorResponse;
          ws.send(JSON.stringify(responseMessage));
          return;
        }

        // Check if there is any player on the match
        if (!trucMatch.isMatchStillGoing()) {
          responseMessage = {
            type: "errorResponse",
            errorMessage: "All players have left the match",
          } as ErrorResponse;
          ws.send(JSON.stringify(responseMessage));
          return;
        }

        const player = trucMatch.getPlayerFromUser(messageUserName);
        if (!player) {
          responseMessage = {
            type: "errorResponse",
            errorMessage: "User does not exist on this match",
          } as ErrorResponse;
          ws.send(JSON.stringify(responseMessage));
          return;
        }

        // Get thrown card id
        const cardId = (message as PlayerPlayMessage).data.thrownCard;

        try {
          trucMatch.playerPlay(player, cardId);
        } catch (e) {
          responseMessage = {
            type: "errorResponse",
            errorMessage:
              e instanceof Error ? e.message : "ERROR DURING PLAYERPLAY METHOD",
          } as ErrorResponse;
          ws.send(JSON.stringify(responseMessage));
        }

        const gameState = trucMatch.getState();
        let selfPlayerState;

        for (const user of users) {
          // Get player that correspond to iteration user
          selfPlayerState = gameState.players.find(
            (player) => player.userName === user.userName
          );

          // TODO This should change the player that thrown the card too to only update that on ui...
          responseMessage = {
            type: "stateUpdate",
            data: gameState, // Adding the required 'data' property
            state: gameState,
            selfPlayerState: selfPlayerState,
          } as StateResponse;

          user.socket.send(JSON.stringify(responseMessage));
        }

        return;
      }
    }
  });
});
