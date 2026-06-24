import React, { useState, useEffect } from 'react';
import { BoardProps } from 'boardgame.io/react';
import { Stage, Container, Graphics, Text, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { GameState, CubileteSymbol } from '../../types';
import woodenTrayImg from '../../assets/wooden-tray.png';
import cubileteLeatherImg from '../../assets/cubilete-leather.png';

// Dynamically remove white backgrounds in the browser
const loadTransparentTexture = (url: string, threshold = 240): Promise<PIXI.Texture> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // If R, G, B are all above threshold (white/near-white), set alpha to 0
          if (data[i] > threshold && data[i + 1] > threshold && data[i + 2] > threshold) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(PIXI.Texture.from(canvas));
      } else {
        resolve(PIXI.Texture.from(img));
      }
    };
    img.onerror = () => resolve(PIXI.Texture.from(url));
  });
};

const SYM_VALUES: Record<CubileteSymbol, number> = { 
  '9': 1, '10': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 
};

const getHomeSlots = (numPlayers: number): Record<string, { x: number; y: number }> => {
  const slots: Record<string, { x: number; y: number }> = {
    '0': { x: 255, y: 265 }, // Bottom-center (Local)
  };

  if (numPlayers === 5) {
    slots['1'] = { x: 110, y: 165 };
    slots['2'] = { x: 185, y: 145 };
    slots['3'] = { x: 325, y: 145 };
    slots['4'] = { x: 400, y: 165 };
  } else if (numPlayers === 4) {
    slots['1'] = { x: 120, y: 160 };
    slots['2'] = { x: 255, y: 145 };
    slots['3'] = { x: 390, y: 160 };
  } else if (numPlayers === 3) {
    slots['1'] = { x: 170, y: 145 };
    slots['2'] = { x: 340, y: 145 };
  } else if (numPlayers === 2) {
    slots['1'] = { x: 255, y: 145 };
  }

  return slots;
}

function getBidValue(amount: number, symbol: CubileteSymbol): number {
  const baseValue = SYM_VALUES[symbol];
  return baseValue + (amount - 1) * 6;
}

