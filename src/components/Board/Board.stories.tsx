import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CubileteBoard } from './Board';
import { GameDirection, CubileteSymbol } from '../../types';

const SYM_VALUES: Record<CubileteSymbol, number> = { 
  '9': 1, '10': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 
};

function getBidValue(amount: number, symbol: CubileteSymbol): number {
  const baseValue = SYM_VALUES[symbol];
  return baseValue + (amount - 1) * 6;
}

// Stateful Wrapper component to enable interactive state updates inside Storybook sandbox
const InteractiveBoardWrapper = ({ G: initialG, ctx: initialCtx, playerID: _playerID, reset }: any) => {
  const [G, setG] = useState(initialG);
  const [ctx, setCtx] = useState(initialCtx);

  // Sync state when switching between stories
  useEffect(() => {
    setG(initialG);
    setCtx(initialCtx);
  }, [initialG, initialCtx]);

  const mockMoves = {
    handleDirectionChange: () => {
      setG((prev: any) => ({
        ...prev,
        direction: prev.direction === GameDirection.CLOCKWISE ? GameDirection.COUNTERCLOCKWISE : GameDirection.CLOCKWISE
      }));
    },
    submitBid: ({ amount, symbol }: { amount: number; symbol: CubileteSymbol }) => {
      const newValue = getBidValue(amount, symbol);
      
      setG((prevG: any) => {
        const nextG = {
          ...prevG,
          reRollsLeft: 1,
          currentBid: { amount, symbol, value: newValue, playerId: ctx.currentPlayer }
        };

        // Determine next active player based on direction
        const activePids = Object.keys(prevG.players).filter(pid => prevG.players[pid].diceCount > 0);
        const currentIndex = activePids.indexOf(ctx.currentPlayer);
        const dirStep = prevG.direction === GameDirection.CLOCKWISE ? 1 : -1;
        const nextIndex = (currentIndex + dirStep + activePids.length) % activePids.length;
        const nextPlayer = activePids[nextIndex];

        setCtx((prevCtx: any) => ({
          ...prevCtx,
          currentPlayer: nextPlayer
        }));

        return nextG;
      });
    },
    disbelieve: () => {
      setCtx((prev: any) => ({
        ...prev,
        phase: 'voting',
        activePlayers: { '0': 'voteStage', '1': 'voteStage', '2': 'voteStage' }
      }));
      setG((prevG: any) => ({
        ...prevG,
        challengerId: ctx.currentPlayer,
        votes: {
          [prevG.currentBid.playerId]: true, // El que pujó cree
          [ctx.currentPlayer]: false         // El que desafía no cree
        }
      }));
    },
    castVote: (believe: boolean, targetPlayerID?: string) => {
      setG((prevG: any) => {
        const nextVotes = { ...prevG.votes };
        const activePids = Object.keys(prevG.players).filter(pid => prevG.players[pid].diceCount > 0);
        const pid = targetPlayerID !== undefined ? targetPlayerID : activePids.find(p => nextVotes[p] === undefined);
        
        // Evitar que el que pujó o el que desafió cambien su voto
        if (pid === prevG.currentBid?.playerId || pid === prevG.challengerId) {
          return prevG;
        }

        if (pid !== undefined) {
          nextVotes[pid] = believe;
        }

        const updatedG = { ...prevG, votes: nextVotes };

        // If everyone has voted, transition
        if (Object.keys(nextVotes).length === activePids.length) {
          let total = 0;
          for (const pid in prevG.players) {
            total += prevG.players[pid].currentRoll.filter((s: string) => s === prevG.currentBid.symbol).length;
          }

          if (total === prevG.currentBid.amount - 1) {
            setCtx((c: any) => ({ ...c, phase: 'devilDice' }));
            updatedG.devilDiceResult = prevG.currentBid.symbol;
          } else {
            setCtx((c: any) => ({ ...c, phase: 'resolution' }));
          }
        }

        return updatedG;
      });
    },
    resolveDevilDice: () => {
      setCtx((prev: any) => ({ ...prev, phase: 'resolution' }));
    },
    reRollDice: (keepIndices: number[]) => {
      if (G.reRollsLeft <= 0) return;
      const pid = ctx.currentPlayer;
      const symbols: CubileteSymbol[] = ['9', '10', 'J', 'Q', 'K', 'A'];
      
      setG((prevG: any) => {
        const player = prevG.players[pid];
        const rollCount = player.hasQuintilla ? player.diceCount - 1 : player.diceCount;
        const newRoll = [...player.currentRoll];
        for (let d = 0; d < rollCount; d++) {
          if (!keepIndices.includes(d)) {
            newRoll[d] = symbols[Math.floor(Math.random() * 6)];
          }
        }

        // Check for Quintilla after re-roll
        let isQuintilla = player.hasQuintilla;
        let nextDiceCount = player.diceCount;
        if (!isQuintilla && newRoll.length >= 5 && newRoll.every(val => val === newRoll[0])) {
          isQuintilla = true;
          nextDiceCount += 1;
        }

        return {
          ...prevG,
          reRollsLeft: prevG.reRollsLeft - 1,
          players: {
            ...prevG.players,
            [pid]: {
              ...player,
              diceCount: nextDiceCount,
              hasQuintilla: isQuintilla,
              currentRoll: newRoll
            }
          }
        };
      });
    }
  };

  const handleReset = () => {
    if (reset) reset();
    setG(initialG);
    setCtx(initialCtx);
  };

  return <CubileteBoard G={G} ctx={ctx} moves={mockMoves as any} playerID={undefined} reset={handleReset} {...{} as any} />;
};

