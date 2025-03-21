import { BoardProps } from "../../types/params";

import "../../styles/Board.css";

export function Board({ children }: BoardProps) {
  return (
    <div className={"container"}>
      {children}
      <img
        className="tableImage"
        src="/GameImages/GameTable.png"
        alt="Game Table"
      />
    </div>
  );
}
