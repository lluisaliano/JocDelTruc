import {
  HandleMssagesSetterProps,
  StartGameResponse,
  NewPlayerResponse,
  ResponseMessage,
  ErrorResponse,
  StateResponse,
} from "../types/messages";
import { CardsOfPlayer } from "../types/params";

export function handleMessages(
  event: MessageEvent,
  {
    setCurrentPlayerCards,
    setPlayers,
    setThrownPlayerCards,
    setScore,
  }: HandleMssagesSetterProps
) {
  // First we parse event data
  const message: ResponseMessage = JSON.parse(event.data);
  //TODO Receive Cards and Score
  console.log(message);
  switch (message.type) {
    case "errorResponse":
      console.error((message as ErrorResponse).errorMessage);
      break;
    case "newPlayerResponse": {
      // Wrap in {} because we are declaring a variable
      //TODO TEAM SHOULD GO ON TOP ON THE BOARD, SERVER SHOULD SEND TEAM USERNAME TO DO THAT
      const castedMessage = message as NewPlayerResponse;
      // If player is itself, we put it on first position
      setPlayers((prev) => {
        // We will store player's user names with first letter in upper case
        const capitalizedUserName =
          castedMessage.userName.charAt(0).toUpperCase() +
          castedMessage.userName.slice(1);
        // If player already exists do not add it
        if (prev.find((player) => player === capitalizedUserName)) {
          return prev;
        }
        {
          return castedMessage.self
            ? [capitalizedUserName, ...prev]
            : [...prev, capitalizedUserName];
        }
      });
      return;
    }

    case "startGameResponse":
      setCurrentPlayerCards(
        (message as StartGameResponse).selfPlayerState.cards
      );
      return;

    case "stateUpdate": {
      const castedMessage = message as StateResponse;
      const thrownCards: CardsOfPlayer[] = [];
      for (const player of castedMessage.state.players) {
        // TODO This randomly assigns thrownCards. We need to handle position depending on team for this to work
        thrownCards.push(player.thrownCards);
      }
      console.log(thrownCards);

      // Set Player Cards
      setCurrentPlayerCards(
        (message as StartGameResponse).selfPlayerState.cards
      );

      // TODO This should only change the thrown card of the player that throw it
      // TODO To know it, the server should send it
      /**
       * Maybe not all players are connected yet
       * and one throws a card. In that case, we will return an empty array
       * to thrownCards of other players
       */
      setThrownPlayerCards(() => {
        return {
          bottom: thrownCards[0] ? thrownCards[0] : [],
          top: thrownCards[1] ? thrownCards[1] : [],
          right: thrownCards[2] ? thrownCards[2] : [],
          left: thrownCards[3] ? thrownCards[3] : [],
        };
      });
      setScore(() => {
        return {
          team1: castedMessage.state.score.team1,
          team2: castedMessage.state.score.team2,
        };
      });
    }
  }
}