const meta: Meta<typeof CubileteBoard> = {
  title: 'Game/CubileteBoard',
  component: CubileteBoard,
  render: (args) => <InteractiveBoardWrapper {...args} />,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    reset: () => console.log('Reset clicked'),
    playerID: '0',
  },
};

export default meta;
type Story = StoryObj<typeof CubileteBoard>;

// ==========================================
// 🎨 1. Phase-Specific Dashboard Layouts
// ==========================================

// Story A: Fresh Round Setup (bidding Phase)
export const FreshRoundSetup: Story = {
  name: 'Story A: Fresh Round Setup',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'K'], hasQuintilla: false },
        '1': { diceCount: 5, currentRoll: ['A', 'A', '10', 'J', 'Q'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'K'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
      reRollsLeft: 1,
    },
    ctx: {
      numPlayers: 3,
      turn: 1,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null,
    } as any,
  },
};

// Story B: Mid-Bidding Table Escalation
export const MidBiddingTableEscalation: Story = {
  name: 'Story B: Mid-Bidding Table Escalation',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['Q', 'Q', '10', 'J', 'A'], hasQuintilla: false },
        '1': { diceCount: 5, currentRoll: ['A', '9', 'J', 'K', 'K'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'Q'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 3,
        symbol: 'Q',
        value: 16,
        playerId: '1',
      },
      votes: {},
      challengerId: null,
      devilDiceResult: null,
      reRollsLeft: 1,
    },
    ctx: {
      numPlayers: 3,
      turn: 4,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null,
    } as any,
  },
};

// Story C: Interrupted Flow: Collective Voting Overlay (voting Phase)
export const CollectiveVotingOverlay: Story = {
  name: 'Story C: Collective Voting Overlay',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['9', 'Q', 'K', 'A', '10'], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['10', 'J', 'Q', '9'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['Q', 'Q', 'Q', '10', 'J'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 4,
        symbol: 'Q',
        value: 22,
        playerId: '0',
      },
      votes: {
        '0': true,
        '1': false,
      },
      challengerId: '1',
      devilDiceResult: null,
      reRollsLeft: 0,
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '1',
      playOrder: ['0', '1', '2'],
      playOrderPos: 1,
      phase: 'voting',
      activePlayers: { '0': 'voteStage', '1': 'voteStage', '2': 'voteStage' },
    } as any,
  },
};

// ==========================================
// 🎲 2. The Mechanics Panel and Resolution States
// ==========================================

// Story D: The Devil's Dice Reveal (devilDice Phase) - Saved
export const DevilDiceRevealSaved: Story = {
  name: 'Story D: Devil\'s Dice Reveal (Saved)',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['K', '9', '10', '10', 'A'], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['K', 'J', 'Q', '9'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['K', 'K', 'J', '10', 'A'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 5,
        symbol: 'K',
        value: 29,
        playerId: '0',
      },
      votes: {
        '0': true,
        '1': false,
        '2': false,
      },
      challengerId: '1',
      devilDiceResult: 'K',
      reRollsLeft: 0,
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'devilDice',
      activePlayers: null,
    } as any,
  },
};

// Story D: The Devil's Dice Reveal (devilDice Phase) - Failed
export const DevilDiceRevealFailed: Story = {
  name: 'Story D: Devil\'s Dice Reveal (Failed)',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['K', '9', '10', '10', 'A'], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['K', 'J', 'Q', '9'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['K', 'K', 'J', '10', 'A'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 5,
        symbol: 'K',
        value: 29,
        playerId: '0',
      },
      votes: {
        '0': true,
        '1': false,
        '2': false,
      },
      challengerId: '1',
      devilDiceResult: 'A',
      reRollsLeft: 0,
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'devilDice',
      activePlayers: null,
    } as any,
  },
};

// Story E: The Round Revelation Scorecard (resolution Phase)
export const RoundRevelationScorecard: Story = {
  name: 'Story E: Round Revelation Scorecard',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['Q', 'Q', '9', '10', 'A'], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['Q', 'J', '10', '9'], hasQuintilla: false },
        '2': { diceCount: 5, currentRoll: ['9', '9', '10', 'J', 'A'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 4,
        symbol: 'Q',
        value: 22,
        playerId: '0',
      },
      votes: {
        '0': true,
        '1': false,
        '2': true,
      },
      challengerId: '1',
      devilDiceResult: null,
      reRollsLeft: 0,
    },
    ctx: {
      numPlayers: 3,
      turn: 6,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'resolution',
      activePlayers: null,
    } as any,
  },
};

// ==========================================
// ✨ 3. Visual Edge Cases and Buffers
// ==========================================

// Story F: The Quintilla Glow (Special Buffer)
export const QuintillaGlow: Story = {
  name: 'Story F: Quintilla Glow Buffer',
  args: {
    G: {
      players: {
        '0': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'K'], hasQuintilla: false },
        '1': { diceCount: 6, currentRoll: ['Q', 'Q', 'Q', 'Q', 'Q'], hasQuintilla: true },
        '2': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'K'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
      reRollsLeft: 1,
    },
    ctx: {
      numPlayers: 3,
      turn: 1,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null,
    } as any,
    playerID: '1',
  },
};

// Story G: End-of-Game Victory Screen (gameover State)
export const VictoryScreen: Story = {
  name: 'Story G: Victory Screen',
  args: {
    G: {
      players: {
        '0': { diceCount: 0, currentRoll: [], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['9', 'Q', 'A', 'J'], hasQuintilla: false },
        '2': { diceCount: 0, currentRoll: [], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
      reRollsLeft: 0,
    },
    ctx: {
      numPlayers: 3,
      turn: 14,
      currentPlayer: '1',
      playOrder: ['0', '1', '2'],
      playOrderPos: 1,
      phase: 'bidding',
      activePlayers: null,
      gameover: { winner: '1' },
    } as any,
  },
};
