import type { Meta, StoryObj } from '@storybook/react';
import { CubileteBoard } from './Board';
import { GameDirection } from '../../types';

const meta: Meta<typeof CubileteBoard> = {
  title: 'Game/CubileteBoard',
  component: CubileteBoard,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    reset: () => console.log('Reset clicked'),
    moves: {
      handleDirectionChange: () => console.log('handleDirectionChange called'),
      submitBid: (val: any) => console.log('submitBid called with', val),
      disbelieve: () => console.log('disbelieve called'),
      castVote: (believe: boolean) => console.log('castVote called with', believe),
      resolveDevilDice: () => console.log('resolveDevilDice called'),
    },
    playerID: '0', // View as Player 0 by default
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
        value: 16, // Calculated: 4 (Q base) + (3-1)*6 = 16
        playerId: '1',
      },
      votes: {},
      challengerId: null,
      devilDiceResult: null,
    },
    ctx: {
      numPlayers: 3,
      turn: 4,
      currentPlayer: '0', // It's Player 0's turn to escalate
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
        '0': true, // Player 0 has voted (believes their own bid)
      },
      challengerId: '1', // Player 1 declared "No Creo"
      devilDiceResult: null,
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
        value: 29, // 5 + (5-1)*6 = 29
        playerId: '0',
      },
      votes: {
        '0': true,
        '1': false,
        '2': false,
      },
      challengerId: '1',
      devilDiceResult: 'K', // Matching symbol! Saves the bidder
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
      devilDiceResult: 'A', // Different symbol! Fails to save the bidder
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
        '0': true,  // Believed (loses because only 3 Qs exist total)
        '1': false, // Disbelieved (survives because total count 3 < bid 4)
        '2': true,  // Believed (loses because total count 3 < bid 4)
      },
      challengerId: '1',
      devilDiceResult: null,
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
        '1': { diceCount: 6, currentRoll: ['Q', 'Q', 'Q', 'Q', 'Q'], hasQuintilla: true }, // Has +1 buffer life
        '2': { diceCount: 5, currentRoll: ['9', '10', 'J', 'Q', 'K'], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
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
    playerID: '1', // Focus view on Player 1 to see their card details clearly
  },
};

// Story G: End-of-Game Victory Screen (gameover State)
export const VictoryScreen: Story = {
  name: 'Story G: Victory Screen',
  args: {
    G: {
      players: {
        '0': { diceCount: 0, currentRoll: [], hasQuintilla: false },
        '1': { diceCount: 4, currentRoll: ['9', 'Q', 'A', 'J'], hasQuintilla: false }, // Winner
        '2': { diceCount: 0, currentRoll: [], hasQuintilla: false },
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
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
