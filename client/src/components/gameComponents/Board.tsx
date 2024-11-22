import { BoardProps } from "../../types/params";

import "../../styles/Board.css";

export function Board({ color, children }: BoardProps) {
  return (
    <div className={"container"} style={{ backgroundColor: color }}>
      {children}
    </div>
  );
}
