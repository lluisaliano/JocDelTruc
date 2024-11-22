import { ResponseMessage } from "../types/messages";

export function handleMessages(event: MessageEvent) {
  // First we parse event data
  const message: ResponseMessage = JSON.parse(event.data);
  //TODO Receive Cards and Score
  console.log(message);
  if (message.type === "newGameResponse") {
    return message;
  }
}