const PLAYER_AVATARS: Record<string, { name: string; color: string; bg: string; border: string; hexColor: number }> = {
  '0': { name: 'Alpha Ranger', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', hexColor: 0x818cf8 },
  '1': { name: 'Vortex Phantom', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '#10b981', hexColor: 0x34d399 },
  '2': { name: 'Nebula Sentinel', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: '#ec4899', hexColor: 0xf472b6 },
  '3': { name: 'Solar Vanguard', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: '#f59e0b', hexColor: 0xfbbf24 },
  '4': { name: 'Lunar Shadow', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', border: '#8b5cf6', hexColor: 0xa78bfa },
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

// PixiJS Component: Draws a single interactive/animated die on the felt table
const FACE_SYMBOLS: Record<string, { top: string; right: string }> = {
  'A': { top: 'K', right: 'Q' },
  'K': { top: 'Q', right: 'J' },
  'Q': { top: 'J', right: '10' },
  'J': { top: '10', right: '9' },
  '10': { top: '9', right: 'A' },
  '9': { top: 'A', right: 'K' },
};

const getSymbolColor = (sym: string): string => {
  return sym === 'K' || sym === 'J' || sym === '9' ? '#dc2626' : '#1f2937';
};

interface PixiDieProps {
  symbol: CubileteSymbol | string;
  x: number;
  y: number;
  isQuintilla?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  scale?: number;
  rotation?: number;
  interactive?: boolean;
  pointertap?: () => void;
}

export const PixiDieComponent: React.FC<PixiDieProps> = ({
  symbol,
  x,
  y,
  isQuintilla = false,
  isHighlighted = false,
  isSelected = false,
  scale = 1,
  rotation = 0,
  interactive = false,
  pointertap,
}) => {
  const size = 50 * scale;

  const draw3DDie = React.useCallback((g: PIXI.Graphics) => {
    g.clear();

    // Determine colors based on state
    let frontFill = 0xffffff;
    let topFill = 0xf1f5f9;
    let rightFill = 0xe2e8f0;
    let border = 0x94a3b8;
    let borderWidth = 2;

    if (isQuintilla) {
      frontFill = 0xfef3c7;
      topFill = 0xfffbeb;
      rightFill = 0xfde68a;
      border = 0xd97706;
      borderWidth = 3;
    } else if (isSelected) {
      frontFill = 0xf0fdf4;
      topFill = 0xf0fdf4;
      rightFill = 0xdcfce7;
      border = 0x38bdf8;
      borderWidth = 3;
    } else if (isHighlighted) {
      frontFill = 0xe0f2fe;
      topFill = 0xe0f2fe;
      rightFill = 0xbae6fd;
      border = 0x0284c7;
      borderWidth = 3;
    }

    const fs = size * 0.72; // Front face size
    const fx = -fs / 2;
    const fy = -fs / 2 + size * 0.08;

    // 1. Draw Right Face (medium-light grey)
    g.beginFill(rightFill);
    g.lineStyle(borderWidth, border, 1);
    g.moveTo(fs / 2, fy); // Front-Top-Right
    g.lineTo(fs / 2 + size * 0.1, fy - size * 0.18); // Back-Top-Right
    g.lineTo(fs / 2 + size * 0.1, fy + fs - size * 0.18); // Back-Bottom-Right
    g.lineTo(fs / 2, fy + fs); // Front-Bottom-Right
    g.closePath();
    g.endFill();

    // 2. Draw Top Face (light grey)
    g.beginFill(topFill);
    g.lineStyle(borderWidth, border, 1);
    g.moveTo(fx, fy); // Front-Top-Left
    g.lineTo(fx + size * 0.1, fy - size * 0.18); // Back-Top-Left
    g.lineTo(fs / 2 + size * 0.1, fy - size * 0.18); // Back-Top-Right
    g.lineTo(fs / 2, fy); // Front-Top-Right
    g.closePath();
    g.endFill();

    // 3. Draw Front Face (pure white)
    g.beginFill(frontFill);
    g.lineStyle(borderWidth + 0.5, border, 1);
    g.drawRoundedRect(fx, fy, fs, fs, fs * 0.16);
    g.endFill();

    // Optional: Draw tiny dots accents if Quintilla
    if (isQuintilla) {
      g.beginFill(0xd97706);
      g.drawCircle(fx + 6, fy + 6, 2);
      g.drawCircle(fx + fs - 6, fy + 6, 2);
      g.drawCircle(fx + 6, fy + fs - 6, 2);
      g.drawCircle(fx + fs - 6, fy + fs - 6, 2);
      g.endFill();
    }
  }, [size, isQuintilla, isSelected, isHighlighted]);

  const topSym = FACE_SYMBOLS[symbol]?.top ?? 'K';
  const rightSym = FACE_SYMBOLS[symbol]?.right ?? 'Q';

  return (
    <Container 
      x={x} 
      y={isSelected ? y - 15 : y} 
      rotation={rotation}
      interactive={interactive}
      pointertap={pointertap}
    >
      <Graphics draw={draw3DDie} />
      
      {/* Top Face Symbol */}
      <Text
        text={topSym}
        anchor={0.5}
        x={size * 0.05}
        y={-size * 0.35}
        rotation={-0.3}
        style={new PIXI.TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 10 * scale,
          fontWeight: 'bold',
          fill: getSymbolColor(topSym),
          align: 'center',
        })}
      />

      {/* Right Face Symbol */}
      <Text
        text={rightSym}
        anchor={0.5}
        x={size * 0.41}
        y={-size * 0.02}
        rotation={0.3}
        style={new PIXI.TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 10 * scale,
          fontWeight: 'bold',
          fill: getSymbolColor(rightSym),
          align: 'center',
        })}
      />

      {/* Main Front Face Symbol */}
      <Text
        text={symbol}
        anchor={0.5}
        x={0}
        y={size * 0.08}
        style={new PIXI.TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 22 * scale,
          fontWeight: 'bold',
          fill: getSymbolColor(symbol),
          align: 'center',
        })}
      />
    </Container>
  );
};

