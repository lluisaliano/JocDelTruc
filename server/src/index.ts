import express, { response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

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
const secretKey = process.env.SECRET_KEY as string;

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
let users: Users = [];

/**
 * This array will store trucMatches
 * TODO It currently only stores one trucMatch.
 */
// This contains a truc match
let trucMatch: TrucMatch | null = null;

// This conaints messages and userName so we can access from everywhere
let message: Message;
let messageUserName: string;

wss.on("connection", (ws) => {
  // Show any possible error
  ws.on("error", console.error);

  // Show client Info
  console.log("Client connected");

  ws.on("close", (code, reason) => {
    // Remove user from users array
    users = users.filter((user) => {
      return user.socket !== ws;
    });

    // Check if truc user is in a match and if it is, delete from players
    // TODO this should do for match of matches check players... when matches is implemented
    const player = trucMatch?.getPlayerFromUser(messageUserName);
    if (player) {
      trucMatch?.deletePlayer(player);
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

    // TODO THIS SHOULD BE CHANGED TO SPECIFY NUMBER OF USERS
    // If we have more than 4 users quit
    if (users.length >= 4) {
      ws.close(1000, "There cannot play more than 4 users");
    }

    //This will contain the Response Message
    let responseMessage: ResponseMessage;

    // Then we check message type
    switch (message.type) {
      // If message is a firstConnection
      case "firstConnection":
        // If user is already connected quit his old session and start a new one
        const existinUser = users.find(
          (user) => user.userName === messageUserName
        );
        if (existinUser) {
          // Close Connection
          existinUser.socket.close(
            1000,
            "New Session of your user has been started"
          );
          // Remove from users array
          users = users.filter((user) => {
            return user.userName !== messageUserName;
          });
        }
        // We push user to users array
        users.push({ userName: messageUserName, socket: ws });

        // TODO This is not working well, when a user joins, user name is not showed to already joined users
        // TODO Maybe it is a client error
        // We send new user's name to users
        responseMessage = {
          type: "newPlayerResponse",
          userName: messageUserName,
          self: false,
        } as NewPlayerResponse;
        for (const user of users) {
          // If player is sending his own self, we set property self to true
          //TODO We should inclue a team property to send userName of the team
          // TODO define Player.fing function as getPlayer method...
          if (user.userName === messageUserName) {
            user.socket.send(
              JSON.stringify({ ...responseMessage, self: true })
            );
          } else {
            user.socket.send(JSON.stringify(responseMessage));
          }
        }

        return;
      case "startGame": {
        // If there are not four users, game should not start...
        // TODO THIS SHOULD BE IMPROVED...
        if (users.length !== 4) {
          console.log("THERE ARE NOT 4 USERS");
        }
        // Create new match  sending userNames
        trucMatch = new TrucMatch(users.map((p) => p.userName));

        const gameState = trucMatch.getState();

        for (const user of users) {
          // Get player that correspond to iteration user
          const selfPlayerState = gameState.players.find(
            (player) => player.userName === user.userName
          );

          responseMessage = {
            type: "startGameResponse",
            data: gameState, // Adding the required 'data' property
            state: gameState,
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
