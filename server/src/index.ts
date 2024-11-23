import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

import { PlayerCards, Users } from "./types/game.ts";
import { AuthenticationData, RegisteredUsers } from "./types/api.ts";
import { TrucMatch } from "./game/TrucMatch";

const app = express();

const PORT = 3000;
const WS_PORT = 8080;

// Registered Users
const registeredUsers: RegisteredUsers = {
  lluis: "lolito",
  pere: "lolito",
};

// JWT Secret Key
const secretKey =
  "e1c6681060b348f2cb19b17cfd2b07c5b217956d43fe7fe0dd7737308287c6703fdfff15ca1f97018cf4e6aa4479aade9316a928d96fd2d03163f882c2ebebc5724be6160ae1dc791ea6ad50fbec498fa57a210eaab599d02ade4f7628ef309af9661ddcdefa391fd3ead3d39027e5d492b3a92feb4dbb36d5ba6db710d0d5f93db918c77483a76fd892987a53dc8dc996142d36ac76d3c0655ced4d9b4c2f29b8fa80bfab912be79dc1d998311e862bfc86f6eb8fc1b344b53ae6fddb0a54d2cc63019c6b59947bbda75fc753e6198a25ca23606b3be1fefbbe2a548aa09d5677c3480f12eac8bac0f716e3e215eb918101981b94d65bb9712c638bdbe66a39";

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

/**
 * This array will store users data
 * A player have:
 * - userName
 * - socket
 */
let users: Users;

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
    console.log(reason.toString("utf8"));
  });

  ws.on("message", (data, isBinary) => {
    // First we convert the message to Message Object
    const message = JSON.parse(data.toString());

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

    // We save the user first letter with upper case
    const userName = decodedToken.userName;

    // TODO THIS SHOULD BE CHANGED TO SPECIFY NUMBER OF USERS
    // If we have more than 4 users quit
    if (users.length >= 4) {
      ws.close(1000, "There cannot play more than 4 users");
    }

    // Then we check message type
    switch (message.type) {
      // If message is a firstConnection
      case "firstConnection":
        // If user is already connected quit his old session and start a new one
        const existinUser = users.find((user) => user.userName === userName);
        if (existinUser) {
          // Close Connection
          existinUser.socket.close(
            1000,
            "New Session of your user has been started"
          );
          // Remove from users array
          users = users.filter((user) => {
            return user.userName !== userName;
          });
        }
        // We push user to users array
        users.push({ userName: userName, socket: ws });

        // We send new user's name to users
        const responseMessage = {
          type: "newPlayerResponse",
          userName: userName,
          self: false,
        };
        for (const user of users) {
          // If player is sending his own self, we set property self to true
          //TODO We should inclue a team property to send userName of the team
          // TODO define Player.fing function as getPlayer method...
          if (user.userName === userName) {
            user.socket.send(
              JSON.stringify({ ...responseMessage, self: true })
            );
          } else {
            user.socket.send(JSON.stringify(responseMessage));
          }
        }

        break;
      case "startGame":
        // If there are not four users, game cannot be started
        if (users.length !== 4) {
          userName.socked.send("THERE ARE NOT 4 USERS");
        }
        // Create new match
        const trucMatch = new TrucMatch(users);

        // Assign cards to player
        for (const user of users) {
          const playerCards: PlayerCards = [];
          for (let i = 0; i <= 2; i++) {
            playerCards.push(shuffledDeck.pop()!);
          }
          // Store cards in player
          user.cards = playerCards;
          //TODO Add score,gamePhase... etc, this should be sent later, once score has been calculated
          const responseMessage = {
            type: "startGameResponse",
            playerCards: playerCards, // TODO This could be changed by play.cards
          };
          user.socket.send(JSON.stringify(responseMessage));
        }
      // start score counter
      // send shuffled cards to player with response message type newGameResponse and send initial score
    }
  });
});