// PixiJS Component: Circular Wood Tray background
const PixiFeltTable: React.FC<{ width: number; height: number; texture: PIXI.Texture | null }> = ({ width, height, texture }) => {
  if (!texture) return null;
  return (
    <Sprite
      texture={texture}
      width={width}
      height={height}
      x={0}
      y={0}
    />
  );
};

export const CubileteBoard: React.FC<BoardProps<GameState>> = ({
  G,
  ctx,
  moves,
  playerID,
  reset,
}) => {
  const [localPlayerID, setLocalPlayerID] = useState<string | null>(playerID);
  const [bidAmount, setBidAmount] = useState<number>(1);
  const [bidSymbol, setBidSymbol] = useState<CubileteSymbol>('9');
  const [selectedDiceIndices, setSelectedDiceIndices] = useState<number[]>([]);
  
  // Shaking dice animation state
  const [isDiceShaking, setIsDiceShaking] = useState(false);
  const [shakingOffsets, setShakingOffsets] = useState<Array<{ r: number; dx: number; dy: number }>>([]);

  const [activeTabPlayer, setActiveTabPlayer] = useState<string>('0');
  const [showDebug, setShowDebug] = useState(true);
  const [clickedCoords, setClickedCoords] = useState<{ x: number; y: number } | null>(null);
  const [liftedCups, setLiftedCups] = useState<Record<string, boolean>>({});

  const toggleCupLifted = (pid: string) => {
    setLiftedCups((prev) => ({
      ...prev,
      [pid]: !prev[pid],
    }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setClickedCoords({ x, y });
  };

  // Transparent textures state
  const [textures, setTextures] = useState<Record<string, PIXI.Texture | null>>({
    tray: null,
    leather: null,
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      loadTransparentTexture(woodenTrayImg),
      loadTransparentTexture(cubileteLeatherImg),
    ]).then(([trayTex, leatherTex]) => {
      if (isMounted) {
        setTextures({
          tray: trayTex,
          leather: leatherTex,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isGameOver = !!ctx.gameover;
  const currentPhase = ctx.phase;
  const currentPlayer = ctx.currentPlayer;

  // Sync local player ID if props change
  useEffect(() => {
    setLocalPlayerID(playerID);
  }, [playerID]);

  // Clear kept dice selection and automatically align the active tab to the current player when the turn changes
  useEffect(() => {
    setActiveTabPlayer(currentPlayer);
    setSelectedDiceIndices([]);
    if (!playerID) {
      setLocalPlayerID(currentPlayer);
    }
  }, [currentPlayer, playerID]);

  // Trigger shake when active player changes or a bid is submitted
  useEffect(() => {
    setIsDiceShaking(true);
    const interval = setInterval(() => {
      setShakingOffsets(
        Array.from({ length: 6 }, () => ({
          r: (Math.random() - 0.5) * 0.2,
          dx: (Math.random() - 0.5) * 8,
          dy: (Math.random() - 0.5) * 8,
        }))
      );
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsDiceShaking(false);
      setShakingOffsets([]);
    }, 700);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentPlayer, G.currentBid]);

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

  const handleVote = (pid: string, believe: boolean) => {
    moves.castVote(believe, pid);
  };

  const handleResolveDevilDice = () => {
    moves.resolveDevilDice();
  };

  const handleToggleDieSelect = (index: number) => {
    const isMyTurn = currentPlayer === localPlayerID || !localPlayerID;
    if (!isMyTurn || currentPhase !== 'bidding' || G.reRollsLeft <= 0 || activeTabPlayer !== currentPlayer) return;

    setSelectedDiceIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getGlobalDiceCounts = () => {
    const counts: Record<CubileteSymbol, number> = {
      '9': 0, '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0
    };
    for (const pid in G.players) {
      const roll = G.players[pid].currentRoll || [];
      roll.forEach((sym) => {
        if (counts[sym] !== undefined) {
          counts[sym]++;
        }
      });
    }
    return counts;
  };

  const getPlayerDetails = (pid: string) => {
    return PLAYER_AVATARS[pid] || { name: `Player ${pid}`, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af', hexColor: 0x9ca3af };
  };

  const nextBidValue = getBidValue(bidAmount, bidSymbol);
  const isBidValid = G.currentBid === null || nextBidValue > G.currentBid.value;

  const renderBiddingControls = () => {
    const isMyTurn = currentPlayer === localPlayerID || !localPlayerID;

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

        {isMyTurn && G.reRollsLeft > 0 && activeTabPlayer === currentPlayer && (
          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              onClick={() => {
                moves.reRollDice(selectedDiceIndices);
                setSelectedDiceIndices([]);
              }}
              style={{
                ...styles.button,
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                width: '100%',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🎲 Re-roll Unselected ({G.reRollsLeft} left)
            </button>
            <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '5px' }}>
              Click dice on the felt table to toggle KEEP (locks them from being re-rolled).
            </div>
          </div>
        )}

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
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{pid === localPlayerID ? 'You' : 'Opponent'}</div>
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
                    (!playerID || playerID === pid) ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleVote(pid, true)}
                          style={{
                            ...styles.button,
                            ...styles.successButton,
                            padding: '4px 8px',
                            fontSize: '11px',
                            height: 'auto',
                            width: 'auto'
                          }}
                        >
                          👍 Believe
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVote(pid, false)}
                          style={{
                            ...styles.button,
                            ...styles.dangerButton,
                            padding: '4px 8px',
                            fontSize: '11px',
                            height: 'auto',
                            width: 'auto'
                          }}
                        >
                          👎 Disbelieve
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        ...styles.badge,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#9ca3af',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}>
                        ⏳ Pending...
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {!playerID && (
            <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '15px' }}>
              💡 Local Dev Mode: Cast votes for each opponent using the buttons next to their names.
            </div>
          )}

          {playerID && votesCast[playerID] === undefined && (
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
              <h4 style={{ color: '#f3f4f6', margin: '0 0 10px 0', textAlign: 'center', fontSize: '13px' }}>
                Cast Your Vote
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => handleVote(playerID, true)} 
                  style={{...styles.button, ...styles.successButton, padding: '12px'}}
                >
                  👍 Believe (Cree)
                </button>
                <button 
                  type="button"
                  onClick={() => handleVote(playerID, false)} 
                  style={{...styles.button, ...styles.dangerButton, padding: '12px'}}
                >
                  👎 Disbelieve (No Cree)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDevilDiceControls = () => {
    const isSaved = G.devilDiceResult === G.currentBid?.symbol;

    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ display: 'inline-block', fontSize: '32px' }} className="spin-maldito">😈</span>
          <h3 style={{ ...styles.cardTitle, margin: '10px 0 0 0' }}>The Devil's Dice Reveal</h3>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '5px 0 0 0' }}>
            Challenged bid is short by exactly one die. Bidder gets a chance to be saved!
          </p>
        </div>

        <div style={{
          ...styles.devilResultBanner,
          backgroundColor: isSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isSaved ? '#34d399' : '#f87171',
          borderColor: isSaved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          marginBottom: '15px'
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

    const isDevilMatched = G.devilDiceResult && G.devilDiceResult === G.currentBid.symbol;
    if (isDevilMatched) {
      totalActualCount += 1;
    }

    const bidAmount = G.currentBid.amount;

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

  // Debug Helpers to draw alignment grid and bounding boxes
  const drawDebugGrid = React.useCallback((g: PIXI.Graphics) => {
    g.clear();
    
    // Draw vertical grid lines every 50px
    for (let x = 50; x < 510; x += 50) {
      const isCenter = Math.abs(x - 250) < 5;
      g.lineStyle(isCenter ? 2 : 1, isCenter ? 0xef4444 : 0x10b981, 0.4);
      g.moveTo(x, 0);
      g.lineTo(x, 320);
    }
    // Draw exact center line at 255
    g.lineStyle(2, 0x38bdf8, 0.6);
    g.moveTo(255, 0);
    g.lineTo(255, 320);

    // Draw horizontal grid lines every 50px
    for (let y = 50; y < 320; y += 50) {
      g.lineStyle(1, 0x10b981, 0.4);
      g.moveTo(0, y);
      g.lineTo(510, y);
    }
  }, []);

  const drawCupBounds = React.useCallback((g: PIXI.Graphics) => {
    g.clear();
    const numPlayers = Object.keys(G.players).length;
    const homeSlots = getHomeSlots(numPlayers);

    // Draw bounds for each slot
    Object.keys(G.players).forEach((pid) => {
      const slot = homeSlots[pid];
      if (!slot) return;

      const isActive = pid === activeTabPlayer;
      const w = isActive ? 180 : 120;
      const h = isActive ? 100 : 67;
      const cx = isActive ? 255 : slot.x;
      const cy = isActive ? 265 : slot.y;

      // Draw bounding box
      g.lineStyle(2, isActive ? 0xef4444 : 0xf59e0b, 0.8);
      g.drawRect(cx - w / 2, cy - h / 2, w, h);
      
      // Draw anchor point (center)
      g.beginFill(isActive ? 0xef4444 : 0xf59e0b);
      g.drawCircle(cx, cy, 3);
      g.endFill();
    });
  }, [G.players, activeTabPlayer]);

  // Helper to determine what to render inside the PixiJS canvas
  const renderPixiElements = () => {
    const numPlayers = Object.keys(G.players).length;
    const homeSlots = getHomeSlots(numPlayers);

    const leatherTex = textures.leather;
    if (!leatherTex) return null;

    return (
      <Container>
        {showDebug && <Graphics draw={drawDebugGrid} />}
        {showDebug && <Graphics draw={drawCupBounds} />}
        
        {/* Draw coordinate labels when debug is enabled */}
        {showDebug && (
          <Container>
            <Text text="x: 255 (Center)" x={260} y={10} style={new PIXI.TextStyle({ fill: '#38bdf8', fontSize: 10, fontFamily: 'Arial', fontWeight: 'bold' })} />
            {numPlayers === 5 && (
              <>
                <Text text="y: 145 (Inner Opponents)" x={10} y={130} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
                <Text text="y: 165 (Outer Opponents)" x={10} y={150} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
              </>
            )}
            {numPlayers === 4 && (
              <>
                <Text text="y: 145 (Center Opponent)" x={10} y={130} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
                <Text text="y: 160 (Outer Opponents)" x={10} y={150} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
              </>
            )}
            {numPlayers === 3 && (
              <Text text="y: 145 (Opponents)" x={10} y={130} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
            )}
            {numPlayers === 2 && (
              <Text text="y: 145 (Opponent)" x={10} y={130} style={new PIXI.TextStyle({ fill: '#f59e0b', fontSize: 10, fontFamily: 'Arial' })} />
            )}
            <Text text="y: 265 (Main Player)" x={10} y={270} style={new PIXI.TextStyle({ fill: '#ef4444', fontSize: 10, fontFamily: 'Arial', fontWeight: 'bold' })} />
          </Container>
        )}

        {/* 1. Render the player's dice pool (sits underneath the cup in Z-order) */}
        {Object.keys(G.players).map((pid) => {
          const pData = G.players[pid];
          const isEliminated = pData.diceCount === 0;
          const isActive = pid === activeTabPlayer;
          const isLifted = liftedCups[pid];

          if (isEliminated || !isLifted || !pData.currentRoll || pData.currentRoll.length === 0) {
            return null;
          }

          let targetX = homeSlots[pid]?.x ?? 255;
          let targetY = homeSlots[pid]?.y ?? 150;

          if (isActive) {
            targetX = 255;
            targetY = 265;
          }

          const k = pData.currentRoll.length;
          const spacing = isActive ? 22 : 14;
          const dieScale = isActive ? 0.55 : 0.35;

          return (
            <Container key={`dice-${pid}`}>
              {pData.currentRoll.map((symbol, idx) => {
                const dx = (idx - (k - 1) / 2) * spacing;
                const dy = (idx % 2 === 0 ? 2 : -2);

                return (
                  <PixiDieComponent
                    key={idx}
                    symbol={symbol}
                    x={targetX + dx}
                    y={targetY + dy}
                    scale={dieScale}
                  />
                );
              })}
            </Container>
          );
        })}

        {/* 2. Render the cups on top */}
        {Object.keys(G.players).map((pid) => {
          const cupTexture = leatherTex;
          const isEliminated = G.players[pid].diceCount === 0;
          const isActive = pid === activeTabPlayer;
          const isLifted = liftedCups[pid];

          let targetX = homeSlots[pid]?.x ?? 255;
          let targetY = homeSlots[pid]?.y ?? 150;
          let width = 120;
          let height = 67;
          let shakeX = 0;
          let shakeY = 0;
          let shakeRot = 0;

          if (isActive) {
            targetX = 255;
            targetY = 265; // Main cup goes further down in the bottom part of the tray
            width = 180;
            height = 100;
            shakeX = isDiceShaking ? (Math.random() - 0.5) * 15 : 0;
            shakeY = isDiceShaking ? (Math.random() - 0.5) * 15 : 0;
            shakeRot = isDiceShaking ? (Math.random() - 0.5) * 0.2 : 0;
          }

          const liftOffset = isActive ? 90 : 60;
          const cupY = isLifted ? targetY - liftOffset : targetY;

          return (
            <Sprite
              key={pid}
              texture={cupTexture}
              anchor={0.5}
              width={width}
              height={height}
              x={targetX + shakeX}
              y={cupY + shakeY}
              rotation={shakeRot}
              alpha={isEliminated ? 0.25 : 1}
              interactive={!isEliminated}
              pointertap={() => toggleCupLifted(pid)}
              cursor="pointer"
            />
          );
        })}
      </Container>
    );
  };

  // Suppress unused compiler warnings for temporary dice omission
  void shakingOffsets;
  void handleToggleDieSelect;

  return (
    <div style={styles.container}>
      <AnimationStyles />
      
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.title}>Cubilete Variation</h1>
            <p style={styles.subtitle}>{showDebug ? 'Developer Debugging Dashboard' : 'Premium Table View'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              style={{ 
                ...styles.button, 
                padding: '6px 12px', 
                fontSize: '12px',
                backgroundColor: showDebug ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: showDebug ? '#ef4444' : '#38bdf8',
                borderColor: showDebug ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'
              }}
            >
              {showDebug ? 'Hide Debug View' : 'Show Debug View'}
            </button>
          </div>
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
        <div style={{ ...styles.statusCol, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '15px' }}>
          <span style={styles.statusLabel}>Total Table Dice Counts</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
            {Object.entries(getGlobalDiceCounts()).map(([sym, count]) => (
              <div key={sym} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px',
                color: '#f3f4f6'
              }}>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{sym}</span>
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Side: Game Board State & Players */}
        <div style={styles.leftCol}>
          {/* PixiJS Interactive Felt Table Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Game Board (Wooden Table Tray)</h3>
            <div style={styles.feltContainer}>
              <div 
                style={{ position: 'relative', width: '510px', height: '320px', cursor: 'crosshair' }}
                onClick={handleCanvasClick}
              >
                <Stage 
                  width={510} 
                  height={320} 
                  options={{ backgroundAlpha: 0, antialias: true }}
                >
                  <PixiFeltTable width={510} height={320} texture={textures.tray} />
                  {renderPixiElements()}
                </Stage>

                {/* HTML Coordinate Overlay Tooltip */}
                {clickedCoords && (
                  <>
                    {/* Crosshair Dot */}
                    <div style={{
                      position: 'absolute',
                      left: `${clickedCoords.x}px`,
                      top: `${clickedCoords.y}px`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      border: '1.5px solid #ffffff',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.9)',
                      zIndex: 9
                    }} />

                    {/* Tooltip Label */}
                    <div style={{
                      position: 'absolute',
                      left: `${clickedCoords.x}px`,
                      top: `${clickedCoords.y}px`,
                      transform: 'translate(-50%, -130%)',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      X: {clickedCoords.x}, Y: {clickedCoords.y}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Player Rosters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(G.players).map(pid => {
                const pInfo = getPlayerDetails(pid);
                const pData = G.players[pid];
                const isEliminated = pData.diceCount === 0;
                const isCurrentTurn = pid === currentPlayer;
                const isSelected = pid === activeTabPlayer;

                return (
                  <div 
                    key={pid}
                    onClick={() => setActiveTabPlayer(pid)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isSelected 
                        ? `1px solid ${pInfo.color}` 
                        : isCurrentTurn 
                          ? '1px dashed rgba(56, 189, 248, 0.4)' 
                          : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isEliminated ? 0.4 : 1,
                    }}
                  >
                    {/* Header: Avatar, Name, Turn Indicator, Dice Count */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          ...styles.avatarSmall,
                          backgroundColor: pInfo.bg,
                          color: pInfo.color,
                          borderColor: pInfo.border,
                          width: '26px',
                          height: '26px',
                          lineHeight: '24px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {pid}
                        </div>
                        <span style={{ fontWeight: 'bold', color: pInfo.color, fontSize: '13.5px' }}>
                          {pInfo.name}
                        </span>
                        {isCurrentTurn && (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Turn
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Dice:</span>
                        <strong style={{ color: '#f3f4f6', fontSize: '14px' }}>
                          {pData.diceCount}
                        </strong>
                      </div>
                    </div>

                    {/* Body: Rolled Dice Pool */}
                    {!isEliminated && pData.currentRoll && pData.currentRoll.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Roll:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {pData.currentRoll.map((symbol, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: '#ffffff',
                                border: '1.5px solid #cbd5e1',
                                borderBottom: '2.5px solid #94a3b8',
                                borderRadius: '4px',
                                color: getSymbolColor(symbol),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              }}
                            >
                              {symbol}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : !isEliminated ? (
                      <div style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>
                        No active roll (waiting)
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '500', marginTop: '2px' }}>
                        💀 Eliminated
                      </div>
                    )}
                  </div>
                );
              })}
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

          {showDebug && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <h3 style={{ ...styles.cardTitle, margin: 0 }}>Debug & Developer Tools</h3>
                <button onClick={() => reset?.()} style={{ ...styles.button, padding: '4px 8px', fontSize: '11px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  🔄 Reset Game State
                </button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Simulate Player View:</span>
                <select
                  value={localPlayerID || 'spectator'}
                  onChange={(e) => setLocalPlayerID(e.target.value === 'spectator' ? null : e.target.value)}
                  style={{
                    ...styles.select,
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#f3f4f6',
                    borderColor: 'rgba(255,255,255,0.1)',
                    height: 'auto',
                    width: 'auto'
                  }}
                >
                  <option value="0">Player 0 (Alpha)</option>
                  <option value="1">Player 1 (Vortex)</option>
                  <option value="2">Player 2 (Nebula)</option>
                  <option value="3">Player 3 (Solar)</option>
                  <option value="4">Player 4 (Lunar)</option>
                  <option value="spectator">Spectator (All)</option>
                </select>
              </div>

              {clickedCoords && (
                <div style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  color: '#38bdf8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <span>📍 Clicked: <strong>X: {clickedCoords.x}, Y: {clickedCoords.y}</strong></span>
                  <button 
                    onClick={() => setClickedCoords(null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'rgba(255,255,255,0.15)'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}

              <h4 style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>Raw State:</h4>
              <pre style={styles.pre}>
                {JSON.stringify({ G, ctx, playerID: localPlayerID }, null, 2)}
              </pre>
            </div>
          )}
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
  feltContainer: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#070a13',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
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
};
