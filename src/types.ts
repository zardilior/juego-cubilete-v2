export type CubileteSymbol = '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// Enum para el control de dirección del juego
export enum GameDirection {
  CLOCKWISE = 'CLOCKWISE',
  COUNTERCLOCKWISE = 'COUNTERCLOCKWISE'
}

export interface PlayerState {
  diceCount: number;         // Cantidad de dados actuales por jugador
  currentRoll: CubileteSymbol[]; // Resultados ocultos del lanzamiento de dados
  hasQuintilla: boolean;     // Buffer de amortiguación si saca quintilla
}

export interface Bid {
  amount: number;
  symbol: CubileteSymbol;
  value: number;             // Valor calculado por la fórmula matemática
  playerId: string;          // ID del jugador que realizó la puja
}

export interface GameState {
  players: Record<string, PlayerState>;
  direction: GameDirection;  // Uso del enum de dirección (CLOCKWISE / COUNTERCLOCKWISE)
  currentBid: Bid | null;    // Puja activa actual de la mesa
  votes: Record<string, boolean>; // Record con playerIDs -> booleans (true: Cree, false: No cree)
  challengerId: string | null;   // Jugador que inició el desafío de "No creo"
  devilDiceResult: CubileteSymbol | null; // Resultado del Dado Maldito si aplica
  reRollsLeft: number;           // Cantidad de re-lanzamientos disponibles en el turno actual
}
