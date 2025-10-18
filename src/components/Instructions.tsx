import React from 'react';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Com es juga?</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            aria-label="Tancar"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Instruccions</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Llegeix la frase completa que apareix</li>
              <li>Escriu la versió curta utilitzant pronoms febles</li>
              <li>Clica "Comprovar" per veure si és correcta</li>
              <li>Si t'encalles, pots clicar "Veure solució"</li>
              <li>Llegeix l'explicació per aprendre la regla gramatical</li>
              <li>Continua amb la següent frase</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Exemples</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="font-semibold text-gray-700">Frase completa:</p>
                <p className="text-gray-600">"Dóna la pilota a mi"</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Frase curta:</p>
                <p className="text-gray-600 text-lg">"Dóna-me-la"</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 italic">
                  Els pronoms febles substitueixen els complements i s'ajunten al verb amb guions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Consells</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Posa atenció als guions i apòstrofs</li>
              <li>Els pronoms febles tenen un ordre específic</li>
              <li>Recorda les transformacions: em → me, el → 'l, etc.</li>
              <li>La resposta ha de ser exacta (inclosos guions i apòstrofs)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Nivells de dificultat</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="inline-block w-20 text-green-600 font-semibold">Fàcil:</span>
                <span className="text-gray-600">Pronoms simples amb verbs comuns</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-20 text-yellow-600 font-semibold">Mitjà:</span>
                <span className="text-gray-600">Combinacions de pronoms</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-20 text-red-600 font-semibold">Difícil:</span>
                <span className="text-gray-600">Combinacions complexes i casos especials</span>
              </div>
            </div>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Tancar
        </button>
      </div>
    </div>
  );
};

export default Instructions;
