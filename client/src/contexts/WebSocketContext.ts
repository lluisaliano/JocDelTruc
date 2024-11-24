import { createContext, MutableRefObject } from "react";

export const WebSocketContext = createContext<MutableRefObject<
  WebSocket | undefined
> | null>(null);
