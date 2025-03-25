import { Login } from "./Login";

import { EntryPageProps } from "../types/params";

export function EntryPage({ setAppPage }: EntryPageProps) {
  return (
    <>
      <Login setAppPage={setAppPage}></Login>
    </>
  );
}
