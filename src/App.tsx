import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { CubileteVariation } from './Game';
import { CubileteBoard } from './components/Board/Board';

function App() {
  const [numPlayers, setNumPlayers] = useState(5);

  // Dynamic boardgame.io Client rebuild when player count changes
  const CubileteClient = React.useMemo(() => {
    return Client({
      game: CubileteVariation,
      board: CubileteBoard,
      numPlayers: numPlayers,
      debug: false, // Turn off default debug panel to favor our custom premium console
    });
  }, [numPlayers]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f3f4f6', position: 'relative' }}>
      {/* Player Count Configuration Selector */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '8px 14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Game Setup
        </span>
        <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <select
          value={numPlayers}
          onChange={(e) => setNumPlayers(parseInt(e.target.value))}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 24px 4px 10px',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '12px',
            minWidth: '100px'
          }}
        >
          <option value="2" style={{ backgroundColor: '#1e293b' }}>2 Players</option>
          <option value="3" style={{ backgroundColor: '#1e293b' }}>3 Players</option>
          <option value="4" style={{ backgroundColor: '#1e293b' }}>4 Players</option>
          <option value="5" style={{ backgroundColor: '#1e293b' }}>5 Players</option>
        </select>
      </div>

      <CubileteClient />
    </main>
  );
}

export default App;
