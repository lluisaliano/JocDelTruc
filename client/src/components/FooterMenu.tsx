import { ChildrenProps } from "../types/params";

export function FooterMenu({ children }: ChildrenProps) {
  return <div className="footContainer">{children}</div>;
}
