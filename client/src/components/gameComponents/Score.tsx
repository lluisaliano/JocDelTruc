export function Score({ score }: { score: Record<"team1" | "team2", number> }) {
  return (
    <div className="score">
      <div className="team1">
        <h3>N:</h3>
        <p>{score.team1}</p>
      </div>
      <div className="team2">
        <h3>V:</h3>
        <p>{score.team2}</p>
      </div>
    </div>
  );
}
