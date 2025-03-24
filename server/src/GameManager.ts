import { TrucMatch } from "./game/TrucMatch.ts";
import { ResponseMessage } from "./types/messages.ts";

type matchData = {
  playersId: string[];
};

export class GameManager {
  //#TODO IMPROVE THIS TYPE
  private matches: Map<string, [TrucMatch, matchData]> = new Map();

  public createMatch(users: string[]): string {
    const id = `match_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newMatch = new TrucMatch(users, id);
    this.matches.set(id, [newMatch, { playersId: users }]);
    return id;
  }

  public applyMessage(message: ResponseMessage) {
    if (!message.id) {
      console.log("Message id is missing");
      return;
    }
    const match = this.matches.get(message.id);
    if (!match) {
      console.log(`Match with id ${message.id} not found`);
    }
    //TODO APPLY MESSAGE TO GAME
  }

  public getMatch(id: string): TrucMatch | undefined {
    return this.matches.get(id)?.[0];
  }

  public getAllMatchesIds(): string[] {
    return Array.from(this.matches.values()).map((match) =>
      match[0].getMatchId()
    );
  }
}
