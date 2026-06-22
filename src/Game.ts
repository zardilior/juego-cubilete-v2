import { Game } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { GameState, CubileteSymbol, GameDirection } from './types';

// Asignación de valores base según las reglas
const SYM_VALUES: Record<CubileteSymbol, number> = { 
  '9': 1, '10': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 
};

// Fórmula matemática oficial para evaluar las pujas consecutivas
function getBidValue(amount: number, symbol: CubileteSymbol): number {
  const baseValue = SYM_VALUES[symbol];
  return baseValue + (amount - 1) * 6;
}

export const CubileteVariation: Game<GameState> = {
  name: 'cubilete-variacion',

  setup: ({ ctx }): GameState => {
    const players: Record<string, any> = {};

    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i.toString()] = {
        diceCount: 5, // 5 dados iniciales por defecto
        currentRoll: [],
        hasQuintilla: false
      };
    }

    return {
      players,
      direction: GameDirection.CLOCKWISE, // Sentido horario por defecto
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null,
      reRollsLeft: 1
    };
  },

  phases: {
    bidding: {
      start: true,
      
      onBegin: ({ G, random }) => {
        const symbols: CubileteSymbol[] = ['9', '10', 'J', 'Q', 'K', 'A'];
        
        for (const pid in G.players) {
          if (G.players[pid].diceCount > 0) {
            const roll: CubileteSymbol[] = [];
            // Si tiene quintilla, el dado extra es un amortiguador y no se lanza
            const rollCount = G.players[pid].hasQuintilla 
              ? G.players[pid].diceCount - 1 
              : G.players[pid].diceCount;
            
            for (let d = 0; d < rollCount; d++) {
              const randomNum = random ? random.Number() : Math.random();
              const randomSym = symbols[Math.floor(randomNum * 6)];
              roll.push(randomSym);
            }
            G.players[pid].currentRoll = roll;

            // Regla de Quintilla (Mismo símbolo con al menos 5 dados)
            const isQuintilla = roll.length >= 5 && roll.every(val => val === roll[0]);
            if (isQuintilla && !G.players[pid].hasQuintilla) {
              G.players[pid].hasQuintilla = true;
              G.players[pid].diceCount += 1; // Dado extra amortiguador
            }
          }
        }
      },
      
      turn: {
        onBegin: ({ G }) => {
          G.reRollsLeft = 1;
        },
        order: {
          first: ({ ctx }) => ctx.playOrderPos,
          next: ({ G, ctx }) => {
            const dirStep = G.direction === GameDirection.CLOCKWISE ? 1 : -1;
            let nextPos = (ctx.playOrderPos + dirStep + ctx.numPlayers) % ctx.numPlayers;
            
            // Saltar automáticamente a los jugadores eliminados (0 dados)
            while (G.players[ctx.playOrder[nextPos]].diceCount === 0) {
              nextPos = (nextPos + dirStep + ctx.numPlayers) % ctx.numPlayers;
            }
            return nextPos;
          },
        },
      },

      moves: {
        reRollDice: ({ G, ctx, random }, keepIndices: number[]) => {
          if (G.reRollsLeft <= 0) return INVALID_MOVE;
          const pid = ctx.currentPlayer;
          const player = G.players[pid];
          const symbols: CubileteSymbol[] = ['9', '10', 'J', 'Q', 'K', 'A'];

          // Conteo estándar (ignora el dado extra buffer de Quintilla)
          const rollCount = player.hasQuintilla ? player.diceCount - 1 : player.diceCount;
          
          const newRoll: CubileteSymbol[] = [...player.currentRoll];
          for (let d = 0; d < rollCount; d++) {
            if (!keepIndices.includes(d)) {
              const randomNum = random ? random.Number() : Math.random();
              const randomSym = symbols[Math.floor(randomNum * 6)];
              newRoll[d] = randomSym;
            }
          }
          player.currentRoll = newRoll;
          G.reRollsLeft -= 1;

          // Verificar si saca Quintilla tras el re-lanzamiento
          const isQuintilla = newRoll.length >= 5 && newRoll.every(val => val === newRoll[0]);
          if (isQuintilla && !player.hasQuintilla) {
            player.hasQuintilla = true;
            player.diceCount += 1;
          }
        },

        handleDirectionChange: ({ G }) => {
          if (G.currentBid !== null) return INVALID_MOVE; // Solo antes de la primera puja
          G.direction = G.direction === GameDirection.CLOCKWISE 
            ? GameDirection.COUNTERCLOCKWISE 
            : GameDirection.CLOCKWISE;
        },

        submitBid: ({ G, ctx, events }, { amount, symbol }: { amount: number, symbol: CubileteSymbol }) => {
          const newValue = getBidValue(amount, symbol);
          
          if (G.currentBid !== null && newValue <= G.currentBid.value) {
            return INVALID_MOVE; // El valor de puja debe ser estrictamente mayor
          }

          G.currentBid = {
            amount,
            symbol,
            value: newValue,
            playerId: ctx.currentPlayer
          };
          
          events.endTurn();
        },

        disbelieve: ({ G, ctx, events }) => {
          if (G.currentBid === null) return INVALID_MOVE;
          G.challengerId = ctx.currentPlayer;
          G.votes = {
            [G.currentBid.playerId]: true, // El que pujó cree
            [ctx.currentPlayer]: false     // El que desafía no cree
          };

          const activePlayersCount = Object.values(G.players).filter(p => p.diceCount > 0).length;
          if (Object.keys(G.votes).length === activePlayersCount) {
            let realCount = 0;
            for (const pid in G.players) {
              const matches = G.players[pid].currentRoll.filter(s => s === G.currentBid!.symbol).length;
              realCount += matches;
            }
            if (realCount === G.currentBid.amount - 1) {
              events.setPhase('devilDice');
            } else {
              events.setPhase('resolution');
            }
          } else {
            events.setPhase('voting');
          }
        }
      }
    },

    voting: {
      turn: {
        activePlayers: { all: 'voteStage' }, // Activa a todos los jugadores en simultáneo
        stages: {
          voteStage: {
            moves: {
              castVote: ({ G, ctx, events, playerID }, believe: boolean, targetPlayerID?: string) => {
                const pID = targetPlayerID || playerID || ctx.currentPlayer;
                // Evitar que el que pujó o el que desafió cambien su voto predeterminado
                if (pID === G.currentBid?.playerId || pID === G.challengerId) {
                  return INVALID_MOVE;
                }
                G.votes[pID] = believe;
                
                const activePlayersCount = Object.values(G.players).filter(p => p.diceCount > 0).length;
                console.log(`[VOTE] Player: ${pID}, Voted: ${believe}, Current Votes:`, JSON.stringify(G.votes), `Active Players: ${activePlayersCount}`);
                
                // Si todos los jugadores que siguen en pie han enviado su voto
                if (Object.keys(G.votes).length === activePlayersCount) {
                  let realCount = 0;
                  for (const pid in G.players) {
                    const matches = G.players[pid].currentRoll.filter(s => s === G.currentBid!.symbol).length;
                    realCount += matches;
                  }
                  console.log(`[VOTE COMPLETED] Real Count: ${realCount}, Bid Amount: ${G.currentBid!.amount}`);

                  // Si el conteo real es exactamente 1 menos que la puja, se activa el Dado Maldito
                  if (realCount === G.currentBid!.amount - 1) {
                    console.log("[VOTE COMPLETED] Transitioning to devilDice");
                    events.setPhase('devilDice');
                  } else {
                    console.log("[VOTE COMPLETED] Transitioning to resolution");
                    events.setPhase('resolution');
                  }
                }
              }
            }
          }
        }
      }
    },

    devilDice: {
      onBegin: ({ G, random }) => {
        const symbols: CubileteSymbol[] = ['9', '10', 'J', 'Q', 'K', 'A'];
        const randomNum = random ? random.Number() : Math.random();
        G.devilDiceResult = symbols[Math.floor(randomNum * 6)];
      },
      moves: {
        resolveDevilDice: ({ events }) => {
          events.setPhase('resolution');
        }
      }
    },

    resolution: {
      onBegin: ({ G, events }) => {
        if (!G.currentBid) return;

        let realCount = 0;
        for (const pid in G.players) {
          realCount += G.players[pid].currentRoll.filter(s => s === G.currentBid!.symbol).length;
        }

        if (G.devilDiceResult && G.devilDiceResult === G.currentBid.symbol) {
          realCount += 1;
        }

        const bidAmount = G.currentBid.amount;

        for (const pid in G.players) {
          if (G.players[pid].diceCount === 0) continue;

          const votedBelieve = G.votes[pid];
          let loseDice = false;

          if (!votedBelieve) { 
            if (realCount >= bidAmount) loseDice = true;
          } else { 
            if (realCount < bidAmount) loseDice = true;
          }

          if (loseDice) {
            if (G.players[pid].hasQuintilla) {
              G.players[pid].hasQuintilla = false;
            }
            G.players[pid].diceCount -= 1;
          }
        }

        G.currentBid = null;
        G.devilDiceResult = null;
        G.votes = {};
        G.challengerId = null;

        const activePlayers = Object.keys(G.players).filter(pid => G.players[pid].diceCount > 0);
        if (activePlayers.length === 1) {
          events.endGame({ winner: activePlayers[0] });
        } else {
          events.setPhase('bidding');
        }
      }
    }
  }
};
