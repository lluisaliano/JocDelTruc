import { ChildrenProps } from "../types/params";
import "../styles/HeadMenu.css";

export function HeadMenu({ children }: ChildrenProps) {
  return <div className="headContainer">{children}</div>;
}
