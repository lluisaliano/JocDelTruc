import { ChildrenProps } from "../types/params";

import "../styles/FooterMenu.css";

export function FooterMenu({ children }: ChildrenProps) {
  return <div className="footContainer">{children}</div>;
}
