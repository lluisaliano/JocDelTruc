import {
  HandleMssagesSetterProps,
  NewGameResponse,
  NewPlayerResponse,
  ResponseMessage,
} from "../types/messages";

export function handleMessages(
  event: MessageEvent,
  { setCurrentPlayerCards, setPlayers }: HandleMssagesSetterProps
) {
  // First we parse event data
  const message: ResponseMessage = JSON.parse(event.data);
  //TODO Receive Cards and Score
  console.log(message);
  switch (message.type) {
    case "startGameResponse":
      setCurrentPlayerCards((message as NewGameResponse).playerCards);
      return;
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
    }
  }
}
// setCurrentPlayerCards(message?.playerCards)
