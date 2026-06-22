import { Client } from 'boardgame.io/react';
import { CubileteVariation } from './Game';
import { CubileteBoard } from './components/Board/Board';

const CubileteClient = Client({
  game: CubileteVariation,
  board: CubileteBoard,
  numPlayers: 3,
  debug: true,
});

function App() {
  return (
    <main>
      <CubileteClient />
    </main>
  );
}

export default App;
