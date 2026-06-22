import React, { useState } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { GameState, CubileteSymbol } from '../../types';

const SYM_VALUES: Record<CubileteSymbol, number> = { 
  '9': 1, '10': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 
};

function getBidValue(amount: number, symbol: CubileteSymbol): number {
  const baseValue = SYM_VALUES[symbol];
  return baseValue + (amount - 1) * 6;
}

const PLAYER_AVATARS: Record<string, { name: string; color: string; bg: string; border: string }> = {
  '0': { name: 'Alpha Ranger', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1' },
  '1': { name: 'Vortex Phantom', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '#10b981' },
  '2': { name: 'Nebula Sentinel', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: '#ec4899' },
};

const AnimationStyles = () => (
  <style>{`
    @keyframes pulse-gold {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); border-color: rgba(245, 158, 11, 1); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.5); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.3); }
    }
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    @keyframes pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    @keyframes rotate-maldito {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .glowing-gold {
      animation: pulse-gold 2s infinite;
    }
    .glowing-green {
      animation: pulse-green 1.5s infinite;
    }
    .glowing-red {
      animation: pulse-red 1.5s infinite;
    }
    .spin-maldito {
      animation: rotate-maldito 6s linear infinite;
    }
  `}</style>
);

export const CubileteBoard: React.FC<BoardProps<GameState>> = ({
  G,
  ctx,
  moves,
  playerID,
  reset,
}) => {
  const [bidAmount, setBidAmount] = useState<number>(1);
  const [bidSymbol, setBidSymbol] = useState<CubileteSymbol>('9');
  const [activeTabPlayer, setActiveTabPlayer] = useState<string>('0');

  const isGameOver = !!ctx.gameover;
  const currentPhase = ctx.phase;
  const currentPlayer = ctx.currentPlayer;

  const handleToggleDirection = () => {
    moves.handleDirectionChange();
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    moves.submitBid({ amount: bidAmount, symbol: bidSymbol });
  };

  const handleDisbelieve = () => {
    moves.disbelieve();
  };

  const handleVote = (_pid: string, believe: boolean) => {
    moves.castVote(believe);
  };

  const handleResolveDevilDice = () => {
    moves.resolveDevilDice();
  };

  // Helper to retrieve player info or defaults
  const getPlayerDetails = (pid: string) => {
    return PLAYER_AVATARS[pid] || { name: `Player ${pid}`, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af' };
  };

  // Bidding validity checks
  const nextBidValue = getBidValue(bidAmount, bidSymbol);
  const isBidValid = G.currentBid === null || nextBidValue > G.currentBid.value;

  const renderBiddingControls = () => {
    const isMyTurn = currentPlayer === playerID || !playerID;

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={styles.cardTitle}>Bidding Phase Controls</h3>
          <span style={{
            ...styles.badge,
            backgroundColor: isMyTurn ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isMyTurn ? '#38bdf8' : '#ef4444',
            borderColor: isMyTurn ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.3)'
          }}>
            {isMyTurn ? 'Your Action' : 'Waiting for Active Player'}
          </span>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="button"
            onClick={handleToggleDirection} 
            disabled={G.currentBid !== null || isGameOver}
            style={{
              ...styles.button,
              ...(G.currentBid === null ? styles.primaryButton : styles.disabledButton),
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {G.currentBid !== null ? '🔒 Direction Locked' : `🔄 Invert Direction (Current: ${G.direction})`}
          </button>
        </div>

        <form onSubmit={handleSubmitBid} style={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Dice Amount</label>
              <input 
                type="number" 
                min={1} 
                value={bidAmount} 
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 1)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Symbol</label>
              <select 
                value={bidSymbol} 
                onChange={(e) => setBidSymbol(e.target.value as CubileteSymbol)}
                style={styles.select}
              >
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="J">J (Jota)</option>
                <option value="Q">Q (Reina)</option>
                <option value="K">K (Rey)</option>
                <option value="A">A (As)</option>
              </select>
            </div>
          </div>

          <div style={styles.bidPreview}>
            <span>Proposed Bid Value:</span>
            <strong style={{ color: isBidValid ? '#34d399' : '#ef4444' }}>
              {nextBidValue} pts {G.currentBid ? `(Required > ${G.currentBid.value})` : ''}
            </strong>
          </div>

          <button 
            type="submit" 
            disabled={!isBidValid || isGameOver} 
            style={{
              ...styles.button,
              ...(isBidValid ? styles.successButton : styles.disabledButton),
              width: '100%',
              fontSize: '15px',
              fontWeight: 'bold'
            }}
          >
            Submit Bid
          </button>
        </form>

        {G.currentBid && (
          <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
            <button 
              onClick={handleDisbelieve} 
              disabled={isGameOver}
              style={{...styles.button, ...styles.dangerButton, width: '100%', fontWeight: 'bold'}}
            >
              ✋ Declaro "No Creo" (Challenge)
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderVotingOverlay = () => {
    const activeVoters = Object.keys(G.players).filter(pid => G.players[pid].diceCount > 0);
    const votesCast = G.votes || {};

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🗳️</span>
            <h2 style={{ margin: '10px 0 5px 0', color: '#f3f4f6' }}>Collective Voting Phase</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              Player <strong>{getPlayerDetails(G.challengerId || '').name}</strong> challenged the active bid.
            </p>
          </div>

          <div style={styles.bidHighlightBox}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Current Bid to Validate</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: '5px 0' }}>
              {G.currentBid?.amount} x {G.currentBid?.symbol}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              Bid placed by: {getPlayerDetails(G.currentBid?.playerId || '').name}
            </div>
          </div>

          <h4 style={{ color: '#f3f4f6', margin: '15px 0 8px 0', fontSize: '14px' }}>Active Voters Progress</h4>
          <div style={styles.voterList}>
            {activeVoters.map((pid) => {
              const hasVoted = votesCast[pid] !== undefined;
              const pInfo = getPlayerDetails(pid);
              return (
                <div key={pid} style={styles.voterRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      ...styles.avatarSmall,
                      backgroundColor: pInfo.bg,
                      color: pInfo.color,
                      borderColor: pInfo.border
                    }}>
                      {pid}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#f3f4f6' }}>{pInfo.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{pid === playerID ? 'You' : 'Opponent'}</div>
                    </div>
                  </div>
                  {hasVoted ? (
                    <span style={{
                      ...styles.badge,
                      backgroundColor: votesCast[pid] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: votesCast[pid] ? '#10b981' : '#ef4444',
                      borderColor: votesCast[pid] ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                    }}>
                      ✓ {votesCast[pid] ? 'Believes' : 'Disbelieves'}
                    </span>
                  ) : (
                    <span style={{
                      ...styles.badge,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#9ca3af',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}>
                      ⏳ Pending...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
            <h4 style={{ color: '#f3f4f6', margin: '0 0 10px 0', textAlign: 'center', fontSize: '13px' }}>
              Cast Your Vote
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={() => handleVote(playerID || '0', true)} 
                style={{...styles.button, ...styles.successButton, padding: '12px'}}
              >
                👍 Believe (Cree)
              </button>
              <button 
                onClick={() => handleVote(playerID || '0', false)} 
                style={{...styles.button, ...styles.dangerButton, padding: '12px'}}
              >
                👎 Disbelieve (No Cree)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDevilDiceControls = () => {
    const bidderId = G.currentBid?.playerId || '0';
    const bidderInfo = getPlayerDetails(bidderId);
    
    // Determine status of devil dice
    const isSaved = G.devilDiceResult === G.currentBid?.symbol;
    const glowClass = isSaved ? 'glowing-green' : 'glowing-red';

    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ display: 'inline-block', fontSize: '32px' }} className="spin-maldito">😈</span>
          <h3 style={{ ...styles.cardTitle, margin: '10px 0 0 0' }}>The Devil's Dice Reveal</h3>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '5px 0 0 0' }}>
            Challenged bid is short by exactly one die. Bidder gets a chance to be saved!
          </p>
        </div>

        <div style={styles.devilDiceDisplay}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              ...styles.avatarLarge,
              backgroundColor: bidderInfo.bg,
              color: bidderInfo.color,
              borderColor: bidderInfo.border
            }}>
              {bidderId}
            </div>
            <strong style={{ color: bidderInfo.color, fontSize: '14px' }}>{bidderInfo.name} (Bidder)</strong>
          </div>

          <div style={{ fontSize: '24px', color: '#9ca3af' }}>➔</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div 
              className={glowClass} 
              style={{
                ...styles.devilDieSlot,
                borderColor: isSaved ? '#10b981' : '#ef4444',
                color: isSaved ? '#10b981' : '#ef4444',
                backgroundColor: isSaved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}
            >
              {G.devilDiceResult || '?'}
            </div>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Maldito Die
            </span>
          </div>
        </div>

        <div style={{
          ...styles.devilResultBanner,
          backgroundColor: isSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isSaved ? '#34d399' : '#f87171',
          borderColor: isSaved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }}>
          {isSaved 
            ? `✨ Saved! Rolled matching "${G.devilDiceResult}" symbol.` 
            : `💀 Failed! Rolled "${G.devilDiceResult}" (needed "${G.currentBid?.symbol}").`
          }
        </div>

        <button 
          onClick={handleResolveDevilDice} 
          style={{
            ...styles.button, 
            ...styles.primaryButton, 
            width: '100%', 
            fontWeight: 'bold', 
            padding: '12px',
            marginTop: '15px'
          }}
        >
          Confirm & Resolve Round
        </button>
      </div>
    );
  };

  const renderResolutionScorecard = () => {
    if (!G.currentBid) {
      return (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resolution Phase</h3>
          <p style={{ color: '#9ca3af' }}>No current bid to resolve.</p>
        </div>
      );
    }

    let totalActualCount = 0;
    const breakdown: Record<string, { roll: CubileteSymbol[]; matching: number; vote: boolean | undefined; losesDie: boolean }> = {};

    // Count standard dice
    for (const pid in G.players) {
      if (G.players[pid].diceCount > 0) {
        const matchingDice = G.players[pid].currentRoll.filter(s => s === G.currentBid!.symbol).length;
        totalActualCount += matchingDice;
        breakdown[pid] = {
          roll: G.players[pid].currentRoll,
          matching: matchingDice,
          vote: G.votes[pid],
          losesDie: false
        };
      }
    }

    // Add Devil's Die if matched
    const isDevilMatched = G.devilDiceResult && G.devilDiceResult === G.currentBid.symbol;
    if (isDevilMatched) {
      totalActualCount += 1;
    }

    const bidAmount = G.currentBid.amount;

    // Calculate outcomes
    for (const pid in breakdown) {
      const vote = breakdown[pid].vote;
      let loses = false;
      if (vote === false) { // Disbelieve
        if (totalActualCount >= bidAmount) loses = true;
      } else { // Believe
        if (totalActualCount < bidAmount) loses = true;
      }
      breakdown[pid].losesDie = loses;
    }

    return (
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Round Revelation Scorecard</h3>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: 0 }}>
          Everyone lifted their cups! Let's check the quantities of symbol <strong>"{G.currentBid.symbol}"</strong>.
        </p>

        <div style={styles.scoreSummaryBox}>
          <div>
            <div style={styles.summaryLabel}>Active Bid</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{bidAmount} x {G.currentBid.symbol}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '15px' }}>
            <div style={styles.summaryLabel}>Total Found</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>
              {totalActualCount} x {G.currentBid.symbol}
              {isDevilMatched && <span style={{ fontSize: '11px', color: '#10b981' }}> (+1 Devil's Die)</span>}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '15px' }}>
            <div style={styles.summaryLabel}>Outcome</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: totalActualCount >= bidAmount ? '#10b981' : '#ef4444' }}>
              {totalActualCount >= bidAmount ? 'Bid Met' : 'Bid Failed'}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Player</th>
                <th style={styles.th}>Rolled Hand</th>
                <th style={styles.th}>Matches</th>
                <th style={styles.th}>Vote</th>
                <th style={styles.th}>Resolution Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(breakdown).map((pid) => {
                const pInfo = getPlayerDetails(pid);
                const pData = breakdown[pid];
                
                return (
                  <tr 
                    key={pid} 
                    style={{
                      ...styles.tr,
                      boxShadow: pData.losesDie 
                        ? 'inset 0 0 10px rgba(239, 68, 68, 0.08)' 
                        : 'inset 0 0 10px rgba(16, 185, 129, 0.05)',
                      borderColor: pData.losesDie ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          ...styles.avatarSmall,
                          backgroundColor: pInfo.bg,
                          color: pInfo.color,
                          borderColor: pInfo.border
                        }}>
                          {pid}
                        </div>
                        <span style={{ fontWeight: '500', color: pInfo.color }}>{pInfo.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {pData.roll.map((sym, i) => (
                          <span key={i} style={{
                            ...styles.die,
                            borderColor: sym === G.currentBid?.symbol ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                            backgroundColor: sym === G.currentBid?.symbol ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: sym === G.currentBid?.symbol ? '#38bdf8' : '#d1d5db'
                          }}>
                            {sym}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center', color: '#f3f4f6' }}>
                      <strong>{pData.matching}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: pData.vote ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: pData.vote ? '#38bdf8' : '#f59e0b',
                        borderColor: pData.vote ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                      }}>
                        {pData.vote ? 'Believe' : 'Disbelieve'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {pData.losesDie ? (
                        <span style={{ color: '#f87171', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          💥 Loses Die
                          <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#9ca3af' }}>
                            ({pData.vote ? 'Believed but failed' : 'Challenged but met'})
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontWeight: 'bold' }}>
                          🛡️ Saved
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVictoryScreen = () => {
    const winnerId = ctx.gameover?.winner || '0';
    const winnerInfo = getPlayerDetails(winnerId);

    return (
      <div style={styles.victoryContainer}>
        <div style={styles.victoryCard}>
          <div style={styles.victoryCup}>🏆</div>
          <h1 style={styles.victoryTitle}>Victory Achieved!</h1>
          <p style={styles.victorySubtitle}>The battle of dice has concluded.</p>

          <div style={styles.winnerProfile}>
            <div style={{
              ...styles.avatarLarge,
              backgroundColor: winnerInfo.bg,
              color: winnerInfo.color,
              borderColor: winnerInfo.border,
              width: '80px',
              height: '80px',
              lineHeight: '80px',
              fontSize: '36px',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
            }}>
              {winnerId}
            </div>
            <h2 style={{ color: winnerInfo.color, margin: '10px 0 0 0' }}>{winnerInfo.name}</h2>
            <span style={{ ...styles.badge, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              Sole Survivor
            </span>
          </div>

          <div style={styles.matchHistorySummary}>
            <h4 style={{ color: '#f3f4f6', margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
              Final Standings
            </h4>
            {Object.keys(G.players).map(pid => {
              const pDetails = getPlayerDetails(pid);
              const isWinner = pid === winnerId;
              return (
                <div key={pid} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: pDetails.color, fontWeight: isWinner ? 'bold' : 'normal' }}>
                    {pDetails.name} {isWinner ? '👑' : ''}
                  </span>
                  <span style={{ color: '#9ca3af' }}>
                    {G.players[pid].diceCount} dice remaining
                  </span>
                </div>
              );
            })}
          </div>

          <button onClick={() => reset?.()} style={{...styles.button, ...styles.primaryButton, width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold'}}>
            Play Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <AnimationStyles />
      
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.title}>Cubilete Variation</h1>
            <p style={styles.subtitle}>Developer Debugging Dashboard</p>
          </div>
          <button onClick={() => reset?.()} style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}>
            🔄 Reset Game State
          </button>
        </div>
      </header>

      {/* Global Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusCol}>
          <span style={styles.statusLabel}>Phase</span>
          <strong style={{ textTransform: 'uppercase', color: '#38bdf8' }}>{currentPhase}</strong>
        </div>
        <div style={styles.statusCol}>
          <span style={styles.statusLabel}>Active Player</span>
          <strong style={{ color: getPlayerDetails(currentPlayer).color }}>{getPlayerDetails(currentPlayer).name}</strong>
        </div>
        <div style={styles.statusCol}>
          <span style={styles.statusLabel}>Direction</span>
          <strong style={{ color: '#f3f4f6' }}>{G.direction}</strong>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Side: Game Board State & Players */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Active Bid Table</h3>
            {G.currentBid ? (
              <div style={styles.activeBidCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      ...styles.avatarSmall,
                      backgroundColor: getPlayerDetails(G.currentBid.playerId).bg,
                      color: getPlayerDetails(G.currentBid.playerId).color,
                      borderColor: getPlayerDetails(G.currentBid.playerId).border
                    }}>
                      {G.currentBid.playerId}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>Bidder</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f3f4f6' }}>
                        {getPlayerDetails(G.currentBid.playerId).name}
                      </div>
                    </div>
                  </div>
                  <span style={{ ...styles.badge, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                    Rank Value: {G.currentBid.value}
                  </span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f3f4f6', textAlign: 'center', padding: '15px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {G.currentBid.amount} x {G.currentBid.symbol}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                No bids placed yet this round. Waiting for first bid.
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Player Rosters</h3>
            <div style={styles.tabs}>
              {Object.keys(G.players).map(pid => {
                const pInfo = getPlayerDetails(pid);
                const isEliminated = G.players[pid].diceCount === 0;
                return (
                  <button
                    key={pid}
                    onClick={() => setActiveTabPlayer(pid)}
                    style={{
                      ...styles.tabButton,
                      borderBottom: activeTabPlayer === pid ? `2px solid ${pInfo.color}` : 'none',
                      color: activeTabPlayer === pid ? '#f3f4f6' : '#9ca3af',
                      fontWeight: activeTabPlayer === pid ? 'bold' : 'normal',
                      opacity: isEliminated ? 0.5 : 1
                    }}
                  >
                    Player {pid} {isEliminated ? '(Dead)' : ''}
                  </button>
                );
              })}
            </div>
            
            <div style={styles.tabContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <div style={styles.metaLabel}>Player Name</div>
                  <strong style={{ color: getPlayerDetails(activeTabPlayer).color, fontSize: '16px' }}>
                    {getPlayerDetails(activeTabPlayer).name}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.metaLabel}>Dice Count</div>
                  <strong style={{ color: '#f3f4f6', fontSize: '18px' }}>
                    {G.players[activeTabPlayer]?.diceCount}
                  </strong>
                </div>
              </div>

              {/* Special Quintilla buffer view */}
              {G.players[activeTabPlayer]?.hasQuintilla && (
                <div className="glowing-gold" style={styles.quintillaBuffer}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🌟</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>Quintilla Buffer Active</div>
                      <div style={{ fontSize: '10px', color: '#d1d5db' }}>Extra buffer life. Prevents next loss.</div>
                    </div>
                  </div>
                  <div style={{
                    ...styles.die,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    fontWeight: 'bold',
                    width: '32px',
                    height: '32px',
                    lineHeight: '32px',
                    margin: 0
                  }}>
                    +1
                  </div>
                </div>
              )}

              <div>
                <div style={{ ...styles.metaLabel, marginBottom: '8px' }}>Current Roll (Hidden to others)</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {G.players[activeTabPlayer]?.currentRoll && G.players[activeTabPlayer].currentRoll.length > 0 ? (
                    G.players[activeTabPlayer].currentRoll.map((sym, index) => (
                      <span key={index} style={styles.die}>{sym}</span>
                    ))
                  ) : (
                    <em style={{ color: '#9ca3af', fontSize: '13px' }}>None (Needs rolling)</em>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Game Action Controls */}
        <div style={styles.rightCol}>
          {isGameOver && renderVictoryScreen()}

          {!isGameOver && (
            <>
              {currentPhase === 'bidding' && renderBiddingControls()}
              {currentPhase === 'devilDice' && renderDevilDiceControls()}
              {currentPhase === 'resolution' && renderResolutionScorecard()}
            </>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>State Inspector</h3>
            <pre style={styles.pre}>
              {JSON.stringify({ G, ctx, playerID }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Conditional modal overlay for simultaneous voting phase */}
      {!isGameOver && currentPhase === 'voting' && renderVotingOverlay()}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    color: '#e5e7eb',
    backgroundColor: '#0b111e',
    minHeight: '100vh',
  },
  header: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '20px',
    paddingBottom: '12px',
  },
  title: {
    color: '#f3f4f6',
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
  },
  subtitle: {
    color: '#9ca3af',
    margin: '4px 0 0 0',
    fontSize: '14px',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 28, 45, 0.65)',
    padding: '12px 24px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  statusCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statusLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'rgba(22, 28, 45, 0.55)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(8px)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#f3f4f6',
    margin: '0 0 15px 0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#f3f4f6',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    color: '#0b111e',
    border: 'none',
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: '#6b7280',
    borderColor: 'rgba(255,255,255,0.03)',
    cursor: 'not-allowed',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#f3f4f6',
  },
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#f3f4f6',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    border: '1px solid transparent',
  },
  activeBidCard: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  emptyState: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: '30px 0',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  bidPreview: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '15px',
    gap: '10px',
  },
  tabButton: {
    padding: '8px 4px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
  },
  tabContent: {
    padding: '5px 0',
  },
  metaLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  die: {
    display: 'inline-block',
    width: '34px',
    height: '34px',
    lineHeight: '32px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#f3f4f6',
  },
  avatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '26px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid',
  },
  avatarLarge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '54px',
    fontSize: '24px',
    fontWeight: 'bold',
    border: '2px solid',
  },
  quintillaBuffer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px dashed #f59e0b',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '15px',
  },
  pre: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: '12px',
    borderRadius: '6px',
    overflowX: 'auto',
    maxHeight: '220px',
    fontSize: '11px',
    color: '#9ca3af',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    fontFamily: 'monospace',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    backdropFilter: 'blur(6px)',
  },
  modal: {
    backgroundColor: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
  },
  bidHighlightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '15px',
  },
  voterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  voterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  devilDiceDisplay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    margin: '20px 0',
  },
  devilDieSlot: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    border: '3px solid',
    textAlign: 'center',
    lineHeight: '50px',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  devilResultBanner: {
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '13px',
    border: '1px solid',
  },
  scoreSummaryBox: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '15px',
    gap: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  summaryLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    color: '#9ca3af',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '12px 10px',
    fontSize: '13px',
  },
  victoryContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#070a13',
    backgroundImage: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  victoryCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)',
  },
  victoryCup: {
    fontSize: '60px',
    marginBottom: '15px',
    filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
  },
  victoryTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: 0,
  },
  victorySubtitle: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '5px',
    marginBottom: '25px',
  },
  winnerProfile: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '25px',
  },
  matchHistorySummary: {
    textAlign: 'left',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '25px',
  },
};
