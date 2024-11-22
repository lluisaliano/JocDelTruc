import { Login } from "./Login";

import { PageProps } from "../types/params";

export function EntryPage({ setAppPage }: PageProps) {
  return (
    <>
      <Login setAppPage={setAppPage}></Login>
    </>
  );
}
