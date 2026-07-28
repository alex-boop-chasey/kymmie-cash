import { useGame } from '../hooks/useGame';

type GameApi = ReturnType<typeof useGame>;

const fmt = (n: number) => n.toLocaleString('en-US');

export default function Controls({
  game,
  onOpenPaytable,
}: {
  game: GameApi;
  onOpenPaytable: () => void;
}) {
  return (
    <div className="controls">
      <div className="meters">
        <div className="meter">
          <span className="meter-label">Credits</span>
          <span className="meter-value credits">{fmt(game.credits)}</span>
        </div>
        <div className="meter">
          <span className="meter-label">Bet</span>
          <span className="meter-value">{fmt(game.totalBet)}</span>
        </div>
        <div className="meter">
          <span className="meter-label">Win</span>
          <span className={`meter-value win ${game.winThisSpin > 0 ? 'flash' : ''}`}>
            {fmt(game.winThisSpin)}
          </span>
        </div>
      </div>

      <div className="control-row">
        <button
          className="btn btn-buy"
          onClick={game.buyBonus}
          disabled={!game.canBuyBonus}
          title={`Buy Hold & Spin for ${fmt(game.buyBonusCost)}`}
        >
          <span className="buy-label">BUY</span>
          <span className="buy-sub">{fmt(game.buyBonusCost)}</span>
        </button>

        <div className="bet-group">
          <button
            className="btn btn-round"
            onClick={() => game.changeBet(-1)}
            disabled={game.spinning || game.inFreeSpins || !game.canBetDown}
            aria-label="Decrease bet"
          >
            −
          </button>
          <div className="bet-display">
            <span className="bet-per-line">{fmt(game.betPerLine)}</span>
            <span className="bet-sub">/ line × {game.numLines}</span>
          </div>
          <button
            className="btn btn-round"
            onClick={() => game.changeBet(1)}
            disabled={game.spinning || game.inFreeSpins || !game.canBetUp}
            aria-label="Increase bet"
          >
            +
          </button>
          <button
            className="btn btn-max"
            onClick={game.maxBet}
            disabled={game.spinning || game.inFreeSpins || !game.canBetUp}
          >
            MAX
          </button>
        </div>

        <button
          className={`btn btn-spin ${game.inFreeSpins ? 'free' : ''}`}
          onClick={game.doSpin}
          disabled={!game.canSpin}
        >
          {game.spinning ? '···' : game.inFreeSpins ? 'FREE SPIN' : 'SPIN'}
        </button>

        <div className="aux-group">
          <button
            className={`btn btn-square ${game.turbo ? 'active' : ''}`}
            onClick={game.toggleTurbo}
            aria-label="Toggle turbo spin"
            title="Turbo spin"
          >
            ⚡
          </button>
          <button
            className={`btn btn-square ${game.autoplay ? 'active' : ''}`}
            onClick={game.toggleAutoplay}
            disabled={game.inFreeSpins}
            aria-label="Toggle autoplay"
            title="Autoplay"
          >
            AUTO
          </button>
          <button
            className={`btn btn-square ${game.muted ? '' : 'active'}`}
            onClick={game.toggleMute}
            aria-label="Toggle sound"
            title="Sound"
          >
            {game.muted ? '🔇' : '🔊'}
          </button>
          <button
            className="btn btn-square"
            onClick={onOpenPaytable}
            aria-label="Paytable"
            title="Paytable"
          >
            ℹ️
          </button>
        </div>
      </div>

      {game.credits < game.totalBet && !game.inFreeSpins && (
        <div className="broke-note">Out of credits — reload the page for a fresh 1,000 🍀</div>
      )}
    </div>
  );
}
