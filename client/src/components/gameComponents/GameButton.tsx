import { GameButtonProps } from "../../types/params";

export function GameButton({ onClick, type }: GameButtonProps) {
  return (
    <button className="gameButton" onClick={onClick}>
      {type}
    </button>
  );
}
