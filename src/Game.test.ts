import { describe, test, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { CubileteVariation } from './Game';
import { GameDirection, CubileteSymbol } from './types';

// Asignación de valores base según las reglas
const SYM_VALUES: Record<CubileteSymbol, number> = { 
  '9': 1, '10': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 
};

// Formula helper to easily assert bid values in tests
function getBidValue(amount: number, symbol: CubileteSymbol): number {
  const baseValue = SYM_VALUES[symbol];
  return baseValue + (amount - 1) * 6;
}

function createTestClient(numPlayers: number = 3) {
  const client = Client({
    game: CubileteVariation,
    numPlayers,
  }) as any;

  // Custom helper to update the game state directly
  client.updateState = (newState: any) => {
    let G = newState.G;
    let ctx = newState.G?.ctx || newState.ctx;
    
    if (G && G.ctx) {
      G = { ...G };
      delete G.ctx;
    }

    const prevState = client.store.getState();
    const resolvedCtx = { ...(ctx || prevState.ctx) };

    // Automatically set activePlayers if forcing voting phase
    if (resolvedCtx.phase === 'voting' && !resolvedCtx.activePlayers) {
      resolvedCtx.activePlayers = {};
      Object.keys(G?.players || prevState.G.players).forEach(pid => {
        if ((G?.players || prevState.G.players)[pid].diceCount > 0) {
          resolvedCtx.activePlayers![pid] = 'voteStage';
        }
      });
    }

    const state = {
      ...prevState,
      ...newState,
      G: G || prevState.G,
      ctx: resolvedCtx,
    };

    client.store.dispatch({
      type: 'UPDATE',
      state,
      deltalog: []
    });
  };

  let originalCastVote: any = null;

  const wrapCastVote = () => {
    if (client.moves && client.moves.castVote) {
      originalCastVote = client.moves.castVote;
      
      client.moves.castVote = (believe: boolean) => {
        const state = client.store.getState();
        const players = state.G.players;
        const votes = state.G.votes || {};
        const activePlayerIds = Object.keys(players).filter(pid => players[pid].diceCount > 0);
        const nextVoter = activePlayerIds.find(pid => votes[pid] === undefined);
        
        if (nextVoter !== undefined) {
          const oldPID = client.playerID;
          client.playerID = nextVoter;
          client.createDispatchers();
          
          const res = originalCastVote(believe);
          
          client.playerID = oldPID;
          client.createDispatchers();
          return res;
        }
        return originalCastVote(believe);
      };
    }
  };

  const originalCreateDispatchers = client.createDispatchers;
  client.createDispatchers = () => {
    originalCreateDispatchers.call(client);
    wrapCastVote();
  };

  wrapCastVote();
  return client;
}

describe('Cubilete Game Logic - Comprehensive Test Suite', () => {

  // ==========================================
  // 🎯 1. Direction and Turn Order Tests
  // ==========================================
  describe('1. Direction and Turn Order Tests', () => {
    test('Test Case 1.1: Initial Direction Change', () => {
      const client = createTestClient();
      expect(client.store.getState()!.G.direction).toBe(GameDirection.CLOCKWISE);

      client.moves.handleDirectionChange();
      expect(client.store.getState()!.G.direction).toBe(GameDirection.COUNTERCLOCKWISE);
    });

    test('Test Case 1.2: Direction Change Lock', () => {
      const client = createTestClient();
      
      // Place a valid bid
      client.moves.submitBid({ amount: 1, symbol: '9' });
      expect(client.store.getState()!.G.currentBid).not.toBeNull();

      // Attempt to change direction (should be invalid)
      client.moves.handleDirectionChange();
      expect(client.store.getState()!.G.direction).toBe(GameDirection.CLOCKWISE);
    });

    test('Test Case 1.3: Normal Clockwise Progression', () => {
      const client = createTestClient();
      expect(client.store.getState()!.ctx.currentPlayer).toBe('0');

      client.moves.submitBid({ amount: 1, symbol: '9' });
      expect(client.store.getState()!.ctx.currentPlayer).toBe('1');
    });

    test('Test Case 1.4: Counter-Clockwise Progression', () => {
      const client = createTestClient(3); // 3-player game
      
      // Toggle direction to counter-clockwise before bidding
      client.moves.handleDirectionChange();
      
      client.moves.submitBid({ amount: 1, symbol: '9' });
      // In a 3-player counter-clockwise game starting at 0, the next player should be Player 2
      expect(client.store.getState()!.ctx.currentPlayer).toBe('2');
    });

    test('Test Case 1.5: Skipping Eliminated Players', () => {
      const client = createTestClient(3);

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['9'], hasQuintilla: false },
            '1': { diceCount: 0, currentRoll: [], hasQuintilla: false }, // Player 1 eliminated
            '2': { diceCount: 5, currentRoll: ['9'], hasQuintilla: false },
          }
        }
      });

      expect(client.store.getState()!.ctx.currentPlayer).toBe('0');
      
      // Player 0 bids and ends turn. It should skip Player 1 and go straight to Player 2
      client.moves.submitBid({ amount: 1, symbol: '9' });
      expect(client.store.getState()!.ctx.currentPlayer).toBe('2');
    });
  });

  // ==========================================
  // 🎲 2. Bidding Logic and Valuation Tests
  // ==========================================
  describe('2. Bidding Logic and Valuation Tests', () => {
    test('Test Case 2.1: Base Valuation Map Checking', () => {
      expect(getBidValue(1, '9')).toBe(1);
      expect(getBidValue(1, '10')).toBe(2);
      expect(getBidValue(1, 'J')).toBe(3);
      expect(getBidValue(1, 'Q')).toBe(4);
      expect(getBidValue(1, 'K')).toBe(5);
      expect(getBidValue(1, 'A')).toBe(6);
    });

    test('Test Case 2.2: Valid Quantity Increase', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 1, symbol: 'A' }); // value = 6
      expect(client.store.getState()!.G.currentBid?.value).toBe(6);

      client.moves.submitBid({ amount: 2, symbol: '9' }); // value = 1 + (2-1)*6 = 7
      expect(client.store.getState()!.G.currentBid?.amount).toBe(2);
      expect(client.store.getState()!.G.currentBid?.symbol).toBe('9');
    });

    test('Test Case 2.3: Valid Symbol Rank Increase', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 2, symbol: 'J' }); // value = 3 + 6 = 9
      expect(client.store.getState()!.G.currentBid?.value).toBe(9);

      client.moves.submitBid({ amount: 2, symbol: 'K' }); // value = 5 + 6 = 11
      expect(client.store.getState()!.G.currentBid?.symbol).toBe('K');
      expect(client.store.getState()!.G.currentBid?.value).toBe(11);
    });

    test('Test Case 2.4: Rejecting Lower or Equal Valued Bids', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 2, symbol: 'Q' }); // value = 4 + 6 = 10
      expect(client.store.getState()!.G.currentBid?.value).toBe(10);

      // Attempt lower bid: 1 As (value = 6)
      client.moves.submitBid({ amount: 1, symbol: 'A' });
      expect(client.store.getState()!.G.currentBid?.value).toBe(10); // remains unchanged

      // Attempt equal bid: 2 Queens (value = 10)
      client.moves.submitBid({ amount: 2, symbol: 'Q' });
      expect(client.store.getState()!.G.currentBid?.value).toBe(10); // remains unchanged
    });
  });

  // ==========================================
  // 🗳️ 3. Collective Voting Phase Tests
  // ==========================================
  describe('3. Collective Voting Phase Tests', () => {
    test('Test Case 3.1: Phase Transition on Challenge', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 2, symbol: 'Q' });
      client.moves.disbelieve();

      expect(client.store.getState()!.ctx.phase).toBe('voting');
      expect(client.store.getState()!.G.challengerId).toBe('1');
    });

    test('Test Case 3.2: Simultaneous Collective Votes', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 2, symbol: 'Q' });
      client.moves.disbelieve();

      // Only vote with 2 players so the round doesn't end and clear the votes map
      client.moves.castVote(true);  // player 0
      client.moves.castVote(false); // player 1

      const votes = client.store.getState()!.G.votes;
      expect(votes['0']).toBe(true);
      expect(votes['1']).toBe(false);
      expect(votes['2']).toBeUndefined();
    });

    test('Test Case 3.3: Waiting for All Active Votes', () => {
      const client = createTestClient();

      client.moves.submitBid({ amount: 2, symbol: 'Q' });
      client.moves.disbelieve();

      // Only 2 players vote (out of 3 active)
      client.moves.castVote(true);
      client.moves.castVote(false);

      expect(client.store.getState()!.ctx.phase).toBe('voting');
    });
  });

  // ==========================================
  // 😈 4. The Devil's Dice (Dado Maldito) Mechanics
  // ==========================================
  describe("4. The Devil's Dice (Dado Maldito) Mechanics", () => {
    test("Test Case 4.1: Devil's Dice Phase Trigger", () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false }, // 1 King
            '1': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false }, // 1 King
            '2': { diceCount: 5, currentRoll: ['K', 'K', '9', '9', '9'], hasQuintilla: false }, // 2 Kings
          },
          currentBid: { amount: 5, symbol: 'K', value: 29, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total actual count = 1 + 1 + 2 = 4 Kings. Bid is 5. Count (4) == Bid (5) - 1.
      client.moves.castVote(true);
      client.moves.castVote(false);
      client.moves.castVote(false);

      expect(client.store.getState()!.ctx.phase).toBe('devilDice');
    });

    test("Test Case 4.2: Devil's Dice Bypass", () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false }, // 1 King
            '1': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false }, // 1 King
            '2': { diceCount: 5, currentRoll: ['9', '9', '9', '9', '9'], hasQuintilla: false }, // 0 Kings
          },
          currentBid: { amount: 5, symbol: 'K', value: 29, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total actual count = 2 Kings. Bid is 5. Bypass since 2 !== 4.
      // It should immediately resolve and go back to bidding phase.
      client.moves.castVote(true);
      client.moves.castVote(false);
      client.moves.castVote(false);

      expect(client.store.getState()!.ctx.phase).toBe('bidding');
    });

    test("Test Case 4.3: Devil's Dice Saves the Bidder", () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false },
            '1': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false },
            '2': { diceCount: 5, currentRoll: ['K', 'K', '9', '9', '9'], hasQuintilla: false },
          },
          currentBid: { amount: 5, symbol: 'K', value: 29, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      client.moves.castVote(true);
      client.moves.castVote(false);
      client.moves.castVote(false);

      expect(client.store.getState()!.ctx.phase).toBe('devilDice');

      // Mock Devil's die to roll K
      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          devilDiceResult: 'K'
        }
      });

      client.moves.resolveDevilDice();

      // Total count becomes 4 + 1 = 5, matching the bid. Believers (who voted true) do not lose.
      // Disbelievers (voted false) lose.
      const finalG = client.store.getState()!.G;
      expect(finalG.players['0'].diceCount).toBe(5); // Voted true (believe) -> survives
      expect(finalG.players['1'].diceCount).toBe(4); // Voted false (disbelieve) -> loses
      expect(finalG.players['2'].diceCount).toBe(4); // Voted false (disbelieve) -> loses
    });

    test("Test Case 4.4: Devil's Dice Fails to Save", () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false },
            '1': { diceCount: 5, currentRoll: ['K', '9', '9', '9', '9'], hasQuintilla: false },
            '2': { diceCount: 5, currentRoll: ['K', 'K', '9', '9', '9'], hasQuintilla: false },
          },
          currentBid: { amount: 5, symbol: 'K', value: 29, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      client.moves.castVote(true);
      client.moves.castVote(false);
      client.moves.castVote(false);

      expect(client.store.getState()!.ctx.phase).toBe('devilDice');

      // Mock Devil's die to roll A (fails to match K)
      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          devilDiceResult: 'A'
        }
      });

      client.moves.resolveDevilDice();

      // Total count stays 4 < 5. Believers lose. Disbelievers survive.
      const finalG = client.store.getState()!.G;
      expect(finalG.players['0'].diceCount).toBe(4); // Voted true -> loses
      expect(finalG.players['1'].diceCount).toBe(5); // Voted false -> survives
      expect(finalG.players['2'].diceCount).toBe(5); // Voted false -> survives
    });
  });

  // ==========================================
  // 📊 5. Resolution, Scoring, and Special Rules
  // ==========================================
  describe('5. Resolution, Scoring, and Special Rules', () => {
    test('Test Case 5.1: Disbelievers Lose on Equal or Higher Count', () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['Q', 'Q', '9', '9', '9'], hasQuintilla: false }, // 2 Queens
            '1': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 Queen
            '2': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 Queen
          },
          currentBid: { amount: 4, symbol: 'Q', value: 22, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total actual count = 4 Queens. Bid is 4. (Count 4 >= Bid 4).
      client.moves.castVote(true);  // P0 survives
      client.moves.castVote(false); // P1 (disbeliever) should lose a die
      client.moves.castVote(false); // P2 (disbeliever) should lose a die

      const finalG = client.store.getState()!.G;
      expect(finalG.players['0'].diceCount).toBe(5);
      expect(finalG.players['1'].diceCount).toBe(4);
      expect(finalG.players['2'].diceCount).toBe(4);
    });

    test('Test Case 5.2: Believers Lose on Lower Count', () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 Queen
            '1': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 Queen
            '2': { diceCount: 5, currentRoll: ['9', '9', '9', '9', '9'], hasQuintilla: false }, // 0 Queens
          },
          currentBid: { amount: 4, symbol: 'Q', value: 22, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total actual count = 2 Queens. Bid is 4. (Count 2 < Bid 4).
      client.moves.castVote(true);  // P0 (believer) should lose a die
      client.moves.castVote(false); // P1 survives
      client.moves.castVote(false); // P2 survives

      const finalG = client.store.getState()!.G;
      expect(finalG.players['0'].diceCount).toBe(4);
      expect(finalG.players['1'].diceCount).toBe(5);
      expect(finalG.players['2'].diceCount).toBe(5);
    });

    test('Test Case 5.3: Quintilla Buffering Protection', () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 6, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: true }, // Has buffer
            '1': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false },
            '2': { diceCount: 5, currentRoll: ['9', '9', '9', '9', '9'], hasQuintilla: false },
          },
          currentBid: { amount: 4, symbol: 'Q', value: 22, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total count = 2 Queens. Bid is 4. Believers lose.
      client.moves.castVote(true);  // P0 (believer, has buffer)
      client.moves.castVote(false);
      client.moves.castVote(false);

      const finalG = client.store.getState()!.G;
      // Player 0 loses the Quintilla buffer, so hasQuintilla becomes false and diceCount goes from 6 to 5
      expect(finalG.players['0'].hasQuintilla).toBe(false);
      expect(finalG.players['0'].diceCount).toBe(5);
    });
  });

  // ==========================================
  // 🏆 6. Match Termination Tests
  // ==========================================
  describe('6. Match Termination Tests', () => {
    test('Test Case 6.1: Player Elimination', () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 1, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 life left
            '1': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false },
            '2': { diceCount: 5, currentRoll: ['9', '9', '9', '9', '9'], hasQuintilla: false },
          },
          currentBid: { amount: 4, symbol: 'Q', value: 22, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total count = 2. Bid = 4. Believers lose.
      client.moves.castVote(true); // P0 loses their last die
      client.moves.castVote(false);
      client.moves.castVote(false);

      const finalG = client.store.getState()!.G;
      expect(finalG.players['0'].diceCount).toBe(0); // Eliminated
    });

    test('Test Case 6.2: End Game / Victory Condition', () => {
      const client = createTestClient();

      client.updateState({
        ...client.store.getState(),
        G: {
          ...client.store.getState()!.G,
          players: {
            '0': { diceCount: 1, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false }, // 1 life left
            '1': { diceCount: 5, currentRoll: ['Q', '9', '9', '9', '9'], hasQuintilla: false },
            '2': { diceCount: 0, currentRoll: [], hasQuintilla: false }, // already eliminated
          },
          currentBid: { amount: 4, symbol: 'Q', value: 22, playerId: '0' },
          ctx: {
            ...client.store.getState()!.ctx,
            phase: 'voting'
          }
        }
      });

      // Total count = 2. Bid = 4. Believers lose.
      client.moves.castVote(true); // P0 loses their last die
      client.moves.castVote(false); // P1 (only active voter left)

      expect(client.store.getState()!.ctx.gameover).toEqual({ winner: '1' });
    });
  });
});
