import { useState } from 'react';
import Game from './components/Game';
import Instructions from './components/Instructions';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Joc dels Pronoms Febles
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Practica els pronoms febles del català de manera divertida i educativa
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setGameStarted(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Començar a jugar
            </button>

            <button
              onClick={() => setShowInstructions(true)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Com es juga?
            </button>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            <p>Aprèn mentre jugues</p>
            <p className="mt-2">✓ Múltiples nivells de dificultat</p>
            <p>✓ Explicacions gramaticals</p>
            <p>✓ Intents il·limitats</p>
          </div>
        </div>

        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Joc dels Pronoms Febles
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowInstructions(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Com es juga?
              </button>
              <button
                onClick={() => setGameStarted(false)}
                className="text-gray-600 hover:text-gray-700 font-semibold transition-colors"
              >
                Sortir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="py-8">
        <Game />
      </main>

      {/* Instructions Modal */}
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-gray-600 text-sm">
        <p>Practica els pronoms febles del català</p>
        <p className="mt-2">Fet amb ❤️ per aprendre català</p>
      </footer>
    </div>
  );
}

export default App;
