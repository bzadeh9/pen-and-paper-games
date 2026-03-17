interface GameStatsProps {
  orderWins: number;
  chaosWins: number;
  gamesPlayed: number;
  onReset: () => void;
}

export function GameStats({
  orderWins,
  chaosWins,
  gamesPlayed,
  onReset,
}: GameStatsProps) {
  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Statistics</h2>
        <button
          onClick={onReset}
          className="rounded-md bg-foreground/10 px-3 py-1 text-sm transition-colors hover:bg-foreground/20"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-foreground/60">Games Played:</span>
          <span className="font-semibold">{gamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Order Wins:</span>
          <span className="font-semibold text-powder-blush">{orderWins}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Chaos Wins:</span>
          <span className="font-semibold text-periwinkle">{chaosWins}</span>
        </div>
        {gamesPlayed > 0 && (
          <>
            <div className="my-2 border-t border-foreground/20" />
            <div className="flex justify-between">
              <span className="text-foreground/60">Order Win Rate:</span>
              <span className="font-semibold">
                {((orderWins / gamesPlayed) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Chaos Win Rate:</span>
              <span className="font-semibold">
                {((chaosWins / gamesPlayed) * 100).toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
